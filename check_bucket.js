import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.storage.getBucket('201_files');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Bucket config:', data);
  }
}

check();
