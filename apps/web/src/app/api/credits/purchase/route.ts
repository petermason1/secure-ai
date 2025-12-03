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
    const { userId, companyId, amount, paymentMethod, description } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    const db = getDb();

    // Find or create account
    let accountResult = await db.execute({
      sql: `SELECT * FROM credits_accounts WHERE userId = :userId LIMIT 1`,
      args: { userId },
    });

    let accountId: string;
    if (accountResult.rows.length === 0) {
      accountId = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO credits_accounts (id, userId, companyId, balance, totalPurchased) 
              VALUES (:id, :userId, :companyId, :amount, :amount)`,
        args: { id: accountId, userId, companyId: companyId || null, amount },
      });
    } else {
      accountId = accountResult.rows[0].id as string;
      const currentBalance = (accountResult.rows[0].balance as number) || 0;
      const currentPurchased = (accountResult.rows[0].totalPurchased as number) || 0;
      await db.execute({
        sql: `UPDATE credits_accounts 
              SET balance = balance + :amount, 
                  totalPurchased = totalPurchased + :amount,
                  updatedAt = datetime('now')
              WHERE id = :accountId`,
        args: { accountId, amount },
      });
    }

    // Record transaction
    const transactionId = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO credits_transactions (id, accountId, type, amount, description, metadata)
            VALUES (:id, :accountId, 'purchase', :amount, :description, :metadata)`,
      args: {
        id: transactionId,
        accountId,
        amount,
        description: description || `Purchased ${amount} credits`,
        metadata: JSON.stringify({ paymentMethod: paymentMethod || 'unknown' }),
      },
    });

    // Get updated balance
    const updated = await db.execute({
      sql: `SELECT balance, totalPurchased FROM credits_accounts WHERE id = :accountId`,
      args: { accountId },
    });

    return NextResponse.json({
      ok: true,
      transactionId,
      accountId,
      creditsAdded: amount,
      newBalance: updated.rows[0].balance,
      totalPurchased: updated.rows[0].totalPurchased,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

