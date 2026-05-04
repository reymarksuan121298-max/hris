import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvvmoxsvffuokzvhmjjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dm1veHN2ZmZ1b2t6dmhtampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTA5NzksImV4cCI6MjA4ODg4Njk3OX0.6-3hziougXBKbLQZIPxSRoJnm5T79DeLfcmgMufEsyo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@hris.corp',
    password: 'admin123',
  });
  
  if (error) {
    console.error("Login failed:", error.message);
    console.error("Full error:", error);
  } else {
    console.log("Login successful!");
  }
}

testLogin();
