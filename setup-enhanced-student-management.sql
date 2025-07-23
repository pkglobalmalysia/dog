-- ================================================================
-- ENHANCED STUDENT MANAGEMENT SYSTEM - DATABASE SETUP
-- ================================================================
-- Run this script in your Supabase SQL Editor to create all required tables

-- 1. COURSES_ENHANCED TABLE
-- This table stores all available courses for assignment
CREATE TABLE IF NOT EXISTS courses_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    duration VARCHAR(100), -- e.g., "3 months", "6 weeks"
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some sample courses
INSERT INTO courses_enhanced (title, description, price, duration, status) VALUES
('English Basic Course', 'Fundamental English language skills for beginners', 299.00, '3 months', 'active'),
('English Intermediate', 'Intermediate level English with focus on conversation', 399.00, '4 months', 'active'),
('IELTS Preparation', 'Comprehensive IELTS exam preparation course', 599.00, '6 months', 'active'),
('Business English', 'Professional English for workplace communication', 499.00, '3 months', 'active'),
('Advanced English Communication', 'Advanced speaking and writing skills', 699.00, '5 months', 'active')
ON CONFLICT (title) DO NOTHING;

-- 2. STUDENT_ENROLLMENTS TABLE
-- This table tracks which students are enrolled in which courses
CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses_enhanced(id) ON DELETE CASCADE,
    enrollment_status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- 3. STUDENT_PAYMENTS TABLE
-- This table stores all payment records for students
CREATE TABLE IF NOT EXISTS student_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses_enhanced(id) ON DELETE SET NULL,
    enrollment_id UUID REFERENCES student_enrollments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash', -- cash, bank_transfer, online, credit_card
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    receipt_url TEXT, -- URL to uploaded receipt image
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. UPDATE PROFILES TABLE
-- Add profile_picture_url column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_student_id ON student_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_status ON student_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_courses_enhanced_status ON courses_enhanced(status);

-- 6. CREATE RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE courses_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;

-- Courses policies (everyone can read active courses)
CREATE POLICY "Anyone can view active courses" ON courses_enhanced
    FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can view all courses" ON courses_enhanced
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access courses" ON courses_enhanced
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Student enrollments policies
CREATE POLICY "Students can view own enrollments" ON student_enrollments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Service role full access enrollments" ON student_enrollments
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Student payments policies
CREATE POLICY "Students can view own payments" ON student_payments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own payments" ON student_payments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Service role full access payments" ON student_payments
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 7. CREATE STORAGE BUCKET FOR PROFILE PICTURES
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for profile pictures
CREATE POLICY "Users can upload profile pictures" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view profile pictures" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update own profile pictures" ON storage.objects
    FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');

CREATE POLICY "Service role full access to profile pictures" ON storage.objects
    FOR ALL USING (bucket_id = 'profile-pictures' AND auth.jwt() ->> 'role' = 'service_role');

-- 8. CREATE HELPFUL VIEWS

-- View for student enrollment summary
CREATE OR REPLACE VIEW student_enrollment_summary AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.role,
    COUNT(se.id) as total_enrollments,
    COUNT(CASE WHEN se.enrollment_status = 'active' THEN 1 END) as active_enrollments,
    COUNT(CASE WHEN se.enrollment_status = 'completed' THEN 1 END) as completed_enrollments,
    COALESCE(SUM(sp.amount), 0) as total_payments,
    COUNT(CASE WHEN sp.payment_status = 'pending' THEN 1 END) as pending_payments
FROM profiles p
LEFT JOIN student_enrollments se ON p.id = se.student_id
LEFT JOIN student_payments sp ON p.id = sp.student_id AND sp.payment_status = 'approved'
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.email, p.role;

-- 9. CREATE FUNCTIONS FOR AUTOMATIC UPDATES

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_courses_enhanced_updated_at 
    BEFORE UPDATE ON courses_enhanced 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_enrollments_updated_at 
    BEFORE UPDATE ON student_enrollments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_payments_updated_at 
    BEFORE UPDATE ON student_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. VERIFICATION QUERIES
-- Run these to verify everything was created successfully

SELECT 'Tables created successfully!' as status;

SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('courses_enhanced', 'student_enrollments', 'student_payments')
ORDER BY table_name;

SELECT 'Sample data:' as info;
SELECT COUNT(*) as course_count FROM courses_enhanced;
SELECT COUNT(*) as profile_count FROM profiles;

SELECT 'Setup complete! ✅' as final_status;
