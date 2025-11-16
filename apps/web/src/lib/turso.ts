/**
 * Turso Database Client
 * All departments use this client for database operations
 */

import { createClient } from '@libsql/client';

// Lazy initialization to avoid build-time errors
let tursoClient: ReturnType<typeof createClient> | null = null;

function getTursoClientInstance() {
  if (tursoClient) {
    return tursoClient;
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoAuthToken) {
    throw new Error('Missing Turso environment variables. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local');
  }

  tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  return tursoClient;
}

// Export getter that initializes on first use
export const turso = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getTursoClientInstance();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

/**
 * Helper to get the Turso client
 * Use this in API routes and server components
 */
export function getTursoClient() {
  return turso;
}

/**
 * Error handler for Turso operations
 */
export function handleTursoError(error: any) {
  if (error?.code === 'SQLITE_NOTFOUND') {
    return { error: 'Not found', code: 404 };
  }
  if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return { error: 'Duplicate entry', code: 409 };
  }
  if (error?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return { error: 'Foreign key violation', code: 400 };
  }
  return { error: error?.message || 'Database error', code: 500 };
}

