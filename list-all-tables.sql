-- List all tables in your Supabase database
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename;

-- Alternative: Get more detailed information about tables
SELECT 
    table_schema,
    table_name,
    table_type,
    is_insertable_into,
    is_typed
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth', 'storage')
ORDER BY table_schema, table_name;

-- Get table names with row counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "rows_inserted",
    n_tup_upd as "rows_updated", 
    n_tup_del as "rows_deleted"
FROM pg_stat_user_tables
ORDER BY schemaname, tablename;
