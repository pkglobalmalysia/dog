-- Fix Existing Courses Table - Add Missing Columns
-- Run this in Supabase SQL Editor to update your existing courses table

-- First, let's see what your courses table currently looks like
SELECT 'Current courses table structure:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to courses table
DO $$
BEGIN
    -- Add price column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'price'
    ) THEN
        ALTER TABLE courses ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added price column to courses table';
    ELSE
        RAISE NOTICE 'Price column already exists in courses table';
    END IF;

    -- Add description column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'description'
    ) THEN
        ALTER TABLE courses ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to courses table';
    ELSE
        RAISE NOTICE 'Description column already exists in courses table';
    END IF;

    -- Add duration column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'duration'
    ) THEN
        ALTER TABLE courses ADD COLUMN duration TEXT;
        RAISE NOTICE 'Added duration column to courses table';
    ELSE
        RAISE NOTICE 'Duration column already exists in courses table';
    END IF;

    -- Add status column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'status'
    ) THEN
        ALTER TABLE courses ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));
        RAISE NOTICE 'Added status column to courses table';
    ELSE
        RAISE NOTICE 'Status column already exists in courses table';
    END IF;

    -- Add created_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE courses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to courses table';
    ELSE
        RAISE NOTICE 'Created_at column already exists in courses table';
    END IF;

    -- Add updated_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE courses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to courses table';
    ELSE
        RAISE NOTICE 'Updated_at column already exists in courses table';
    END IF;
END $$;

-- Update existing courses with sample prices if price column was just added
DO $$
BEGIN
    -- Check if we have courses without prices and add sample prices
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'price'
    ) THEN
        -- Update courses with zero or null prices
        UPDATE courses 
        SET price = CASE 
            WHEN title ILIKE '%basic%' THEN 299.00
            WHEN title ILIKE '%intermediate%' THEN 399.00
            WHEN title ILIKE '%business%' THEN 499.00
            WHEN title ILIKE '%ielts%' THEN 599.00
            WHEN title ILIKE '%conversation%' THEN 199.00
            ELSE 350.00  -- Default price for other courses
        END,
        description = CASE 
            WHEN description IS NULL OR description = '' THEN 
                CASE 
                    WHEN title ILIKE '%basic%' THEN 'Fundamental English language skills for beginners'
                    WHEN title ILIKE '%intermediate%' THEN 'Intermediate level English communication skills'
                    WHEN title ILIKE '%business%' THEN 'Professional English for business communication'
                    WHEN title ILIKE '%ielts%' THEN 'Comprehensive IELTS exam preparation'
                    WHEN title ILIKE '%conversation%' THEN 'Focus on speaking and listening skills'
                    ELSE 'English language course'
                END
            ELSE description
        END,
        duration = CASE 
            WHEN duration IS NULL OR duration = '' THEN 
                CASE 
                    WHEN title ILIKE '%ielts%' THEN '2 months'
                    WHEN title ILIKE '%intermediate%' THEN '4 months'
                    ELSE '3 months'
                END
            ELSE duration
        END,
        status = CASE 
            WHEN status IS NULL OR status = '' THEN 'active'
            ELSE status
        END
        WHERE price IS NULL OR price = 0 OR description IS NULL OR duration IS NULL OR status IS NULL;
        
        RAISE NOTICE 'Updated existing courses with sample data';
    END IF;
END $$;

-- Create other required tables if they don't exist
-- student_enrollments table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_enrollments') THEN
        CREATE TABLE student_enrollments (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
            course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            enrollment_status TEXT DEFAULT 'active' CHECK (enrollment_status IN ('active', 'completed', 'suspended')),
            admin_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, course_id)
        );

        -- Enable RLS
        ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view own enrollments" ON student_enrollments FOR SELECT USING (auth.uid() = student_id);
        CREATE POLICY "Enable all for authenticated users" ON student_enrollments FOR ALL USING (auth.role() = 'authenticated');

        -- Create indexes
        CREATE INDEX idx_student_enrollments_student_id ON student_enrollments(student_id);
        CREATE INDEX idx_student_enrollments_course_id ON student_enrollments(course_id);

        RAISE NOTICE 'Created student_enrollments table';
    ELSE
        RAISE NOTICE 'Student_enrollments table already exists';
    END IF;
END $$;

-- student_payments table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_payments') THEN
        CREATE TABLE student_payments (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            payment_method TEXT DEFAULT 'online' CHECK (payment_method IN ('cash', 'bank_transfer', 'online', 'card')),
            payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
            receipt_url TEXT,
            admin_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            approved_at TIMESTAMP WITH TIME ZONE,
            approved_by TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view own payments" ON student_payments FOR SELECT USING (auth.uid() = student_id);
        CREATE POLICY "Enable all for authenticated users" ON student_payments FOR ALL USING (auth.role() = 'authenticated');

        -- Create indexes
        CREATE INDEX idx_student_payments_student_id ON student_payments(student_id);
        CREATE INDEX idx_student_payments_status ON student_payments(payment_status);

        RAISE NOTICE 'Created student_payments table';
    ELSE
        RAISE NOTICE 'Student_payments table already exists';
    END IF;
END $$;

-- Update profiles table with missing columns
DO $$
BEGIN
    -- Add profile_picture_url if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_picture_url TEXT;
        RAISE NOTICE 'Added profile_picture_url to profiles';
    END IF;

    -- Add date_of_birth if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
        RAISE NOTICE 'Added date_of_birth to profiles';
    END IF;

    -- Add emergency_contact if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'emergency_contact'
    ) THEN
        ALTER TABLE profiles ADD COLUMN emergency_contact TEXT;
        RAISE NOTICE 'Added emergency_contact to profiles';
    END IF;

    -- Add phone if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
        RAISE NOTICE 'Added phone to profiles';
    END IF;

    -- Add address if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'address'
    ) THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address to profiles';
    END IF;

    -- Add approved if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'approved'
    ) THEN
        ALTER TABLE profiles ADD COLUMN approved BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added approved to profiles';
    END IF;
END $$;

-- Final verification
SELECT 'Updated courses table structure:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show courses with all columns
SELECT 
    id,
    title,
    price,
    description,
    duration,
    status,
    created_at
FROM courses 
ORDER BY title;

-- Show table status
SELECT 
    'courses' as table_name,
    COUNT(*) as record_count,
    '✅ READY' as status
FROM courses
WHERE status = 'active' OR status IS NULL

UNION ALL

SELECT 
    'student_enrollments' as table_name,
    COUNT(*) as record_count,
    '✅ READY' as status
FROM student_enrollments

UNION ALL

SELECT 
    'student_payments' as table_name,
    COUNT(*) as record_count,
    '✅ READY' as status
FROM student_payments;

SELECT 'Courses table updated successfully! Your existing courses now have price, description, duration, and status columns.' as final_result;
