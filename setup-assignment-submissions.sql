-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
    grade NUMERIC(5,2),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for assignment_submissions
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Students can only see and manage their own submissions
CREATE POLICY "Students can view their own submissions" 
    ON public.assignment_submissions FOR SELECT 
    USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own submissions" 
    ON public.assignment_submissions FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own submissions" 
    ON public.assignment_submissions FOR UPDATE 
    USING (auth.uid() = student_id);

-- Teachers and admins can view all submissions
CREATE POLICY "Teachers can view all submissions" 
    ON public.assignment_submissions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- Teachers and admins can update submissions (for grading)
CREATE POLICY "Teachers can update submissions for grading" 
    ON public.assignment_submissions FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- Add submissions column to profiles table as fallback
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS submissions JSONB DEFAULT '[]'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id 
    ON public.assignment_submissions(assignment_id);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id 
    ON public.assignment_submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_submitted_at 
    ON public.assignment_submissions(submitted_at);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assignment_submissions_updated_at 
    BEFORE UPDATE ON public.assignment_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
