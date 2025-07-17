import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameter for assignment_id
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignment_id');

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Try multiple approaches to get submission data
    let submissions = [];
    
    // Approach 1: Try assignments_submissions table
    try {
      const { data, error } = await supabase
        .from("assignments_submissions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .eq("student_id", user.id);
        
      if (!error && data) {
        submissions = data;
      }
    } catch {
      console.log("assignments_submissions table not available");
    }
    
    // Approach 2: Check profile submissions (fallback)
    if (submissions.length === 0) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("submissions")
          .eq("id", user.id)
          .single();
          
        if (profile?.submissions) {
          const userSubmissions = Array.isArray(profile.submissions) ? profile.submissions : [];
          submissions = userSubmissions.filter((s: any) => s.assignment_id === assignmentId);
        }
      } catch (profileError) {
        console.log("Could not check profile submissions:", profileError);
      }
    }

    return NextResponse.json({
      success: true,
      submissions,
      hasSubmission: submissions.length > 0
    });

  } catch (error: any) {
    console.error("Get submissions API error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}
