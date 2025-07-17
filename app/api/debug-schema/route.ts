import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔍 Schema debug API called");
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const results: any = {
      assignments_submissions: null,
      assignments: null,
      profiles: null,
      courses: null,
      errors: {}
    };
    
    // Check assignments_submissions table
    try {
      const { data, error } = await supabase
        .from('assignments_submissions')
        .select('*')
        .limit(1);
      
      if (error) {
        results.errors.assignments_submissions = {
          message: error.message,
          code: error.code,
          exists: false
        };
      } else {
        results.assignments_submissions = {
          exists: true,
          sampleData: data
        };
      }
    } catch (e: any) {
      results.errors.assignments_submissions = {
        message: e.message,
        exists: false
      };
    }
    
    // Check assignments table
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, course_id')
        .limit(3);
      
      if (error) {
        results.errors.assignments = error;
      } else {
        results.assignments = data;
      }
    } catch (e: any) {
      results.errors.assignments = e.message;
    }
    
    // Check profiles table and submissions column
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, submissions')
        .limit(2);
      
      if (error) {
        results.errors.profiles = error;
      } else {
        results.profiles = {
          count: data?.length || 0,
          hasSubmissionsColumn: data && data.length > 0 && 'submissions' in data[0],
          sampleProfiles: data
        };
      }
    } catch (e: any) {
      results.errors.profiles = e.message;
    }
    
    // Check courses table
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .limit(3);
      
      if (error) {
        results.errors.courses = error;
      } else {
        results.courses = data;
      }
    } catch (e: any) {
      results.errors.courses = e.message;
    }
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error: any) {
    console.error("Schema debug error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
