-- ==========================================
-- SUPABASE PERMISSIONS RESTORATION
-- ==========================================
-- When dropping and recreating the public schema, Supabase's default 
-- API roles (anon, authenticated, service_role) lose their access.
-- Run this query to restore them so your app and scripts can read/write data!

-- 1. Grant usage on the schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Grant access to all CURRENT tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Ensure FUTURE tables also get these permissions automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- 4. Finally, insert the admin into the public.users table since the script couldn't!
INSERT INTO public.users (id, email, role, created_at)
SELECT id, email, 'Admin', created_at 
FROM auth.users 
WHERE email = 'admin@hris.corp'
ON CONFLICT DO NOTHING;
