"use client"


import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, BookOpen, FileText, AlertCircle, Video, Gift } from "lucide-react"
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns"

type CalendarEvent = {
  id: string
  title: string
  description: string
  event_type: "class" | "assignment" | "exam" | "holiday" | "other"
  start_time: string
  end_time: string
  course_title: string
  teacher_name: string
  live_class_url?: string
}

export default function StudentCalendar() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([])

  const supabase = createClientComponentClient()

  // Wrap createEventsFromDatabase with useCallback to fix the dependency issue
  const createEventsFromDatabase = useCallback(async () => {
    try {
      const events: CalendarEvent[] = []

      // Get enrolled courses
      const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("student_id", user?.id)

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e) => e.course_id)

        // Fetch courses for class events
        const { data: coursesData } = await supabase
          .from("courses")
          .select(`
            id,
            title,
            description,
            scheduled_time,
            live_class_url,
            profiles(full_name)
          `)
          .in("id", courseIds)

        if (coursesData) {
          coursesData.forEach((course) => {
            // profiles is an array, get first element safely
            const teacherProfile = Array.isArray(course.profiles) ? course.profiles[0] : undefined

            events.push({
              id: `course-${course.id}`,
              title: course.title,
              description: course.description || `Live class for ${course.title}`,
              event_type: "class",
              start_time: course.scheduled_time,
              end_time: new Date(new Date(course.scheduled_time).getTime() + 60 * 60 * 1000).toISOString(),
              course_title: course.title,
              teacher_name: teacherProfile?.full_name || "Unknown Teacher",
              live_class_url: course.live_class_url || "",
            })
          })
        }

        // Fetch assignments for assignment events
        const { data: assignmentsData } = await supabase
          .from("assignments")
          .select(`
            id,
            title,
            description,
            due_date,
            courses(title)
          `)
          .in("course_id", courseIds)

        if (assignmentsData) {
          assignmentsData.forEach((assignment) => {
            // courses is an array, get first element safely
            const course = Array.isArray(assignment.courses) ? assignment.courses[0] : undefined

            events.push({
              id: `assignment-${assignment.id}`,
              title: assignment.title,
              description: assignment.description || `Assignment due: ${assignment.title}`,
              event_type: "assignment",
              start_time: assignment.due_date,
              end_time: assignment.due_date,
              course_title: course?.title || "Unknown Course",
              teacher_name: "", // fill if you want
            })
          })
        }
      }

      // Fetch holiday and other public events from calendar_events (visible to all students)
      const { data: holidayEvents } = await supabase
        .from("calendar_events")
        .select(`
          id,
          title,
          description,
          event_type,
          start_time,
          end_time
        `)
        .in("event_type", ["holiday", "other"])
        .order("start_time", { ascending: true })

      if (holidayEvents) {
        holidayEvents.forEach((event) => {
          events.push({
            id: `holiday-${event.id}`,
            title: event.title,
            description: event.description || "",
            event_type: event.event_type as "holiday" | "other",
            start_time: event.start_time,
            end_time: event.end_time || event.start_time,
            course_title: "",
            teacher_name: "",
          })
        })
      }

      setEvents(events)
    } catch (error) {
      console.error("Error creating events from database:", error)
      setEvents([])
    }
  }, [user?.id, supabase, setEvents])

  const fetchEvents = useCallback(async () => {
    if (!user) return

    try {
      // Create events from actual course data, assignments, and holiday events
      await createEventsFromDatabase()
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [user, createEventsFromDatabase, setLoading])

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user, currentMonth, fetchEvents])

  useEffect(() => {
    const filtered = events.filter((event) => isSameDay(new Date(event.start_time), selectedDate))
    setSelectedEvents(filtered)
  }, [selectedDate, events])

  const getEventIcon = (type: string) => {
    const icons = {
      class: Video,
      assignment: FileText,
      exam: AlertCircle,
      holiday: Gift,
      other: Clock,
    }
    return icons[type as keyof typeof icons] || Clock
  }

  const getEventColor = (type: string) => {
    const colors = {
      class: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
      assignment: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
      exam: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
      holiday: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
      other: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
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
      const dayEvents = events.filter((event) => isSameDay(new Date(event.start_time), day))
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
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading calendar...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-8 w-8" />
          My Calendar
        </h1>
        <p className="mt-2 opacity-90">Stay on top of your classes, assignments, holidays, and important dates.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">All events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.event_type === "class").length}</div>
            <p className="text-xs text-muted-foreground">Scheduled classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.event_type === "assignment").length}</div>
            <p className="text-xs text-muted-foreground">Due assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holidays</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.event_type === "holiday").length}</div>
            <p className="text-xs text-muted-foreground">Holiday events</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              Previous
            </Button>
            <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Selected Day Events */}
      <Card>
        <CardHeader>
          <CardTitle>Events for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => {
                const Icon = getEventIcon(event.event_type)
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{format(new Date(event.start_time), "h:mm a")}</p>
                          {event.course_title && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {event.course_title}
                            </div>
                          )}
                          {event.teacher_name && <p>Teacher: {event.teacher_name}</p>}
                          {event.description && <p>{event.description}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getEventColor(event.event_type).bg} ${getEventColor(event.event_type).text}`}
                      >
                        {event.event_type}
                      </Badge>
                      {event.event_type === "class" && event.live_class_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={event.live_class_url} target="_blank" rel="noopener noreferrer">
                            Join Class
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No events scheduled for this day</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
