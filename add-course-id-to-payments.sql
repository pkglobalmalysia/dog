-- Add course_id column to student_payments table
DO $$
BEGIN
    -- Check if course_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'student_payments' 
        AND column_name = 'course_id'
    ) THEN
        -- Add the course_id column
        ALTER TABLE student_payments 
        ADD COLUMN course_id uuid REFERENCES courses(id) ON DELETE SET NULL;
        
        -- Create index for better performance
        CREATE INDEX idx_student_payments_course_id ON student_payments(course_id);
        
        RAISE NOTICE 'Added course_id column to student_payments table';
    ELSE
        RAISE NOTICE 'course_id column already exists in student_payments table';
    END IF;
END $$;
