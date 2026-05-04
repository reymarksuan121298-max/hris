import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('cash_assistance_logs').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    if (data[0]) {
      Object.keys(data[0]).forEach(key => console.log('COL:', key));
    }
  }
}

check();
