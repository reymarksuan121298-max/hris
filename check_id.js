import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('employees').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample row:', data[0]);
    if (data[0]) {
      console.log('ID type:', typeof data[0].id);
    }
  }
}

check();
