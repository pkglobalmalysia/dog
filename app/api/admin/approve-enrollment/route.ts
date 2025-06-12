import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { requestId } = await request.json()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get enrollment request details
    const { data: enrollmentRequest, error: fetchError } = await supabase
      .from("enrollment_requests")
      .select("student_id, course_id")
      .eq("id", requestId)
      .single()

    if (fetchError || !enrollmentRequest) {
      return NextResponse.json({ error: "Enrollment request not found" }, { status: 404 })
    }

    // Create enrollment
    const { error: enrollmentError } = await supabase.from("enrollments").insert({
      student_id: enrollmentRequest.student_id,
      course_id: enrollmentRequest.course_id,
    })

    if (enrollmentError) {
      console.error("Error creating enrollment:", enrollmentError)
      return NextResponse.json({ error: enrollmentError.message }, { status: 500 })
    }

    // Update request status
    const { error: updateError } = await supabase
      .from("enrollment_requests")
      .update({
        status: "approved",
        processed_at: new Date().toISOString(),
        processed_by: user.id,
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error updating request:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
