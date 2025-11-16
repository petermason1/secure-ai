/**
 * Unified Supabase Client
 * All departments use this client for database operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for user-facing operations (uses RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Helper to get the appropriate client
 * Use admin client in API routes, regular client in components
 */
export function getSupabaseClient(useAdmin = false) {
  if (useAdmin && supabaseAdmin) {
    return supabaseAdmin;
  }
  return supabase;
}

/**
 * Error handler for Supabase operations
 */
export function handleSupabaseError(error: any) {
  if (error?.code === 'PGRST116') {
    return { error: 'Not found', code: 404 };
  }
  if (error?.code === '23505') {
    return { error: 'Duplicate entry', code: 409 };
  }
  if (error?.code === '23503') {
    return { error: 'Foreign key violation', code: 400 };
  }
  return { error: error?.message || 'Database error', code: 500 };
}

