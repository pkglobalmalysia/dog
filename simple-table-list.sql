-- Simple list of all public tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Count total tables
SELECT COUNT(*) as total_tables 
FROM pg_tables 
WHERE schemaname = 'public';
