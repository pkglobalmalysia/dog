-- Complete Enhanced Student Management System Database Setup
-- Run this in Supabase SQL Editor to ensure all tables exist

-- Check if courses_enhanced table exists and create if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses_enhanced') THEN
        CREATE TABLE courses_enhanced (
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
        ALTER TABLE courses_enhanced ENABLE ROW LEVEL SECURITY;

        -- Create policies for courses_enhanced
        CREATE POLICY "Enable read access for all users" ON courses_enhanced FOR SELECT USING (true);
        CREATE POLICY "Enable insert for authenticated users only" ON courses_enhanced FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Enable update for authenticated users only" ON courses_enhanced FOR UPDATE USING (auth.role() = 'authenticated');
        CREATE POLICY "Enable delete for authenticated users only" ON courses_enhanced FOR DELETE USING (auth.role() = 'authenticated');

        -- Insert sample courses
        INSERT INTO courses_enhanced (title, description, price, duration, status) VALUES
        ('English Basic Course', 'Fundamental English language skills for beginners', 299.00, '3 months', 'active'),
        ('English Intermediate Course', 'Intermediate level English communication skills', 399.00, '4 months', 'active'),
        ('English Business Course', 'Professional English for business communication', 499.00, '3 months', 'active'),
        ('IELTS Preparation Course', 'Comprehensive IELTS exam preparation', 599.00, '2 months', 'active'),
        ('English Conversation Class', 'Focus on speaking and listening skills', 199.00, '2 months', 'active');

        RAISE NOTICE 'courses_enhanced table created successfully with sample data';
    ELSE
        RAISE NOTICE 'courses_enhanced table already exists';
    END IF;
END $$;

-- Check if student_enrollments table exists and create if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_enrollments') THEN
        CREATE TABLE student_enrollments (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
            course_id uuid REFERENCES courses_enhanced(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            enrollment_status TEXT DEFAULT 'active' CHECK (enrollment_status IN ('active', 'completed', 'suspended')),
            admin_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, course_id)
        );

        -- Enable RLS
        ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

        -- Create policies for student_enrollments
        CREATE POLICY "Users can view own enrollments" ON student_enrollments FOR SELECT USING (auth.uid() = student_id);
        CREATE POLICY "Enable read access for all authenticated users" ON student_enrollments FOR SELECT USING (auth.role() = 'authenticated');
        CREATE POLICY "Enable insert for authenticated users only" ON student_enrollments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Enable update for authenticated users only" ON student_enrollments FOR UPDATE USING (auth.role() = 'authenticated');
        CREATE POLICY "Enable delete for authenticated users only" ON student_enrollments FOR DELETE USING (auth.role() = 'authenticated');

        -- Create indexes for better performance
        CREATE INDEX idx_student_enrollments_student_id ON student_enrollments(student_id);
        CREATE INDEX idx_student_enrollments_course_id ON student_enrollments(course_id);
        CREATE INDEX idx_student_enrollments_status ON student_enrollments(enrollment_status);

        RAISE NOTICE 'student_enrollments table created successfully';
    ELSE
        RAISE NOTICE 'student_enrollments table already exists';
    END IF;
END $$;

-- Check if student_payments table exists and create if needed
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

        -- Create policies for student_payments
        CREATE POLICY "Users can view own payments" ON student_payments FOR SELECT USING (auth.uid() = student_id);
        CREATE POLICY "Enable read access for all authenticated users" ON student_payments FOR SELECT USING (auth.role() = 'authenticated');
        CREATE POLICY "Enable insert for authenticated users only" ON student_payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Enable update for authenticated users only" ON student_payments FOR UPDATE USING (auth.role() = 'authenticated');
        CREATE POLICY "Enable delete for authenticated users only" ON student_payments FOR DELETE USING (auth.role() = 'authenticated');

        -- Create indexes for better performance
        CREATE INDEX idx_student_payments_student_id ON student_payments(student_id);
        CREATE INDEX idx_student_payments_status ON student_payments(payment_status);
        CREATE INDEX idx_student_payments_method ON student_payments(payment_method);

        RAISE NOTICE 'student_payments table created successfully';
    ELSE
        RAISE NOTICE 'student_payments table already exists';
    END IF;
END $$;

-- Create storage bucket for profile pictures if not exists
DO $$
BEGIN
    -- Check if bucket exists, if not create it
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-pictures', 'profile-pictures', true)
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Storage bucket for profile pictures ready';
END $$;

-- Add storage policies
DO $$
BEGIN
    -- Allow authenticated users to upload profile pictures
    CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');
    
    -- Allow public access to view profile pictures
    CREATE POLICY "Allow public access" ON storage.objects FOR SELECT 
    USING (bucket_id = 'profile-pictures');
    
    -- Allow users to update their own profile pictures
    CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE 
    USING (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');
    
    -- Allow users to delete their own profile pictures
    CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE 
    USING (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');

EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Storage policies already exist';
END $$;

-- Update profiles table to include additional fields if they don't exist
DO $$
BEGIN
    -- Add profile_picture_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_picture_url TEXT;
        RAISE NOTICE 'Added profile_picture_url column to profiles table';
    END IF;

    -- Add date_of_birth column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
        RAISE NOTICE 'Added date_of_birth column to profiles table';
    END IF;

    -- Add emergency_contact column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'emergency_contact'
    ) THEN
        ALTER TABLE profiles ADD COLUMN emergency_contact TEXT;
        RAISE NOTICE 'Added emergency_contact column to profiles table';
    END IF;
END $$;

-- Verify the setup
SELECT 
    'courses_enhanced' as table_name,
    COUNT(*) as record_count
FROM courses_enhanced
UNION ALL
SELECT 
    'student_enrollments' as table_name,
    COUNT(*) as record_count
FROM student_enrollments
UNION ALL
SELECT 
    'student_payments' as table_name,
    COUNT(*) as record_count
FROM student_payments
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM profiles;

-- Final success message
SELECT 'Enhanced Student Management System database setup completed successfully!' as status;
