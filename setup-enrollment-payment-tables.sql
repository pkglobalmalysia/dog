-- Setup script for student enrollment and payment system
-- Run this in Supabase SQL Editor

-- 1. Create student_enrollments table
CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses_enhanced(id) ON DELETE CASCADE,
    enrollment_status TEXT NOT NULL DEFAULT 'active' CHECK (enrollment_status IN ('active', 'completed', 'suspended', 'cancelled')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- 2. Create student_payments table
CREATE TABLE IF NOT EXISTS student_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses_enhanced(id) ON DELETE SET NULL,
    enrollment_id UUID REFERENCES student_enrollments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL DEFAULT 'online' CHECK (payment_method IN ('cash', 'bank_transfer', 'online', 'credit_card', 'debit_card')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'refunded')),
    receipt_url TEXT,
    transaction_id TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_status ON student_enrollments(enrollment_status);

CREATE INDEX IF NOT EXISTS idx_student_payments_student_id ON student_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_course_id ON student_payments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_status ON student_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_student_payments_created_at ON student_payments(created_at);

-- 4. Add Row Level Security (RLS) policies
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Students can view own payments" ON student_payments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON student_payments;

-- Allow students to view their own enrollments
CREATE POLICY "Students can view own enrollments" ON student_enrollments
    FOR SELECT USING (auth.uid() = student_id);

-- Allow students to view their own payments
CREATE POLICY "Students can view own payments" ON student_payments
    FOR SELECT USING (auth.uid() = student_id);

-- Allow admins full access to enrollments
CREATE POLICY "Admins can manage all enrollments" ON student_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Allow admins full access to payments
CREATE POLICY "Admins can manage all payments" ON student_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- 5. Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_student_enrollments_updated_at ON student_enrollments;
CREATE TRIGGER update_student_enrollments_updated_at 
    BEFORE UPDATE ON student_enrollments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_payments_updated_at ON student_payments;
CREATE TRIGGER update_student_payments_updated_at 
    BEFORE UPDATE ON student_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert some sample data (optional)
/*
INSERT INTO student_enrollments (student_id, course_id, enrollment_status, admin_notes)
SELECT 
    p.id,
    c.id,
    'active',
    'Sample enrollment for testing'
FROM profiles p
CROSS JOIN courses_enhanced c
WHERE p.user_type = 'student'
LIMIT 3;
*/
