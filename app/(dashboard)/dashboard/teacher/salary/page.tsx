"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Clock, CheckCircle, Calendar, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ClassAttendance = {
  id: string
  lecture_id: string
  status: "scheduled" | "completed" | "approved" | "rejected" | "paid"
  completed_at: string | null
  approved_at: string | null
  base_amount: number
  bonus_amount: number
  total_amount: number
  rejection_reason: string | null
  event_title: string
  event_start_time: string
  course_title: string
}

type MonthlySalary = {
  id: string
  month: number
  year: number
  total_classes: number
  total_amount: number
  bonus_amount: number
  final_amount: number
  status: "pending" | "processing" | "paid" | "cancelled"
  payment_date: string | null
}

type Message = {
  type: "success" | "error"
  text: string
}

export default function TeacherSalary() {
  const { user } = useAuth()
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([])
  const [monthlySalaries, setMonthlySalaries] = useState<MonthlySalary[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [totalCurrentMonthEarnings, setTotalCurrentMonthEarnings] = useState<number>(0)

  const supabase = createClientComponentClient()

  const fetchData = useCallback(async () => {
    if (!user) return

    try {
      // Fetch lecture attendance records from lecture_attendance table
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("lecture_attendance")
        .select(`
          *,
          lectures(title, date, courses(title))
        `)
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false })

      if (attendanceError) {
        console.error("Error fetching attendance:", attendanceError)
      } else if (attendanceData) {
        const formattedAttendance = attendanceData.map((record) => ({
          id: record.id,
          lecture_id: record.lecture_id,
          status: record.status,
          completed_at: record.completed_at,
          approved_at: record.approved_at,
          base_amount: record.base_amount || 150,
          bonus_amount: record.bonus_amount || 0,
          total_amount: record.total_amount || 150,
          rejection_reason: record.rejection_reason,
          event_title: record.lectures?.title || "Lecture",
          event_start_time: record.lectures?.date || new Date().toISOString(),
          course_title: record.lectures?.courses?.title || "Unknown Course",
        }))
        setClassAttendance(formattedAttendance)
      }

      // Fetch monthly salary records
      const { data: salaryData, error: salaryError } = await supabase
        .from("salary_payments_new")
        .select("*")
        .eq("teacher_id", user.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false })

      if (salaryError) {
        console.error("Error fetching salary:", salaryError)
      } else if (salaryData) {
        setMonthlySalaries(salaryData)
      }

      // Calculate current month earnings from both monthly salary and approved lectures
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      const currentMonthFromSalary = monthlySalaries.find(
        (salary) => salary.month === currentMonth && salary.year === currentYear,
      )

      const currentMonthFromLectures = classAttendance
        .filter((record) => {
          if (record.status !== "approved" || !record.approved_at) return false
          const approvedDate = new Date(record.approved_at)
          return approvedDate.getMonth() + 1 === currentMonth && approvedDate.getFullYear() === currentYear
        })
        .reduce((sum, record) => sum + record.total_amount, 0)

      setTotalCurrentMonthEarnings((currentMonthFromSalary?.final_amount || 0) + currentMonthFromLectures)
    } catch (error) {
      console.error("Error fetching salary data:", error)
      setMessage({ type: "error", text: "Failed to load salary data" })
    } finally {
      setLoading(false)
    }
  }, [user, supabase,classAttendance, monthlySalaries])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const markClassCompleted = async (attendanceId: string) => {
    setSubmitting(attendanceId)
    try {
      const { error } = await supabase
        .from("lecture_attendance")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", attendanceId)

      if (error) throw error

      setMessage({ type: "success", text: "Class marked as completed! Waiting for admin approval." })
      fetchData()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to mark class as completed" })
    } finally {
      setSubmitting(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: "outline" as const, color: "text-gray-600", label: "Scheduled" },
      completed: { variant: "secondary" as const, color: "text-yellow-600", label: "Pending Approval" },
      approved: { variant: "default" as const, color: "text-green-600", label: "Approved" },
      rejected: { variant: "destructive" as const, color: "text-red-600", label: "Rejected" },
      paid: { variant: "default" as const, color: "text-blue-600", label: "Paid" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1, 1).toLocaleString("default", { month: "long" })
  }

  const currentMonthEarnings = monthlySalaries.find(
    (salary) => salary.month === new Date().getMonth() + 1 && salary.year === new Date().getFullYear(),
  )

  const pendingClasses = classAttendance.filter((record) => record.status === "completed").length
  const approvedClasses = classAttendance.filter((record) => record.status === "approved").length
  const totalEarnings = classAttendance
    .filter((record) => record.status === "approved")
    .reduce((sum, record) => sum + record.total_amount, 0)

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading salary information...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          My Salary
        </h1>
        <p className="mt-2 opacity-90">Track your class completions and earnings (150 RM per class).</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Salary Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalCurrentMonthEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthEarnings?.total_classes || 0} classes completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClasses}</div>
            <p className="text-xs text-muted-foreground">Classes awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Classes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedClasses}</div>
            <p className="text-xs text-muted-foreground">Total approved classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time approved earnings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">Class Attendance</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Salary</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Class Attendance & Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{record.event_title}</h4>
                        {getStatusBadge(record.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {record.event_start_time && !isNaN(new Date(record.event_start_time).getTime())
                            ? format(new Date(record.event_start_time), "PPP p")
                            : "Date not available"}
                        </div>
                        {record.course_title && <p>Course: {record.course_title}</p>}
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Base: RM {record.base_amount}
                          {record.bonus_amount > 0 && ` + Bonus: RM ${record.bonus_amount}`}
                          {record.status === "approved" && ` = Total: RM ${record.total_amount}`}
                        </div>
                        {record.completed_at && !isNaN(new Date(record.completed_at).getTime()) && (
                          <p>Completed: {format(new Date(record.completed_at), "PPP p")}</p>
                        )}
                        {record.approved_at && !isNaN(new Date(record.approved_at).getTime()) && (
                          <p>Approved: {format(new Date(record.approved_at), "PPP p")}</p>
                        )}
                        {record.rejection_reason && (
                          <p className="text-red-600">Rejection Reason: {record.rejection_reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.status === "scheduled" && new Date(record.event_start_time) <= new Date() && (
                        <Button
                          size="sm"
                          onClick={() => markClassCompleted(record.id)}
                          disabled={submitting === record.id}
                        >
                          {submitting === record.id ? "Marking..." : "Mark Completed"}
                        </Button>
                      )}
                      {record.status === "approved" && (
                        <div className="text-right">
                          <p className="font-medium text-green-600">RM {record.total_amount}</p>
                          <p className="text-xs text-muted-foreground">Earned</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {classAttendance.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No classes scheduled yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Salary Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlySalaries.map((salary) => (
                  <div key={salary.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {getMonthName(salary.month)} {salary.year}
                        </h4>
                        <Badge variant={salary.status === "paid" ? "default" : "secondary"}>{salary.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Classes Completed: {salary.total_classes}</p>
                        <p>Base Amount: RM {salary.total_amount.toFixed(2)}</p>
                        {salary.bonus_amount > 0 && <p>Bonus: RM {salary.bonus_amount.toFixed(2)}</p>}
                        {salary.payment_date && !isNaN(new Date(salary.payment_date).getTime()) && (
                          <p>Paid on: {format(new Date(salary.payment_date), "PPP")}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">RM {salary.final_amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Final Amount</p>
                    </div>
                  </div>
                ))}
                {monthlySalaries.length === 0 && (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No salary records yet</p>
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
