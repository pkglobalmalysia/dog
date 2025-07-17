"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, DollarSign, Video, Users, CheckCircle, Gift, Loader2, Calendar, List } from "lucide-react"
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, isToday, eachDayOfInterval, getDay, isSameDay } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [futureEvents, setFutureEvents] = useState<CalendarEvent[]>([])
  const [pastCompletedEvents, setPastCompletedEvents] = useState<CalendarEvent[]>([])
  const [holidayEvents, setHolidayEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [totalMonthlyEarnings, setTotalMonthlyEarnings] = useState(0)
  const [totalApprovedClasses, setTotalApprovedClasses] = useState(0)
  const [currentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([])
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")

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
        .eq("teacher_id", user?.id)
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

  // Fetch future events (upcoming classes beyond today)
  const fetchFutureEvents = useCallback(async () => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const startOfTomorrow = startOfDay(tomorrow)
      
      // Get events for next 30 days
      const next30Days = new Date()
      next30Days.setDate(next30Days.getDate() + 30)

      const { data: eventsData, error } = await supabase
        .from("calendar_events")
        .select(`
          *,
          courses(title, live_class_url),
          teacher_class_attendance(id, status)
        `)
        .eq("teacher_id", user?.id)
        .eq("event_type", "class")
        .gte("start_time", startOfTomorrow.toISOString())
        .lte("start_time", next30Days.toISOString())
        .order("start_time", { ascending: true })

      if (error) {
        console.error("Error fetching future events:", error)
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
          attendance_status: event.teacher_class_attendance?.[0]?.status || "scheduled",
          attendance_id: event.teacher_class_attendance?.[0]?.id,
        }))
        setFutureEvents(formattedEvents)
      }
    } catch (error) {
      console.error("Error fetching future events:", error)
    }
  }, [supabase, user?.id])

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
        .eq("teacher_id", user?.id)
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
      fetchFutureEvents()
      fetchPastCompletedEvents()
      fetchEarnings()
      fetchHolidayEvents()
    }
  }, [user, currentMonth, fetchTodayEvents, fetchFutureEvents, fetchPastCompletedEvents, fetchEarnings, fetchHolidayEvents])

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Update selected events when date changes
  useEffect(() => {
    const dayEvents = futureEvents.filter((event) => isSameDay(new Date(event.start_time), selectedDate))
    setSelectedEvents(dayEvents)
  }, [futureEvents, selectedDate])

  // Calendar view functions
  const getEventColor = (type: string) => {
    const colors = {
      class: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
      assignment: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
      exam: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
      payment: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
      holiday: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
      other: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(calendarMonth)
    const monthEnd = endOfMonth(calendarMonth)
    const startDate = monthStart
    const endDate = monthEnd

    const dateFormat = "d"
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    // Create weeks array
    const weeks: React.ReactNode[] = []
    let week: React.ReactNode[] = []

    // Add empty cells for days before the first of the month
    const startDay = getDay(monthStart)
    for (let i = 0; i < startDay; i++) {
      week.push(<div key={`empty-${i}`} className="h-24 border p-1 bg-gray-50"></div>)
    }

    // Add days of the month
    days.forEach((day, i) => {
      const dayEvents = futureEvents.filter((event) => isSameDay(new Date(event.start_time), day))
      const isCurrentDay = isToday(day)
      const isSelected = isSameDay(day, selectedDate)

      week.push(
        <div
          key={i}
          className={`h-24 border p-1 overflow-hidden cursor-pointer hover:bg-gray-50 ${isCurrentDay ? "bg-blue-50" : ""} ${isSelected ? "ring-2 ring-blue-500" : ""}`}
          onClick={() => setSelectedDate(day)}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${isCurrentDay ? "text-blue-700" : ""}`}>
              {format(day, dateFormat)}
            </span>
            {dayEvents.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {dayEvents.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1 overflow-hidden max-h-16">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                className={`text-xs truncate rounded px-1 py-0.5 ${getEventColor(event.event_type).bg} ${getEventColor(event.event_type).text}`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
          </div>
        </div>,
      )

      if (getDay(day) === 6 || i === days.length - 1) {
        // Fill in any remaining cells in the week
        const remainingCells = 7 - week.length
        for (let j = 0; j < remainingCells; j++) {
          week.push(<div key={`empty-end-${j}`} className="h-24 border p-1 bg-gray-50"></div>)
        }

        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7">
            {week}
          </div>,
        )
        week = []
      }
    })

    return <div className="space-y-1">{weeks}</div>
  }

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
  }

  // Helper function to check if a class can be marked as completed
  const canMarkAsCompleted = (event: CalendarEvent) => {
    const now = new Date()
    const classEndTime = new Date(event.end_time || event.start_time)
    
    // Add 1 hour to start_time if no end_time (assuming 1-hour classes)
    if (!event.end_time) {
      classEndTime.setHours(classEndTime.getHours() + 1)
    }
    
    // Can only mark as completed if:
    // 1. Class has ended (current time > class end time)
    // 2. Status is not already completed or approved
    const hasEnded = now > classEndTime
    const notCompleted = event.attendance_status !== "completed" && event.attendance_status !== "approved"
    
    return hasEnded && notCompleted
  }

  // Helper function to get time status message
  const getTimeStatusMessage = (event: CalendarEvent) => {
    const now = new Date()
    const classStartTime = new Date(event.start_time)
    const classEndTime = new Date(event.end_time || event.start_time)
    
    if (!event.end_time) {
      classEndTime.setHours(classEndTime.getHours() + 1)
    }
    
    if (now < classStartTime) {
      return "Class hasn't started yet"
    } else if (now >= classStartTime && now <= classEndTime) {
      return "Class is currently in progress"
    } else {
      return "Class has ended"
    }
  }

  const markClassCompleted = async (eventId: string, attendanceId?: string) => {
    try {
      setSubmitting(eventId)
      
      if (attendanceId) {
        // Update existing attendance record
        const { data, error } = await supabase
          .from("teacher_class_attendance")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            base_amount: 150,
            total_amount: 150,
          })
          .eq("id", attendanceId)
          .select()

        if (error) {
          console.error("Supabase error updating attendance:", error)
          throw new Error(error.message || "Failed to update attendance record")
        }
        console.log("Updated attendance record:", data)
      } else {
        // Create new attendance record
        const { data, error } = await supabase
          .from("teacher_class_attendance")
          .insert({
            calendar_event_id: eventId,
            teacher_id: user?.id,
            status: "completed",
            completed_at: new Date().toISOString(),
            base_amount: 150,
            bonus_amount: 0,
            total_amount: 150,
          })
          .select()

        if (error) {
          console.error("Supabase error creating attendance:", error)
          throw new Error(error.message || "Failed to create attendance record")
        }
        console.log("Created attendance record:", data)
      }

      setMessage({ type: "success", text: "Class marked as completed! Waiting for admin approval for salary payment." })
      
      // Refresh the events
      fetchTodayEvents()
      fetchFutureEvents()
      fetchPastCompletedEvents()
      fetchEarnings()
    } catch (error: any) {
      console.error("Error marking class as completed:", error)
      const errorMessage = error?.message || error?.toString() || "Failed to mark class as completed"
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setSubmitting(null)
    }
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

      {/* Message Display */}
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Future Classes */}
      {/* Calendar/List View for Upcoming Classes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            {viewMode === "calendar" ? (
              <>
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  Previous
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(calendarMonth, "MMMM yyyy")} - Classes Calendar
                </CardTitle>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  Next
                </Button>
              </>
            ) : (
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Upcoming Classes (Next 30 Days)
              </CardTitle>
            )}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "calendar" ? (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-medium text-sm py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {renderCalendar()}
            </>
          ) : (
            /* List View */
            <div className="space-y-4">
              {futureEvents.length > 0 ? (
                futureEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">
                          {event.start_time && !isNaN(new Date(event.start_time).getTime())
                            ? format(new Date(event.start_time), "MMM d")
                            : "Date TBD"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.start_time && !isNaN(new Date(event.start_time).getTime())
                              ? format(new Date(event.start_time), "PPP 'at' h:mm a")
                              : "Time not available"}
                          </div>
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
                      {getStatusBadge(event.attendance_status || "scheduled")}
                      {event.attendance_status !== "completed" && event.attendance_status !== "approved" && (
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markClassCompleted(event.id, event.attendance_id)}
                            disabled={submitting === event.id || !canMarkAsCompleted(event)}
                          >
                            {submitting === event.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                Submitting...
                              </>
                            ) : (
                              "Mark Complete"
                            )}
                          </Button>
                          {!canMarkAsCompleted(event) && (
                            <span className="text-xs text-muted-foreground">
                              {getTimeStatusMessage(event)}
                            </span>
                          )}
                        </div>
                      )}
                      {event.live_class_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={event.live_class_url} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-1" />
                            Join Class
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No upcoming classes scheduled</p>
                  <p className="text-sm text-muted-foreground mt-1">Check back later for new classes</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Day Events - Only show in calendar mode */}
      {viewMode === "calendar" && (
        <Card>
          <CardHeader>
            <CardTitle>Classes for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">
                          {event.start_time && !isNaN(new Date(event.start_time).getTime())
                            ? format(new Date(event.start_time), "h:mm a")
                            : "Time TBD"}
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
                      {getStatusBadge(event.attendance_status || "scheduled")}
                      {event.attendance_status !== "completed" && event.attendance_status !== "approved" && (
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markClassCompleted(event.id, event.attendance_id)}
                            disabled={submitting === event.id || !canMarkAsCompleted(event)}
                          >
                            {submitting === event.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                Submitting...
                              </>
                            ) : (
                              "Mark Complete"
                            )}
                          </Button>
                          {!canMarkAsCompleted(event) && (
                            <span className="text-xs text-muted-foreground">
                              {getTimeStatusMessage(event)}
                            </span>
                          )}
                        </div>
                      )}
                      {event.live_class_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={event.live_class_url} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-1" />
                            Join Class
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No classes scheduled for this day</p>
                  <p className="text-sm text-muted-foreground mt-1">Select another date to view classes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                    {(event.attendance_status === "not_started" || event.attendance_status === "scheduled") && (
                      <div className="flex flex-col items-end gap-1">
                        <Button
                          size="sm"
                          onClick={() => markClassCompleted(event.id, event.attendance_id)}
                          disabled={submitting === event.id || !canMarkAsCompleted(event)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {submitting === event.id ? (
                            "Processing..."
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                        {!canMarkAsCompleted(event) && (
                          <span className="text-xs text-muted-foreground">
                            {getTimeStatusMessage(event)}
                          </span>
                        )}
                      </div>
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
