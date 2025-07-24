-- SQL Queries to Check student_payments Table

-- 1. Check if student_payments table exists
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'student_payments' 
    AND table_schema = 'public';

-- 2. Get table structure (columns, types, constraints)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'student_payments' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check all data in student_payments table
SELECT * FROM student_payments 
ORDER BY created_at DESC;

-- 4. Count total records
SELECT COUNT(*) as total_payments FROM student_payments;

-- 5. Get recent payments with student info
SELECT 
    sp.*,
    p.email as student_email,
    p.full_name as student_name,
    c.title as course_title
FROM student_payments sp
LEFT JOIN profiles p ON sp.student_id = p.id
LEFT JOIN courses c ON sp.course_id = c.id
ORDER BY sp.created_at DESC
LIMIT 10;

-- 6. Check payments by status
SELECT 
    payment_status,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM student_payments 
GROUP BY payment_status;

-- 7. Check for specific student (replace with actual email)
SELECT 
    sp.*,
    p.email,
    p.full_name
FROM student_payments sp
JOIN profiles p ON sp.student_id = p.id
WHERE p.email = 'test@gmail.com'
ORDER BY sp.created_at DESC;

-- 8. Check table constraints and foreign keys
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'student_payments';

-- 9. Check RLS policies on student_payments
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'student_payments';

-- 10. Check indexes on student_payments
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'student_payments';
