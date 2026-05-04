import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvvmoxsvffuokzvhmjjf.supabase.co';
// Using the Service Role Key to bypass email confirmation and RLS
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dm1veHN2ZmZ1b2t6dmhtampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMDk3OSwiZXhwIjoyMDg4ODg2OTc5fQ.B9RnCc8bLQXXVRWoOa4a0hpsYcbJXiofI2jIYPdY_i4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  console.log("Setting up Admin User safely via Supabase API...");
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@hris.corp',
    password: 'admin123',
    email_confirm: true // Auto-confirm the email
  });

  if (error) {
    console.error("❌ Error creating user:", error.message);
    console.log("\nIf you see 'Database error checking email', please make sure you ran the latest schema.sql in your Supabase SQL Editor first to delete the corrupted record!");
  } else {
    console.log("✅ Successfully created admin@hris.corp!");
    
    // Add them to our public.users table as well
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        { id: data.user.id, email: 'admin@hris.corp', role: 'Admin' }
      ]);
      
    if (dbError && dbError.code !== '23505') { // Ignore unique constraint errors
      console.error("⚠️ Error linking to public.users table:", dbError.message);
    } else {
      console.log("✅ Admin successfully linked to the HRIS public.users table.");
      console.log("\nYou can now log in!");
    }
  }
}

setupAdmin();
