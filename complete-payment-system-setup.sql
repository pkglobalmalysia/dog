-- Complete Payment System Setup with Course ID
-- This script ensures the payment system is properly configured

-- First ensure courses table exists
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
        ('General Payment', 'General payment not linked to specific course', 0.00, 'N/A', 'active');

        RAISE NOTICE 'Created courses table with sample data';
    ELSE
        RAISE NOTICE 'Courses table already exists';
    END IF;
END $$;

-- Ensure student_payments table exists with course_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_payments') THEN
        CREATE TABLE student_payments (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
            course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
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
        CREATE INDEX idx_student_payments_course_id ON student_payments(course_id);
        CREATE INDEX idx_student_payments_status ON student_payments(payment_status);

        RAISE NOTICE 'Created student_payments table with course_id';
    ELSE
        -- Check if course_id column exists, if not add it
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'student_payments' 
            AND column_name = 'course_id'
        ) THEN
            ALTER TABLE student_payments 
            ADD COLUMN course_id uuid REFERENCES courses(id) ON DELETE SET NULL;
            
            CREATE INDEX idx_student_payments_course_id ON student_payments(course_id);
            
            RAISE NOTICE 'Added course_id column to existing student_payments table';
        ELSE
            RAISE NOTICE 'student_payments table already has course_id column';
        END IF;
    END IF;
END $$;

-- Ensure payment-receipts storage bucket exists
-- Note: This needs to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', true);

-- Final verification
SELECT 
    'courses' as table_name,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') 
         THEN 'EXISTS' ELSE 'MISSING' END as status,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') 
         THEN (SELECT COUNT(*)::text FROM courses) ELSE 'N/A' END as record_count

UNION ALL

SELECT 
    'student_payments' as table_name,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_payments') 
         THEN 'EXISTS' ELSE 'MISSING' END as status,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_payments') 
         THEN (SELECT COUNT(*)::text FROM student_payments) ELSE 'N/A' END as record_count

UNION ALL

SELECT 
    'course_id_column' as table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_payments' AND column_name = 'course_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status,
    'N/A' as record_count;

RAISE NOTICE 'Payment system setup complete! Check the query results above for verification.';
