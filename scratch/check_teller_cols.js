import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  console.log('--- tellers ---');
  const { data: t1 } = await supabase.from('tellers').select('*').limit(1);
  if (t1 && t1[0]) Object.keys(t1[0]).forEach(k => console.log(k));
  
  console.log('\n--- tellersldn ---');
  const { data: t2 } = await supabase.from('tellersldn').select('*').limit(1);
  if (t2 && t2[0]) Object.keys(t2[0]).forEach(k => console.log(k));
}

check();
