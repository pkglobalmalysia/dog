"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, DollarSign, Video, Users, CheckCircle, Gift } from "lucide-react"
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"

type CalendarEvent = {
  id: string
  title: string
  description: string
  event_type: "class" | "payment" | "other" | "holiday" | "exam" | "assignment"
  start_time: string
  end_time: string
  course_title: string
  payment_amount: number
  live_class_url?: string
  color?: string
  attendance_status?: string
  attendance_id?: string
}



export default function TeacherCalendar() {
  const { user } = useAuth()
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([])
  const [pastCompletedEvents, setPastCompletedEvents] = useState<CalendarEvent[]>([])
  const [holidayEvents, setHolidayEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [totalMonthlyEarnings, setTotalMonthlyEarnings] = useState(0)
  const [totalApprovedClasses, setTotalApprovedClasses] = useState(0)
  const [currentMonth] = useState(new Date())

  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })

  // Wrap fetchTodayEvents with useCallback to fix the dependency issue
  const fetchTodayEvents = useCallback(async () => {
    try {
      const today = new Date()
      const startOfToday = startOfDay(today)
      const endOfToday = endOfDay(today)

      const { data: eventsData, error } = await supabase
        .from("calendar_events")
        .select(`
          *,
          courses(title, live_class_url),
          teacher_class_attendance(id, status)
        `)
        .eq("event_type", "class")
        .gte("start_time", startOfToday.toISOString())
        .lte("start_time", endOfToday.toISOString())
        .order("start_time", { ascending: true })

      if (error) {
        console.error("Error fetching today's events:", error)
        return
      }

      if (eventsData) {
        const formattedEvents = eventsData.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description || "",
          event_type: event.event_type,
          start_time: event.start_time,
          end_time: event.end_time,
          course_title: event.courses?.title || "",
          payment_amount: event.payment_amount || 150,
          live_class_url: event.courses?.live_class_url || "",
          color: event.color || getEventColor(event.event_type).bg,
          attendance_status: event.teacher_class_attendance?.[0]?.status || "not_started",
          attendance_id: event.teacher_class_attendance?.[0]?.id,
        }))
        setTodayEvents(formattedEvents)
      }
    } catch (error) {
      console.error("Error fetching today's events:", error)
    }
  }, [supabase])

  // Fetch holiday events (visible to all teachers)
  const fetchHolidayEvents = useCallback(async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from("calendar_events")
        .select(`
          id,
          title,
          description,
          event_type,
          start_time,
          end_time,
          color
        `)
        .in("event_type", ["holiday", "other"])
        .gte("start_time", new Date().toISOString()) // Only upcoming events
        .order("start_time", { ascending: true })
        .limit(5) // Show next 5 upcoming holidays

      if (error) {
        console.error("Error fetching holiday events:", error)
        return
      }

      if (eventsData) {
        const formattedEvents = eventsData.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description || "",
          event_type: event.event_type,
          start_time: event.start_time,
          end_time: event.end_time || event.start_time,
          course_title: "",
          payment_amount: 0,
          color: event.color || getEventColor(event.event_type).bg,
        }))
        setHolidayEvents(formattedEvents)
      }
    } catch (error) {
      console.error("Error fetching holiday events:", error)
    }
  }, [supabase])

  // Wrap fetchPastCompletedEvents with useCallback to fix the dependency issue
  const fetchPastCompletedEvents = useCallback(async () => {
    try {
      const today = new Date()
      const startOfToday = startOfDay(today)

      const { data: eventsData, error } = await supabase
        .from("calendar_events")
        .select(`
          *,
          courses(title, live_class_url),
          teacher_class_attendance!inner(id, status, completed_at, approved_at, total_amount)
        `)
        .eq("event_type", "class")
        .lt("start_time", startOfToday.toISOString())
        .in("teacher_class_attendance.status", ["completed", "approved", "rejected"])
        .order("start_time", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error fetching past completed events:", error)
        return
      }

      if (eventsData) {
        const formattedEvents = eventsData.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description || "",
          event_type: event.event_type,
          start_time: event.start_time,
          end_time: event.end_time,
          course_title: event.courses?.title || "",
          payment_amount: event.teacher_class_attendance?.[0]?.total_amount || 150,
          live_class_url: event.courses?.live_class_url || "",
          color: event.color || getEventColor(event.event_type).bg,
          attendance_status: event.teacher_class_attendance?.[0]?.status || "completed",
          attendance_id: event.teacher_class_attendance?.[0]?.id,
        }))
        setPastCompletedEvents(formattedEvents)
      }
    } catch (error) {
      console.error("Error fetching past completed events:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Wrap fetchEarnings with useCallback to fix the dependency issue
  const fetchEarnings = useCallback(async () => {
    try {
      const startDate = startOfMonth(currentMonth)
      const endDate = endOfMonth(currentMonth)

      // Fetch approved class attendance records for earnings
      const { data: earningsData } = await supabase
        .from("teacher_class_attendance")
        .select(`
          *,
          calendar_events(start_time)
        `)
        .eq("teacher_id", user?.id)
        .eq("status", "approved")
        .gte("calendar_events.start_time", startDate.toISOString())
        .lte("calendar_events.start_time", endDate.toISOString())
        .order("calendar_events.start_time", { ascending: true })

      if (earningsData) {
        // Group earnings by date
        const earningsByDate: { [key: string]: { amount: number; classes: number } } = {}

        earningsData.forEach((earning) => {
          if (earning.calendar_events?.start_time) {
            const date = format(new Date(earning.calendar_events.start_time), "yyyy-MM-dd")
            if (!earningsByDate[date]) {
              earningsByDate[date] = { amount: 0, classes: 0 }
            }
            earningsByDate[date].amount += earning.total_amount || 150
            earningsByDate[date].classes += 1
          }
        })

        const formattedEarnings = Object.entries(earningsByDate).map(([date, data]) => ({
          date,
          amount: data.amount,
          classes: data.classes,
        }))


        const total = formattedEarnings.reduce((sum, earning) => sum + earning.amount, 0)
        const totalClasses = formattedEarnings.reduce((sum, earning) => sum + earning.classes, 0)
        setTotalMonthlyEarnings(total)
        setTotalApprovedClasses(totalClasses)
      }
    } catch (error) {
      console.error("Error fetching earnings:", error)
    }
  }, [user?.id, supabase, currentMonth])

  // Fixed useEffect with all dependencies
  useEffect(() => {
    if (user) {
      fetchTodayEvents()
      fetchPastCompletedEvents()
      fetchEarnings()
      fetchHolidayEvents()
    }
  }, [user, currentMonth, fetchTodayEvents, fetchPastCompletedEvents, fetchEarnings, fetchHolidayEvents])

  const markClassCompleted = async (eventId: string) => {
    try {
      // First check if attendance record exists
      const { data: existingAttendance } = await supabase
        .from("teacher_class_attendance")
        .select("id")
        .eq("calendar_event_id", eventId)
        .eq("teacher_id", user?.id)
        .single()

      if (existingAttendance) {
        // Update existing record
        const { error } = await supabase
          .from("teacher_class_attendance")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            base_amount: 150,
            total_amount: 150,
          })
          .eq("id", existingAttendance.id)

        if (error) throw error
      } else {
        // Create new attendance record
        const { error } = await supabase.from("teacher_class_attendance").insert({
          calendar_event_id: eventId,
          teacher_id: user?.id,
          status: "completed",
          completed_at: new Date().toISOString(),
          base_amount: 150,
          total_amount: 150,
        })

        if (error) throw error
      }

      // Refresh the events
      fetchTodayEvents()
      fetchPastCompletedEvents()
    } catch (error) {
      console.error("Error marking class as completed:", error)
    }
  }

  const getEventColor = (type: string) => {
    const colors = {
      class: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
      payment: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
      assignment: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
      exam: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
      holiday: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
      other: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending Approval
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Not Started</Badge>
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading calendar...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-8 w-8" />
          My Classes & Events
        </h1>
        <p className="mt-2 opacity-90">Track your classes, earnings, and important dates.</p>
      </div>

      {/* Monthly Earnings Summary */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <DollarSign className="h-5 w-5" />
            Monthly Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-green-700 dark:text-green-300">Total This Month</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                RM {totalMonthlyEarnings.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-700 dark:text-green-300">Approved Classes</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalApprovedClasses}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-700 dark:text-green-300">{format(currentMonth, "MMMM yyyy")}</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">Earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holiday Events */}
      {holidayEvents.length > 0 && (
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Gift className="h-5 w-5" />
              Upcoming Holidays & Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {holidayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.start_time && !isNaN(new Date(event.start_time).getTime())
                          ? format(new Date(event.start_time), "PPP")
                          : "Date not available"}
                      </p>
                      {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">{event.event_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Todays Classes ({format(new Date(), "MMMM d, yyyy")})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <Video className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        {event.start_time && !isNaN(new Date(event.start_time).getTime())
                          ? format(new Date(event.start_time), "h:mm a")
                          : "Time not available"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.course_title}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          RM {event.payment_amount}
                        </div>
                        {event.description && <p>{event.description}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(event.attendance_status || "not_started")}
                    {event.live_class_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={event.live_class_url} target="_blank" rel="noopener noreferrer">
                          Start Class
                        </a>
                      </Button>
                    )}
                    {event.attendance_status === "not_started" && (
                      <Button
                        size="sm"
                        onClick={() => markClassCompleted(event.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No classes scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Completed Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Completed Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastCompletedEvents.length > 0 ? (
              pastCompletedEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-xs text-muted-foreground mt-1">
                        {event.start_time && !isNaN(new Date(event.start_time).getTime())
                          ? format(new Date(event.start_time), "MMM d")
                          : "Date N/A"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.course_title}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.start_time && !isNaN(new Date(event.start_time).getTime())
                            ? format(new Date(event.start_time), "PPP p")
                            : "Date not available"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(event.attendance_status || "completed")}
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-700">RM {event.payment_amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Earned</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No completed classes yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
