import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.NEXT_SUPABASE_SECRET_KEY;

// 환경 변수 검증
if (!supabaseUrl || !supabaseSecretKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseSecretKey) missingVars.push('NEXT_SUPABASE_SECRET_KEY');

  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
    'Please create a .env.local file and add your Supabase credentials.\n' +
    'See .env.example for reference.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
