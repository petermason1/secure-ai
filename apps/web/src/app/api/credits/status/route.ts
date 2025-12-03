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
  // Credits account table
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
  // Credits transactions table
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

export async function GET(req: Request) {
  try {
    await ensureTables();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const db = getDb();
    // Find or create account
    let result = await db.execute({
      sql: `SELECT * FROM credits_accounts WHERE userId = :userId LIMIT 1`,
      args: { userId },
    });

    let account;
    if (result.rows.length === 0) {
      // Create new account
      const id = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO credits_accounts (id, userId, companyId, balance) VALUES (:id, :userId, :companyId, 0)`,
        args: { id, userId, companyId: companyId || null },
      });
      account = { id, userId, companyId, balance: 0, totalPurchased: 0, totalSpent: 0 };
    } else {
      account = {
        id: result.rows[0].id,
        userId: result.rows[0].userId,
        companyId: result.rows[0].companyId,
        balance: result.rows[0].balance,
        totalPurchased: result.rows[0].totalPurchased,
        totalSpent: result.rows[0].totalSpent,
      };
    }

    // Get recent transactions
    const transactions = await db.execute({
      sql: `SELECT * FROM credits_transactions WHERE accountId = :accountId ORDER BY createdAt DESC LIMIT 20`,
      args: { accountId: account.id },
    });

    return NextResponse.json({
      account,
      recentTransactions: transactions.rows.map((row) => ({
        id: row.id,
        type: row.type,
        amount: row.amount,
        description: row.description,
        metadata: row.metadata && typeof row.metadata === 'string' ? JSON.parse(row.metadata) : null,
        createdAt: row.createdAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

