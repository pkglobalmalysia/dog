import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Test each table to see which ones exist
    const testResults = [];
    
    const tables = [
      "profiles",
      "courses", 
      "lectures",
      "assignments",
      "assignments_submissions",
      "enrollments",
      "attendance",
      "salary_payments_new",
      "lecture_attendance"
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .limit(1);
          
        testResults.push({
          table,
          exists: !error,
          error: error?.message || null,
          rowCount: data?.length || 0
        });
      } catch (err) {
        testResults.push({
          table,
          exists: false,
          error: (err as Error).message,
          rowCount: 0
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results: testResults
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
