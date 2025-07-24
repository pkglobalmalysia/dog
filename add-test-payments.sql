-- Insert test payment data
-- Run this in your Supabase SQL Editor to create test payment records

-- First, let's get some student and course IDs to work with
-- You can check what IDs exist by running: SELECT id, full_name FROM profiles WHERE role = 'student' LIMIT 3;
-- You can check course IDs by running: SELECT id, title FROM courses LIMIT 3;

-- Insert test payment records (replace IDs with actual IDs from your database)
-- Example student_id: Get from: SELECT id FROM profiles WHERE role = 'student' LIMIT 1;
-- Example course_id: Get from: SELECT id FROM courses LIMIT 1;

INSERT INTO student_payments (
    student_id,
    course_id,
    amount,
    payment_method,
    payment_status,
    admin_notes,
    created_at
) VALUES 
(
    (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
    (SELECT id FROM courses LIMIT 1),
    150.00,
    'bank_transfer',
    'pending',
    'Payment for English Course - January 2025',
    NOW()
),
(
    (SELECT id FROM profiles WHERE role = 'student' ORDER BY created_at LIMIT 1 OFFSET 1),
    (SELECT id FROM courses LIMIT 1),
    200.00,
    'cash',
    'approved',
    'Payment for English Course - approved by admin',
    NOW() - INTERVAL '2 days'
),
(
    (SELECT id FROM profiles WHERE role = 'student' ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM courses ORDER BY created_at DESC LIMIT 1),
    100.00,
    'online',
    'pending',
    'Online payment submission',
    NOW() - INTERVAL '1 day'
);

-- Check the inserted data
SELECT 
    sp.*,
    p.full_name as student_name,
    p.email as student_email,
    c.title as course_title
FROM student_payments sp
LEFT JOIN profiles p ON sp.student_id = p.id
LEFT JOIN courses c ON sp.course_id = c.id
ORDER BY sp.created_at DESC;
