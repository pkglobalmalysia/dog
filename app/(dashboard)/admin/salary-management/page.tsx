"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, DollarSign, Clock, Users, TrendingUp, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

type PendingApproval = {
  id: string
  teacher_name: string
  teacher_id: string
  event_title: string
  event_start_time: string
  course_title: string
  completed_at: string
  base_amount: number
  bonus_amount: number
  total_amount: number
  calendar_event_id: string
  status: string
}

type ApprovedPayment = {
  id: string
  teacher_name: string
  teacher_id: string
  event_title: string
  event_start_time: string
  course_title: string
  approved_at: string
  base_amount: number
  bonus_amount: number
  total_amount: number
  approved_by_name: string
}

type MonthlySalary = {
  id: string
  teacher_name: string
  teacher_id: string
  month: number
  year: number
  total_classes: number
  total_amount: number
  bonus_amount: number
  final_amount: number
  status: string
  payment_date?: string
}

type Message = {
  type: "success" | "error" | "info"
  text: string
}

export default function AdminSalaryManagement() {
  const { user, profile } = useAuth()
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [approvedPayments, setApprovedPayments] = useState<ApprovedPayment[]>([])
  const [monthlySalaries, setMonthlySalaries] = useState<MonthlySalary[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({})
  const [bonusAmounts, setBonusAmounts] = useState<{ [key: string]: string }>({})

  // Filter states

  // Filtered payment calculations

  const supabase = createClientComponentClient()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Fetching salary management data...")

      // Test database connection first
      const { error: testError } = await supabase.from("teacher_class_attendance").select("count").limit(1)

      if (testError) {
        console.error("Database connection test failed:", testError)
        setMessage({
          type: "error",
          text: `Database connection failed: ${testError.message}. Please check your database setup.`,
        })
        return
      }

      // Fetch all teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "teacher")
        .order("full_name")

      if (teachersError) {
        console.error("Error fetching teachers:", teachersError)
        setMessage({ type: "error", text: `Failed to fetch teachers: ${teachersError.message}` })
      } else {
        //setTeachers(teachersData || [])
        console.log("Fetched teachers:", teachersData?.length)
      }

      // NEW: Fetch pending lecture approvals from lecture_attendance table
      console.log("Fetching pending approvals...")
      const { data: pendingData, error: pendingError } = await supabase
        .from("lecture_attendance")
        .select(`
          id,
          teacher_id,
          lecture_id,
          status,
          completed_at,
          base_amount,
          bonus_amount,
          total_amount
        `)
        .eq("status", "completed")
        .order("completed_at", { ascending: true })

      if (pendingError) {
        console.error("Error fetching pending approvals:", pendingError)
        setMessage({ type: "error", text: `Failed to fetch pending approvals: ${pendingError.message}` })
      } else {
        console.log("Raw pending data:", pendingData)

        if (pendingData && pendingData.length > 0) {
          // Fetch related data for each pending approval
          const formattedPending = await Promise.all(
            pendingData.map(async (record) => {
              let teacher_name = "Unknown Teacher"
              let event_title = "Unknown Lecture"
              let event_start_time = ""
              let course_title = "Unknown Course"

              // Fetch teacher name
              if (record.teacher_id) {
                const { data: teacherData } = await supabase
                  .from("profiles")
                  .select("full_name")
                  .eq("id", record.teacher_id)
                  .single()
                teacher_name = teacherData?.full_name || "Unknown Teacher"
              }

              // Fetch lecture and course details
              if (record.lecture_id) {
                const { data: lectureData } = await supabase
                  .from("lectures")
                  .select("title, date, course_id, courses(title)")
                  .eq("id", record.lecture_id)
                  .single()

                if (lectureData) {
                  event_title = lectureData.title || "Unknown Lecture"
                  event_start_time = lectureData.date || ""
                  course_title = lectureData.courses?.title || "Unknown Course"
                }
              }

              return {
                id: record.id,
                teacher_name,
                teacher_id: record.teacher_id,
                event_title,
                event_start_time,
                course_title,
                completed_at: record.completed_at,
                base_amount: record.base_amount || 150,
                bonus_amount: record.bonus_amount || 0,
                total_amount: (record.base_amount || 150) + (record.bonus_amount || 0),
                calendar_event_id: record.lecture_id, // Use lecture_id for consistency
                status: record.status,
              }
            }),
          )
          setPendingApprovals(formattedPending)
          console.log("Formatted pending approvals:", formattedPending.length)
        } else {
          setPendingApprovals([])
          console.log("No pending approvals found")
        }
      }

      // Fetch approved payments from lecture_attendance table
      const { data: approvedData, error: approvedError } = await supabase
        .from("lecture_attendance")
        .select(`
          id,
          teacher_id,
          lecture_id,
          approved_at,
          base_amount,
          bonus_amount,
          total_amount,
          approved_by
        `)
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .limit(100)

      if (approvedError) {
        console.error("Error fetching approved payments:", approvedError)
      } else if (approvedData) {
        // Fetch related data for approved payments
        const formattedApproved = await Promise.all(
          approvedData.map(async (record) => {
            let teacher_name = "Unknown Teacher"
            let event_title = "Unknown Lecture"
            let event_start_time = ""
            let course_title = "Unknown Course"
            let approved_by_name = "Unknown Admin"

            // Fetch teacher name
            if (record.teacher_id) {
              const { data: teacherData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", record.teacher_id)
                .single()
              teacher_name = teacherData?.full_name || "Unknown Teacher"
            }

            // Fetch approved by name
            if (record.approved_by) {
              const { data: approverData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", record.approved_by)
                .single()
              approved_by_name = approverData?.full_name || "Unknown Admin"
            }

            // Fetch lecture details
            if (record.lecture_id) {
              const { data: lectureData } = await supabase
                .from("lectures")
                .select("title, date, course_id, courses(title)")
                .eq("id", record.lecture_id)
                .single()

              if (lectureData) {
                event_title = lectureData.title || "Unknown Lecture"
                event_start_time = lectureData.date || ""
                course_title = lectureData.courses?.title || "Unknown Course"
              }
            }

            return {
              id: record.id,
              teacher_name,
              teacher_id: record.teacher_id,
              event_title,
              event_start_time,
              course_title,
              approved_at: record.approved_at,
              base_amount: record.base_amount || 150,
              bonus_amount: record.bonus_amount || 0,
              total_amount: record.total_amount || 150,
              approved_by_name,
            }
          }),
        )
        setApprovedPayments(formattedApproved)
      }

      // Fetch monthly salary summaries
      const { data: salaryData, error: salaryError } = await supabase
        .from("salary_payments_new")
        .select(`
          id,
          teacher_id,
          month,
          year,
          total_classes,
          total_amount,
          bonus_amount,
          final_amount,
          status,
          payment_date
        `)
        .order("year", { ascending: false })
        .order("month", { ascending: false })

      if (salaryError) {
        console.error("Error fetching salary data:", salaryError)
        setMessage({ type: "error", text: `Failed to fetch salary data: ${salaryError.message}` })
      } else if (salaryData) {
        // Fetch teacher names for salary records
        const formattedSalaries = await Promise.all(
          salaryData.map(async (salary) => {
            let teacher_name = ""
            if (salary.teacher_id) {
              const { data: teacherData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", salary.teacher_id)
                .single()
              teacher_name = teacherData?.full_name || ""
            }

            return {
              id: salary.id,
              teacher_name,
              teacher_id: salary.teacher_id,
              month: salary.month,
              year: salary.year,
              total_classes: salary.total_classes || 0,
              total_amount: salary.total_amount || 0,
              bonus_amount: salary.bonus_amount || 0,
              final_amount: salary.final_amount || 0,
              status: salary.status || "pending",
              payment_date: salary.payment_date,
            }
          }),
        )
        setMonthlySalaries(formattedSalaries)
        //setFilteredMonthlySalaries(formattedSalaries)
      }

      setMessage({ type: "success", text: "Data loaded successfully!" })
    } catch (error: unknown) {
      console.error("Error fetching data:", error)
      setMessage({ type: "error", text: "Failed to load data. Please try again." })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (user && profile?.role === "admin") {
      fetchData()
    }
  }, [user, profile, fetchData])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const approveClass = async (attendanceId: string) => {
    console.log("Starting approval process for:", attendanceId)

    if (!user?.id) {
      setMessage({ type: "error", text: "User not authenticated" })
      return
    }

    const bonus = Number.parseFloat(bonusAmounts[attendanceId]) || 0
    const baseAmount = 150

    console.log("Approval details:", { attendanceId, bonus, baseAmount, userId: user.id })

    setSubmitting(attendanceId)
    try {
      // Check if the record exists and its current status in lecture_attendance table
      const { data: currentRecord, error: fetchError } = await supabase
        .from("lecture_attendance")
        .select("*")
        .eq("id", attendanceId)
        .single()

      if (fetchError) {
        console.error("Error fetching current record:", fetchError)
        throw new Error(`Failed to fetch record: ${fetchError.message}`)
      }

      console.log("Current record:", currentRecord)

      if (!currentRecord) {
        throw new Error("Record not found")
      }

      if (currentRecord.status !== "completed") {
        throw new Error(`Record status is ${currentRecord.status}, expected 'completed'`)
      }

      // Update the lecture_attendance record
      const updateData = {
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        base_amount: baseAmount,
        bonus_amount: bonus,
        total_amount: baseAmount + bonus,
      }

      console.log("Updating with data:", updateData)

      const { data: updateResult, error: updateError } = await supabase
        .from("lecture_attendance")
        .update(updateData)
        .eq("id", attendanceId)
        .eq("status", "completed") // Extra safety check
        .select()

      if (updateError) {
        console.error("Update failed:", updateError)
        throw new Error(`Failed to update record: ${updateError.message}`)
      }

      console.log("Update successful:", updateResult)

      setMessage({ type: "success", text: "Class approved successfully!" })
      setBonusAmounts({ ...bonusAmounts, [attendanceId]: "" })

      // Refresh data to show updated state
      await fetchData()
    } catch (error: unknown) {
      console.error("Approval error:", error)
      setMessage({ type: "error", text: (error as Error).message || "Failed to approve class" })
    } finally {
      setSubmitting(null)
    }
  }

  const rejectClass = async (attendanceId: string) => {
    const rejectionReason = rejectionReasons[attendanceId]
    if (!rejectionReason?.trim()) {
      setMessage({ type: "error", text: "Please provide a rejection reason" })
      return
    }

    if (!user?.id) {
      setMessage({ type: "error", text: "User not authenticated" })
      return
    }

    console.log("Starting rejection process for:", attendanceId)

    setSubmitting(attendanceId)
    try {
      const { error } = await supabase
        .from("lecture_attendance")
        .update({
          status: "rejected",
          approved_by: user.id,
          rejection_reason: rejectionReason,
        })
        .eq("id", attendanceId)

      if (error) {
        console.error("Rejection error:", error)
        throw new Error(`Failed to reject class: ${error.message}`)
      }

      setMessage({ type: "success", text: "Class rejected successfully!" })
      setRejectionReasons({ ...rejectionReasons, [attendanceId]: "" })
      await fetchData()
    } catch (error: unknown) {
      console.error("Rejection error:", error)
      setMessage({ type: "error", text: (error as Error).message || "Failed to reject class" })
    } finally {
      setSubmitting(null)
    }
  }

  const markSalaryPaid = async (salaryId: string) => {
    setSubmitting(salaryId)
    try {
      const { error } = await supabase
        .from("salary_payments_new")
        .update({
          status: "paid",
          payment_date: new Date().toISOString(),
        })
        .eq("id", salaryId)

      if (error) throw new Error(`Failed to update salary: ${error.message}`)

      setMessage({ type: "success", text: "Salary marked as paid!" })
      fetchData()
    } catch (error: unknown) {
      setMessage({ type: "error", text: (error as Error).message || "Failed to update salary status" })
    } finally {
      setSubmitting(null)
    }
  }

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1, 1).toLocaleString("default", { month: "long" })
  }

  // Calculate statistics
  const totalPendingAmount = pendingApprovals.reduce((sum, approval) => sum + approval.total_amount, 0)
  const totalApprovedClassAmount = approvedPayments.reduce((sum, payment) => sum + payment.total_amount, 0)
  const totalPaidFromSalaries = monthlySalaries
    .filter((salary) => salary.status === "paid")
    .reduce((sum, salary) => sum + salary.final_amount, 0)
  const totalPaidAmount = totalPaidFromSalaries + totalApprovedClassAmount // Include approved lecture payments
  const activeTeachers = new Set([
    ...pendingApprovals.map((p) => p.teacher_id),
    ...approvedPayments.map((p) => p.teacher_id),
    ...monthlySalaries.map((s) => s.teacher_id),
  ]).size

  const availableYears = [...new Set(monthlySalaries.map((s) => s.year))].sort((a, b) => b - a)
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear())
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading salary management...</p>
        </div>
      </div>
    )
  }

  if (profile?.role !== "admin") {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <AlertDescription>You do not have permission to access this page</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Salary Management
        </h1>
        <p className="mt-2 opacity-90">Approve class completions and manage teacher salaries.</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : message.type === "info" ? "default" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">Classes awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalPendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total pending payouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalPaidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All approved payouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTeachers}</div>
            <p className="text-xs text-muted-foreground">Teachers with salary activity</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Pending Approvals ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved Payments ({approvedPayments.length})</TabsTrigger>
          <TabsTrigger value="salaries">Salary Records ({monthlySalaries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Class Completion Approvals</span>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="p-6 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">
                            {approval.teacher_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{approval.event_title}</h4>
                            <p className="text-sm text-muted-foreground">Teacher: {approval.teacher_name}</p>
                          </div>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 ml-auto">
                            {approval.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Course</p>
                            <p className="text-gray-800">{approval.course_title}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Class Date</p>
                            <p className="text-gray-800">
                              {approval.event_start_time && !isNaN(new Date(approval.event_start_time).getTime())
                                ? format(new Date(approval.event_start_time), "MMM dd, yyyy")
                                : "Date not available"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Completed</p>
                            <p className="text-gray-800">
                              {approval.completed_at && !isNaN(new Date(approval.completed_at).getTime())
                                ? format(new Date(approval.completed_at), "MMM dd, yyyy")
                                : "Date not available"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-white rounded-lg border">
                          <p className="text-sm font-medium text-gray-600 mb-1">Payment Details</p>
                          <p className="text-lg font-semibold text-green-600">
                            Base Amount: RM {approval.base_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">ID: {approval.id}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 min-w-64">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`bonus-${approval.id}`} className="text-sm font-medium">
                              Bonus Amount (RM)
                            </Label>
                            <Input
                              id={`bonus-${approval.id}`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={bonusAmounts[approval.id] || ""}
                              onChange={(e) => setBonusAmounts({ ...bonusAmounts, [approval.id]: e.target.value })}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`rejection-${approval.id}`} className="text-sm font-medium">
                              Rejection Reason (if rejecting)
                            </Label>
                            <Textarea
                              id={`rejection-${approval.id}`}
                              placeholder="Enter reason for rejection..."
                              value={rejectionReasons[approval.id] || ""}
                              onChange={(e) =>
                                setRejectionReasons({ ...rejectionReasons, [approval.id]: e.target.value })
                              }
                              className="mt-1 text-sm"
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveClass(approval.id)}
                            disabled={submitting === approval.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {submitting === approval.id ? (
                              "Approving..."
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectClass(approval.id)}
                            disabled={submitting === approval.id || !rejectionReasons[approval.id]?.trim()}
                            className="flex-1"
                          >
                            {submitting === approval.id ? (
                              "Rejecting..."
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>

                        {bonusAmounts[approval.id] && (
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm text-green-700">
                              <strong>Total Payment:</strong> RM{" "}
                              {(approval.base_amount + (Number.parseFloat(bonusAmounts[approval.id]) || 0)).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {pendingApprovals.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                    <p className="text-muted-foreground">All class completion requests have been processed.</p>
                    <Button variant="outline" onClick={fetchData} className="mt-4">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check for New Requests
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                            {payment.teacher_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{payment.teacher_name}</h4>
                            <p className="text-sm text-muted-foreground">{payment.event_title}</p>
                          </div>
                          <Badge variant="default" className="bg-green-600 ml-auto">
                            Approved
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Course</p>
                            <p className="text-gray-800">{payment.course_title}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Class Date</p>
                            <p className="text-gray-800">
                              {payment.event_start_time && !isNaN(new Date(payment.event_start_time).getTime())
                                ? format(new Date(payment.event_start_time), "MMM dd, yyyy")
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Approved Date</p>
                            <p className="text-gray-800">
                              {payment.approved_at && !isNaN(new Date(payment.approved_at).getTime())
                                ? format(new Date(payment.approved_at), "MMM dd, yyyy")
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Approved By</p>
                            <p className="text-gray-800">{payment.approved_by_name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-3xl font-bold text-green-700">RM {payment.total_amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Base: RM {payment.base_amount}
                          {payment.bonus_amount > 0 && (
                            <span className="text-green-600"> + Bonus: RM {payment.bonus_amount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {approvedPayments.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Payments Found</h3>
                    <p className="text-muted-foreground">No approved payments available yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Salary Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlySalaries.map((salary) => (
                  <div
                    key={salary.id}
                    className={`p-4 border rounded-lg transition-shadow hover:shadow-md ${
                      salary.status === "paid"
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                        : "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 text-white rounded-full flex items-center justify-center font-semibold ${
                              salary.status === "paid" ? "bg-green-600" : "bg-orange-600"
                            }`}
                          >
                            {salary.teacher_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{salary.teacher_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getMonthName(salary.month)} {salary.year}
                            </p>
                          </div>
                          <Badge
                            variant={salary.status === "paid" ? "default" : "secondary"}
                            className={salary.status === "paid" ? "bg-green-600" : "bg-orange-600"}
                          >
                            {salary.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Classes Taught</p>
                            <p className="text-gray-800 font-semibold">{salary.total_classes}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Base Amount</p>
                            <p className="text-gray-800">RM {salary.total_amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Bonus Amount</p>
                            <p className="text-gray-800">
                              {salary.bonus_amount > 0 ? `RM ${salary.bonus_amount.toFixed(2)}` : "No bonus"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Payment Date</p>
                            <p className="text-gray-800">
                              {salary.payment_date
                                ? format(new Date(salary.payment_date), "MMM dd, yyyy")
                                : "Not paid yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-6">
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-800">RM {salary.final_amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Final Amount</p>
                        </div>
                        {salary.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => markSalaryPaid(salary.id)}
                            disabled={submitting === salary.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {monthlySalaries.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Salary Records Found</h3>
                    <p className="text-muted-foreground">No salary records available yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
