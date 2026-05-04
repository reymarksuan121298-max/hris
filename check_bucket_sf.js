import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.storage.getBucket('incident_reports_sales');
  if (error) {
    console.error('Bucket Error:', error.message);
  } else {
    console.log('Bucket Info:', data);
  }
}

check();
