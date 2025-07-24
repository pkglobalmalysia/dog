-- Fix Database Schema Issues for Student Payment System
-- Run this in your Supabase SQL Editor

-- 1. ADD student_id column to student_payments table for direct student reference
-- This will make the system compatible with both enrollment-based and direct student payments
ALTER TABLE student_payments 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. Update existing payment records to populate student_id from enrollment_id
UPDATE student_payments 
SET student_id = se.student_id
FROM student_enrollments se
WHERE student_payments.enrollment_id = se.id
AND student_payments.student_id IS NULL;

-- 3. Add course_id column for direct course reference (if not exists)
ALTER TABLE student_payments 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

-- 4. Update existing payment records to populate course_id from enrollment
UPDATE student_payments 
SET course_id = se.course_id
FROM student_enrollments se
WHERE student_payments.enrollment_id = se.id
AND student_payments.course_id IS NULL;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_payments_student_id ON student_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_course_id ON student_payments(course_id);

-- 6. Update RLS policies to work with student_id column
DROP POLICY IF EXISTS "Students can view their own payments" ON student_payments;
CREATE POLICY "Students can view their own payments" ON student_payments
    FOR SELECT USING (
        auth.uid() = student_id OR
        EXISTS (
            SELECT 1 FROM student_enrollments se 
            WHERE se.id = student_payments.enrollment_id 
            AND se.student_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Students can insert their own payments" ON student_payments;
CREATE POLICY "Students can insert their own payments" ON student_payments
    FOR INSERT WITH CHECK (
        auth.uid() = student_id OR
        EXISTS (
            SELECT 1 FROM student_enrollments se 
            WHERE se.id = student_payments.enrollment_id 
            AND se.student_id = auth.uid()
        )
    );

-- 7. Update payment methods to match frontend expectations
UPDATE student_payments 
SET payment_method = 'bank_transfer' 
WHERE payment_method IS NULL OR payment_method = '';

-- 8. Ensure all required columns have proper defaults
ALTER TABLE student_payments 
ALTER COLUMN payment_method SET DEFAULT 'bank_transfer';

ALTER TABLE student_payments 
ALTER COLUMN payment_status SET DEFAULT 'pending';

-- 9. Clean up duplicate enrollment systems (OPTIONAL - only if you want single system)
-- Uncomment these lines if you want to consolidate to single enrollment system:

-- Option A: Keep main 'enrollments' table, migrate data from 'student_enrollments'
/*
INSERT INTO enrollments (student_id, course_id, enrolled_at, status)
SELECT DISTINCT se.student_id, se.course_id, se.enrolled_at, 'approved'
FROM student_enrollments se
WHERE NOT EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.student_id = se.student_id 
    AND e.course_id = se.course_id
);
*/

-- Option B: Keep 'student_enrollments' table, migrate data from 'enrollments'
/*
INSERT INTO student_enrollments (student_id, course_id, enrolled_at, enrollment_status)
SELECT DISTINCT e.student_id, e.course_id, e.enrolled_at, 'active'
FROM enrollments e
WHERE NOT EXISTS (
    SELECT 1 FROM student_enrollments se 
    WHERE se.student_id = e.student_id 
    AND se.course_id = e.course_id
);
*/

-- 10. Verification queries
SELECT 'Schema Fix Complete!' as status;

-- Check student_payments table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'student_payments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for orphaned payments (should be 0)
SELECT COUNT(*) as orphaned_payments
FROM student_payments 
WHERE student_id IS NULL AND enrollment_id IS NULL;

-- Check payment method distribution
SELECT payment_method, COUNT(*) as count
FROM student_payments 
GROUP BY payment_method;

-- Check enrollment tables row counts
SELECT 
    'enrollments' as table_name,
    COUNT(*) as row_count
FROM enrollments
UNION ALL
SELECT 
    'student_enrollments' as table_name,
    COUNT(*) as row_count
FROM student_enrollments;

SELECT 'Database schema has been updated to support both enrollment-based and direct student payments!' as final_message;
