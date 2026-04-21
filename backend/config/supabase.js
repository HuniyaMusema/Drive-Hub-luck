const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Validate environment variables safely (do NOT crash app on load).
 * SUPABASE_SERVICE_ROLE_KEY is optional — the public client is sufficient
 * for basic operations. Missing it logs a warning, not an error.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing required environment variables:', {
    SUPABASE_URL: !!supabaseUrl,
    SUPABASE_ANON_KEY: !!supabaseAnonKey,
  });
}

if (!supabaseServiceKey) {
  console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set — admin client will be unavailable. Admin-only routes will not function.');
}

/**
 * Public Supabase client (safe for frontend-like queries)
 */
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase] Public client initialized.');
  } catch (error) {
    console.error('[Supabase] Failed to initialize public client:', error.message);
  }
}

/**
 * Admin Supabase client (full privileges)
 */
let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('[Supabase] Admin client initialized.');
  } catch (error) {
    console.error('[Supabase] Failed to initialize admin client:', error.message);
  }
}

module.exports = { supabase, supabaseAdmin };