-- Fix RLS policies for existing student_enrollments and student_payments tables
-- Run this in Supabase SQL Editor

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON student_enrollments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON student_payments;
DROP POLICY IF EXISTS "Admins can manage all main enrollments" ON enrollments;

-- Create admin policies using correct 'role' field
CREATE POLICY "Admins can manage all enrollments" ON student_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all payments" ON student_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all main enrollments" ON enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
