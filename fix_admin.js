import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvvmoxsvffuokzvhmjjf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dm1veHN2ZmZ1b2t6dmhtampmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMDk3OSwiZXhwIjoyMDg4ODg2OTc5fQ.B9RnCc8bLQXXVRWoOa4a0hpsYcbJXiofI2jIYPdY_i4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixUser() {
  console.log("Fetching users...");
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError);
  } else {
    const adminUser = users.users.find(u => u.email === 'admin@hris.corp');
    if (adminUser) {
      console.log("Found admin user, deleting...");
      await supabase.auth.admin.deleteUser(adminUser.id);
      console.log("Deleted corrupted user.");
    }
  }

  console.log("Creating new user properly...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@hris.corp',
    password: 'admin123',
    email_confirm: true
  });

  if (error) {
    console.error("Error creating user:", error);
  } else {
    console.log("Successfully created user!");
    console.log("User details:", data.user.id);
  }
}

fixUser();
