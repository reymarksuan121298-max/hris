-- ==========================================
-- COMPLETE DATABASE RESET SCRIPT
-- ==========================================
-- WARNING: This will permanently delete ALL your tables and ALL data in the public schema.
-- It will also delete ALL registered users in your authentication system.

-- 1. Wipe the entire 'public' schema (deletes all tables: employees, cases, tellers, etc.)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Restore default permissions for the public schema
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. Wipe the corrupted 'auth.users' table (Deletes ALL users to fix the "Database error")
TRUNCATE auth.users CASCADE;
