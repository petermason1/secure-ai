import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  }
  return createClient({ url, authToken: token });
}

async function ensureTables() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS credits_accounts (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      companyId TEXT,
      balance INTEGER DEFAULT 0,
      totalPurchased INTEGER DEFAULT 0,
      totalSpent INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS credits_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      accountId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT,
      metadata TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (accountId) REFERENCES credits_accounts(id)
    );
  `);
}

export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = await req.json();
    const { userId, amount, service, description, metadata } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    const db = getDb();

    // Find account
    const accountResult = await db.execute({
      sql: `SELECT * FROM credits_accounts WHERE userId = :userId LIMIT 1`,
      args: { userId },
    });

    if (accountResult.rows.length === 0) {
      return NextResponse.json({ error: 'Account not found. Purchase credits first.' }, { status: 404 });
    }

    const accountId = accountResult.rows[0].id as string;
    const currentBalance = (accountResult.rows[0].balance as number) || 0;

    if (currentBalance < amount) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          currentBalance,
          required: amount,
          shortfall: amount - currentBalance,
        },
        { status: 402 }
      );
    }

    // Deduct credits
    await db.execute({
      sql: `UPDATE credits_accounts 
            SET balance = balance - :amount,
                totalSpent = totalSpent + :amount,
                updatedAt = datetime('now')
            WHERE id = :accountId`,
      args: { accountId, amount },
    });

    // Record transaction
    const transactionId = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO credits_transactions (id, accountId, type, amount, description, metadata)
            VALUES (:id, :accountId, 'spend', :amount, :description, :metadata)`,
      args: {
        id: transactionId,
        accountId,
        amount,
        description: description || `Spent ${amount} credits on ${service || 'service'}`,
        metadata: JSON.stringify({ service, ...metadata }),
      },
    });

    // Get updated balance
    const updated = await db.execute({
      sql: `SELECT balance, totalSpent FROM credits_accounts WHERE id = :accountId`,
      args: { accountId },
    });

    return NextResponse.json({
      ok: true,
      transactionId,
      creditsSpent: amount,
      newBalance: updated.rows[0].balance,
      totalSpent: updated.rows[0].totalSpent,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

