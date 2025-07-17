import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized - No auth token provided" },
        { status: 401 }
      );
    }
    
    // Set the auth token for this request
    const token = authHeader.replace('Bearer ', '')
    
    // Create client with global headers
    const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    // Get the current user
    const { data: { user }, error: authError } = await authenticatedSupabase.auth.getUser();
    console.log("👤 User check:", { user: user?.email, authError });
    
    if (authError || !user) {
      console.log("❌ Auth failed:", authError);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("📝 Request body:", body);
    const { assignment_id, submission_text, file_url } = body;

    if (!assignment_id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Try the correct table name: assignments_submissions (not assignment_submissions)
    console.log("🔄 Attempting submission to assignments_submissions table...");
    
    try {
      const submissionResult = await authenticatedSupabase
        .from("assignments_submissions")
        .upsert({
          assignment_id,
          student_id: user.id,
          submission_text: submission_text || null,
          file_url: file_url || null,
          submitted_at: new Date().toISOString(),
        })
        .select();
      
      console.log("✅ Direct submission result:", submissionResult);
      
      if (submissionResult.error) {
        console.error("❌ Submission error:", submissionResult.error);
        throw submissionResult.error;
      }
      
      return NextResponse.json({
        success: true,
        message: "Assignment submitted successfully!",
        data: submissionResult.data
      });
      
    } catch (directError: any) {
      console.error("❌ Direct submission failed:", directError);
      
      // Fall back to profiles.submissions if the main table fails
      console.log("🔄 Falling back to profiles.submissions storage...");
      
      try {
        // First, try to add the submissions column if it doesn't exist
        const { data: profile, error: profileSelectError } = await authenticatedSupabase
          .from("profiles")
          .select("id, submissions")
          .eq("id", user.id)
          .single();
        
        console.log("👤 Profile data:", { profile, error: profileSelectError });
        
        if (profileSelectError) {
          console.error("Could not fetch profile:", profileSelectError);
          return NextResponse.json(
            { 
              error: "Could not access user profile. Please try again.",
              code: "PROFILE_ACCESS_ERROR"
            },
            { status: 400 }
          );
        }
        
        // Check if submissions column exists
        if (!('submissions' in profile) || profile.submissions === undefined) {
          console.log("📝 Submissions column missing, initializing...");
          // Try to update with empty array to initialize the column
          const { error: initError } = await authenticatedSupabase
            .from("profiles")
            .update({ submissions: [] })
            .eq("id", user.id);
          
          if (initError) {
            console.error("Could not initialize submissions column:", initError);
            return NextResponse.json(
              { 
                error: "Database setup incomplete. Please contact administrator to add submissions column to profiles table.",
                code: "MISSING_SUBMISSIONS_COLUMN",
                details: initError
              },
              { status: 500 }
            );
          }
          
          // Refetch the profile
          const { data: updatedProfile, error: refetchError } = await authenticatedSupabase
            .from("profiles")
            .select("id, submissions")
            .eq("id", user.id)
            .single();
          
          if (refetchError) {
            return NextResponse.json(
              { 
                error: "Could not verify profile update. Please try again.",
                code: "PROFILE_REFETCH_ERROR"
              },
              { status: 400 }
            );
          }
          
          profile.submissions = updatedProfile.submissions;
        }
        
        const fallbackSubmission = {
          id: crypto.randomUUID(),
          assignment_id,
          student_id: user.id,
          submission_text,
          file_url,
          submitted_at: new Date().toISOString(),
          type: 'fallback_submission'
        };
        
        const existingSubmissions = Array.isArray(profile?.submissions) ? profile.submissions : [];
        const updatedSubmissions = [
          ...existingSubmissions.filter((s: any) => s.assignment_id !== assignment_id),
          fallbackSubmission
        ];
        
        console.log("💾 Saving submission:", { submissionId: fallbackSubmission.id, existingCount: existingSubmissions.length });
        
        const { error: profileError } = await authenticatedSupabase
          .from("profiles")
          .update({ submissions: updatedSubmissions })
          .eq("id", user.id);
        
        if (profileError) {
          console.error("Profile update failed:", profileError);
          return NextResponse.json(
            { 
              error: "Failed to save submission. Please try again.",
              code: "SUBMISSION_SAVE_ERROR",
              details: profileError
            },
            { status: 500 }
          );
        }
        
        console.log("✅ Submission saved successfully");
        
        return NextResponse.json({
          success: true,
          message: "Assignment submitted successfully (fallback storage)!",
          fallback: true,
          submissionId: fallbackSubmission.id
        });
        
      } catch (fallbackError: any) {
        console.error("❌ Fallback submission failed:", fallbackError);
        return NextResponse.json(
          { 
            error: "Assignment submission system encountered an error. Please contact administrator.",
            code: "FALLBACK_SYSTEM_ERROR",
            details: process.env.NODE_ENV === 'development' ? fallbackError : undefined
          },
          { status: 500 }
        );
      }
    }

  } catch (error: any) {
    console.error("Submit assignment API error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Internal server error";
    let statusCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.code) {
      switch (error.code) {
        case '42P01':
          errorMessage = "Assignment submissions table not found. Please contact administrator.";
          statusCode = 503;
          break;
        case '23503':
          errorMessage = "Invalid assignment reference. Please refresh and try again.";
          statusCode = 400;
          break;
        default:
          errorMessage = `Database error: ${error.code}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || "UNKNOWN_ERROR",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: statusCode }
    );
  }
}
