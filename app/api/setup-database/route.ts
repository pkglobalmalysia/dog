import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createServerClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const results = [];

    // Try to create assignments_submissions table
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS assignments_submissions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
          student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          submission_text TEXT,
          file_url TEXT,
          file_name TEXT,
          submitted_at TIMESTAMPTZ DEFAULT NOW(),
          grade INTEGER,
          feedback TEXT,
          feedback_file_url TEXT,
          feedback_file_name TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(assignment_id, student_id)
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_assignments_submissions_assignment_id ON assignments_submissions(assignment_id);
        CREATE INDEX IF NOT EXISTS idx_assignments_submissions_student_id ON assignments_submissions(student_id);
        
        -- Enable RLS
        ALTER TABLE assignments_submissions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY IF NOT EXISTS "Students can view their own submissions" ON assignments_submissions
          FOR SELECT USING (auth.uid() = student_id);
        
        CREATE POLICY IF NOT EXISTS "Students can insert their own submissions" ON assignments_submissions
          FOR INSERT WITH CHECK (auth.uid() = student_id);
        
        CREATE POLICY IF NOT EXISTS "Students can update their own submissions" ON assignments_submissions
          FOR UPDATE USING (auth.uid() = student_id);
        
        CREATE POLICY IF NOT EXISTS "Teachers can view submissions for their assignments" ON assignments_submissions
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM assignments 
              WHERE assignments.id = assignments_submissions.assignment_id 
              AND assignments.teacher_id = auth.uid()
            )
          );
        
        CREATE POLICY IF NOT EXISTS "Teachers can update grades and feedback" ON assignments_submissions
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM assignments 
              WHERE assignments.id = assignments_submissions.assignment_id 
              AND assignments.teacher_id = auth.uid()
            )
          );
        
        CREATE POLICY IF NOT EXISTS "Admins can do everything" ON assignments_submissions
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `;

      // Note: We can't execute raw SQL through the Supabase client
      // This would need to be run in the Supabase dashboard SQL editor
      results.push({
        action: "create_assignments_submissions_table",
        status: "instruction_provided",
        message: "SQL provided - needs to be run in Supabase dashboard",
        sql: createTableSQL
      });

    } catch (error) {
      results.push({
        action: "create_assignments_submissions_table",
        status: "failed",
        error: (error as Error).message
      });
    }

    // Try to add submissions column to profiles table (as fallback)
    try {
      // This also needs to be done via SQL in dashboard
      const addColumnSQL = `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS submissions JSONB DEFAULT '[]'::jsonb;
      `;
      
      results.push({
        action: "add_submissions_column_to_profiles",
        status: "instruction_provided", 
        message: "SQL provided - needs to be run in Supabase dashboard",
        sql: addColumnSQL
      });

    } catch (error) {
      results.push({
        action: "add_submissions_column_to_profiles",
        status: "failed",
        error: (error as Error).message
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database setup instructions provided",
      results,
      instructions: "Please run the provided SQL commands in your Supabase dashboard SQL editor to create the missing tables and columns."
    });

  } catch (error: any) {
    console.error("Setup database API error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: error
      },
      { status: 500 }
    );
  }
}
