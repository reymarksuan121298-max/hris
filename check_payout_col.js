import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('cash_assistance_logs').select('payout_type').limit(1);
  if (error) {
    console.error('Error selecting payout_type:', error);
  } else {
    console.log('payout_type select worked');
  }
}

check();
