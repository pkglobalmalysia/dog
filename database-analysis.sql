-- ================================================================
-- COMPREHENSIVE SUPABASE DATABASE ANALYSIS QUERY
-- ================================================================
-- This query will show all tables, columns, policies, indexes, functions, and triggers
-- Copy and paste this entire script into your Supabase SQL Editor

-- 1. ALL TABLES AND THEIR COLUMNS
SELECT 
    '=== TABLES AND COLUMNS ===' as section,
    null as table_name,
    null as column_info,
    null as details
UNION ALL
SELECT 
    'TABLE' as section,
    t.table_name,
    null as column_info,
    'Schema: ' || t.table_schema as details
FROM information_schema.tables t 
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'COLUMN' as section,
    c.table_name,
    c.column_name || ' (' || c.data_type || 
    CASE 
        WHEN c.character_maximum_length IS NOT NULL 
        THEN '(' || c.character_maximum_length || ')'
        ELSE ''
    END || 
    CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
    CASE WHEN c.column_default IS NOT NULL THEN ' DEFAULT ' || c.column_default ELSE '' END
    || ')' as column_info,
    'Position: ' || c.ordinal_position as details
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY section DESC, table_name, details;

-- 2. PRIMARY KEYS AND FOREIGN KEYS
SELECT 
    '=== CONSTRAINTS ===' as section,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type || 
    CASE 
        WHEN tc.constraint_type = 'FOREIGN KEY' THEN 
            ' -> ' || (
                SELECT r.unique_constraint_schema || '.' || r.unique_constraint_name 
                FROM information_schema.referential_constraints r 
                WHERE r.constraint_name = tc.constraint_name
            )
        ELSE ''
    END as details
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
ORDER BY tc.table_name, tc.constraint_type;

-- 3. INDEXES
SELECT 
    '=== INDEXES ===' as section,
    schemaname || '.' || tablename as table_name,
    indexname as index_name,
    indexdef as details
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. RLS POLICIES
SELECT 
    '=== RLS POLICIES ===' as section,
    schemaname || '.' || tablename as table_name,
    policyname as policy_name,
    'Command: ' || cmd || ' | Permissive: ' || permissive || 
    ' | Roles: ' || COALESCE(roles::text, 'public') as details
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. FUNCTIONS
SELECT 
    '=== FUNCTIONS ===' as section,
    n.nspname || '.' || p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    'Returns: ' || pg_get_function_result(p.oid) || 
    ' | Language: ' || l.lanname as details
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public'
    AND p.prokind = 'f'
ORDER BY p.proname;

-- 6. TRIGGERS
SELECT 
    '=== TRIGGERS ===' as section,
    event_object_schema || '.' || event_object_table as table_name,
    trigger_name,
    'Event: ' || event_manipulation || 
    ' | Timing: ' || action_timing || 
    ' | Action: ' || action_statement as details
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. TABLE SIZES AND ROW COUNTS
SELECT 
    '=== TABLE STATISTICS ===' as section,
    schemaname || '.' || relname as table_name,
    'Rows: ' || n_tup_ins || ' inserted, ' || n_tup_upd || ' updated, ' || n_tup_del || ' deleted' as stats,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) as size
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;

-- 8. SAMPLE DATA FROM KEY TABLES
SELECT 
    '=== SAMPLE DATA ===' as section,
    'profiles' as table_name,
    'id, email, role, approved' as columns,
    'Sample user profiles' as note
FROM profiles LIMIT 1;

SELECT * FROM profiles LIMIT 5;

SELECT 
    '=== SAMPLE DATA ===' as section,
    'assignments' as table_name,
    'id, title, course_id' as columns,
    'Sample assignments' as note
FROM assignments LIMIT 1;

SELECT * FROM assignments LIMIT 5;

SELECT 
    '=== SAMPLE DATA ===' as section,
    'courses' as table_name,
    'id, title, teacher_id' as columns,
    'Sample courses' as note
FROM courses LIMIT 1;

SELECT * FROM courses LIMIT 5;

-- Check if assignment_submissions table exists and show sample
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'assignment_submissions') THEN
        RAISE NOTICE 'assignment_submissions table exists';
    ELSE
        RAISE NOTICE 'assignment_submissions table DOES NOT exist';
    END IF;
END $$;

-- 9. RLS STATUS FOR ALL TABLES
SELECT 
    '=== RLS STATUS ===' as section,
    schemaname || '.' || tablename as table_name,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status,
    'Row Level Security status' as details
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
