-- Test the assignments_submissions table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'assignments_submissions'
ORDER BY ordinal_position;

-- Test insert into assignments_submissions
SELECT 
    'Testing assignments_submissions table access' as test,
    COUNT(*) as current_count
FROM assignments_submissions;

-- Check if we can see submissions for a specific assignment
SELECT 
    id,
    assignment_id,
    student_id,
    submitted_at,
    submission_text,
    file_url
FROM assignments_submissions 
LIMIT 5;
