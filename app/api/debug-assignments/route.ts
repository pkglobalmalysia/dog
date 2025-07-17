import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[]
    };
    
    // Test 1: Basic assignments table access
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select("id, title, course_id")
        .limit(5);
        
      results.tests.push({
        test: "basic_assignments_query",
        success: !error,
        error: error?.message || null,
        dataCount: data?.length || 0,
        data: data?.slice(0, 2) // First 2 records only
      });
    } catch (err) {
      results.tests.push({
        test: "basic_assignments_query",
        success: false,
        error: (err as Error).message,
        exception: true
      });
    }
    
    // Test 2: Assignments with submissions join
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          course_id,
          assignments_submissions(id, student_id)
        `)
        .limit(3);
        
      results.tests.push({
        test: "assignments_with_submissions",
        success: !error,
        error: error?.message || null,
        dataCount: data?.length || 0,
        hasSubmissions: data?.[0]?.assignments_submissions !== undefined
      });
    } catch (err) {
      results.tests.push({
        test: "assignments_with_submissions",
        success: false,
        error: (err as Error).message,
        exception: true
      });
    }
    
    // Test 3: Check enrollments table
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("student_id, course_id")
        .limit(3);
        
      results.tests.push({
        test: "enrollments_access",
        success: !error,
        error: error?.message || null,
        dataCount: data?.length || 0
      });
    } catch (err) {
      results.tests.push({
        test: "enrollments_access", 
        success: false,
        error: (err as Error).message,
        exception: true
      });
    }
    
    // Test 4: Check courses table
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .limit(3);
        
      results.tests.push({
        test: "courses_access",
        success: !error,
        error: error?.message || null,
        dataCount: data?.length || 0
      });
    } catch (err) {
      results.tests.push({
        test: "courses_access",
        success: false,
        error: (err as Error).message,
        exception: true
      });
    }

    return NextResponse.json({
      success: true,
      message: "Debug tests completed",
      results
    });

  } catch (error: any) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: error
      },
      { status: 500 }
    );
  }
}
