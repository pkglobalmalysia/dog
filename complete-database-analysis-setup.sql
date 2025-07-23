-- Complete Supabase Table Analysis and Setup
-- Run this in Supabase SQL Editor to check and create all necessary tables

-- 1. Check what tables currently exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check existing table structures
-- Profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Courses table structure (if exists)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check for foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';

-- 4. Create missing tables if they don't exist

-- Create courses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        CREATE TABLE courses (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            duration TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Enable read access for all users" ON courses FOR SELECT USING (true);
        CREATE POLICY "Enable all for authenticated users" ON courses FOR ALL USING (auth.role() = 'authenticated');

        -- Insert sample courses
        INSERT INTO courses (title, description, price, duration, status) VALUES
        ('English Basic Course', 'Fundamental English language skills for beginners', 299.00, '3 months', 'active'),
        ('English Intermediate Course', 'Intermediate level English communication skills', 399.00, '4 months', 'active'),
        ('English Business Course', 'Professional English for business communication', 499.00, '3 months', 'active'),
        ('IELTS Preparation Course', 'Comprehensive IELTS exam preparation', 599.00, '2 months', 'active'),
        ('English Conversation Class', 'Focus on speaking and listening skills', 199.00, '2 months', 'active');

        RAISE NOTICE 'Created courses table with sample data';
    ELSE
        RAISE NOTICE 'Courses table already exists';
    END IF;
END $$;

-- Create student_enrollments table if it doesn't exist
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

-- Create student_payments table if it doesn't exist
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

-- Update profiles table to add missing columns if needed
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

-- Create storage bucket for profile pictures if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies (ignore errors if they already exist)
DO $$
BEGIN
    -- Allow authenticated users to upload
    BEGIN
        CREATE POLICY "Allow authenticated uploads" ON storage.objects 
        FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Allow public access to view
    BEGIN
        CREATE POLICY "Allow public access" ON storage.objects 
        FOR SELECT USING (bucket_id = 'profile-pictures');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Allow authenticated updates
    BEGIN
        CREATE POLICY "Allow authenticated updates" ON storage.objects 
        FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Allow authenticated deletes
    BEGIN
        CREATE POLICY "Allow authenticated deletes" ON storage.objects 
        FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Final verification - show all tables and their record counts
SELECT 
    'Table Status Report' as report_type,
    '' as table_name,
    '' as status,
    '' as record_count

UNION ALL

SELECT 
    'Data',
    'profiles' as table_name,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') 
         THEN (SELECT COUNT(*)::text FROM profiles) ELSE 'N/A' END as record_count

UNION ALL

SELECT 
    'Data',
    'courses' as table_name,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') 
         THEN (SELECT COUNT(*)::text FROM courses) ELSE 'N/A' END as record_count

UNION ALL

SELECT 
    'Data',
    'student_enrollments' as table_name,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_enrollments') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_enrollments') 
         THEN (SELECT COUNT(*)::text FROM student_enrollments) ELSE 'N/A' END as record_count

UNION ALL

SELECT 
    'Data',
    'student_payments' as table_name,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_payments') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_payments') 
         THEN (SELECT COUNT(*)::text FROM student_payments) ELSE 'N/A' END as record_count;

-- Show courses data if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        RAISE NOTICE 'Current courses in database:';
        -- This will be shown in a separate query below
    END IF;
END $$;

-- Show current courses (run this separately if courses table exists)
-- First check what columns exist in courses table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current courses with available columns
SELECT 
    id,
    title,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'price'
    ) THEN 'HAS_PRICE_COLUMN' ELSE 'NO_PRICE_COLUMN' END as price_status,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'status'
    ) THEN 'HAS_STATUS_COLUMN' ELSE 'NO_STATUS_COLUMN' END as status_column,
    created_at
FROM courses 
ORDER BY title;

SELECT 'Database setup completed! All necessary tables should now exist.' as final_status;
