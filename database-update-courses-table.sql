-- Updated Database Setup for Courses Table Integration
-- Run this in Supabase SQL Editor to update the system to use 'courses' table

-- First, check if the student_enrollments table needs to be updated
-- to reference the 'courses' table instead of 'courses_enhanced'

-- Update foreign key constraint if it exists and points to wrong table
DO $$
BEGIN
    -- Drop existing foreign key if it references courses_enhanced
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'student_enrollments' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'courses_enhanced'
        AND ccu.column_name = 'id'
    ) THEN
        ALTER TABLE student_enrollments DROP CONSTRAINT IF EXISTS student_enrollments_course_id_fkey;
        RAISE NOTICE 'Dropped old foreign key constraint referencing courses_enhanced';
    END IF;

    -- Add new foreign key constraint to reference 'courses' table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'student_enrollments' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'courses'
        AND ccu.column_name = 'id'
    ) THEN
        -- Check if courses table exists
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
            ALTER TABLE student_enrollments 
            ADD CONSTRAINT student_enrollments_course_id_fkey 
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key constraint referencing courses table';
        ELSE
            RAISE NOTICE 'Courses table does not exist - foreign key not created';
        END IF;
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists for courses table';
    END IF;
END $$;

-- Verify the courses table has the expected structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        RAISE NOTICE 'Courses table exists and will be used for fetching courses';
        
        -- Check if required columns exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'courses' AND column_name = 'title'
        ) THEN
            RAISE NOTICE 'Warning: courses table missing title column';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'courses' AND column_name = 'price'
        ) THEN
            RAISE NOTICE 'Warning: courses table missing price column';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'courses' AND column_name = 'status'
        ) THEN
            RAISE NOTICE 'Warning: courses table missing status column';
        END IF;
    ELSE
        RAISE NOTICE 'Warning: courses table does not exist - you need to create it first';
    END IF;
END $$;

-- Show current table status
SELECT 
    'courses' as table_name,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') 
        THEN (SELECT COUNT(*) FROM courses)::text 
        ELSE 'N/A' 
    END as record_count
UNION ALL
SELECT 
    'student_enrollments' as table_name,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_enrollments') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_enrollments') 
        THEN (SELECT COUNT(*) FROM student_enrollments)::text 
        ELSE 'N/A' 
    END as record_count
UNION ALL
SELECT 
    'student_payments' as table_name,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_payments') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status,
    CASE 
        WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_payments') 
        THEN (SELECT COUNT(*) FROM student_payments)::text 
        ELSE 'N/A' 
    END as record_count;

-- Show foreign key relationships
SELECT 
    tc.table_name,
    tc.constraint_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'student_enrollments' 
AND tc.constraint_type = 'FOREIGN KEY';

SELECT 'Database updated to use courses table instead of courses_enhanced!' as result;
