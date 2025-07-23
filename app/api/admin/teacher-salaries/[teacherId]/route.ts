import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params
    const supabase = createRouteHandlerClient({ cookies })

    console.log("Fetching salaries for teacher:", teacherId)

    // Verify admin access
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      console.error("Profile error or unauthorized:", profileError)
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    // Fetch teacher salary records from salary_payments_new table
    const { data: salaryData, error: salaryError } = await supabase
      .from("salary_payments_new")
      .select(`
        id,
        month,
        year,
        total_classes,
        total_amount,
        bonus_amount,
        final_amount,
        status,
        payment_date
      `)
      .eq("teacher_id", teacherId)
      .order("year", { ascending: false })
      .order("month", { ascending: false })

    if (salaryError) {
      console.error("Error fetching salary data:", salaryError)
      return NextResponse.json(
        { success: false, error: "Failed to fetch salary data" }, 
        { status: 500 }
      )
    }

    console.log("Teacher salary data found:", salaryData?.length || 0)

    return NextResponse.json({
      success: true,
      salaries: salaryData || [],
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
