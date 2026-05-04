const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Requires Service Role for user creation

if (!supabaseServiceKey) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const defaultUsers = [
  { email: 'admin@hris.corp', password: 'admin123', username: 'admin', roleName: 'ADMIN' },
  { email: 'er@hris.corp', password: 'er123', username: 'employee_relations', roleName: 'EMPLOYEE_RELATIONS' },
  { email: 'sf@hris.corp', password: 'sf123', username: 'sales_force', roleName: 'SALES_FORCE' },
  { email: 'ld@hris.corp', password: 'ld123', username: 'learning_dev', roleName: 'LEARNING_AND_DEVELOPMENT' },
  { email: 'ops@hris.corp', password: 'ops123', username: 'operations_onboarding', roleName: 'OPERATIONS_ASSOCIATE_ONBOARDING' },
];

async function seedData() {
  console.log('🚀 Starting RBAC Seed Process...');

  for (const userData of defaultUsers) {
    console.log(`\nCreating user: ${userData.username}...`);

    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log(`- Auth user ${userData.email} already exists. Skipping creation.`);
        // Continue to profile sync just in case
      } else {
        console.error(`- Error creating auth user: ${authError.message}`);
        continue;
      }
    }

    const userId = authUser?.user?.id || (await supabase.from('profiles').select('id').eq('username', userData.username).single())?.data?.id;

    if (!userId) {
       // Try fetching by email if we couldn't create/find
       const { data: existing } = await supabase.rpc('get_user_id_by_email', { email_input: userData.email });
       // Note: rpc is just a fallback, usually admin.createUser returns the user even if they exist in some versions, 
       // but here it errors if exists.
       console.error(`- Could not resolve ID for ${userData.email}`);
       continue;
    }

    // 2. Resolve Role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', userData.roleName)
      .single();

    if (roleError || !roleData) {
      console.error(`- Role ${userData.roleName} not found in database. Run schema.sql first.`);
      continue;
    }

    // 3. Upsert Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: userData.username,
        role_id: roleData.id,
        updated_at: new Date()
      });

    if (profileError) {
      console.error(`- Error updating profile: ${profileError.message}`);
    } else {
      console.log(`- Profile and Role assigned successfully!`);
    }
  }

  console.log('\n✅ Seed Process Complete.');
}

seedData();
