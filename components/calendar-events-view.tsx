"use client"

import { useEffect, useState, useCallback } from "react"
import { useSupabase } from "@/hooks/use-supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, DollarSign, BookOpen, User } from "lucide-react"
import { format } from "date-fns"

type CalendarEvent = {
  id: string
  title: string
  description: string | null
  event_type: string
  start_time: string
  end_time: string | null
  all_day: boolean
  course_id: string | null
  teacher_id: string | null
  payment_amount: number | null
  color: string
  course_title?: string
  teacher_name?: string
}

type CalendarEventsViewProps = {
  userRole: "student" | "teacher"
  userId: string
  courseIds?: string[] // For students - courses they're enrolled in
  teacherId?: string // For teachers - their own ID
}

const EVENT_TYPE_COLORS = {
  class: "bg-blue-500",
  assignment: "bg-orange-500", 
  exam: "bg-red-500",
  payment: "bg-green-500",
  holiday: "bg-purple-500",
  other: "bg-gray-500",
}

const EVENT_TYPE_LABELS = {
  class: "Class",
  assignment: "Assignment Due",
  exam: "Exam",
  payment: "Payment Due",
  holiday: "Holiday",
  other: "Other",
}

export default function CalendarEventsView({ userRole, userId, courseIds, teacherId }: CalendarEventsViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching events for", userRole, "with userId:", userId)

      let allEvents: any[] = []

      if (userRole === "student") {
        // Students see:
        // 1. Events for their enrolled courses (class, assignment, exam)
        // 2. Public events (holiday, other)
        
        if (courseIds && courseIds.length > 0) {
          // Course-specific events
          const { data: courseEvents, error: courseError } = await supabase
            .from("calendar_events")
            .select(`
              id,
              title,
              description,
              event_type,
              start_time,
              end_time,
              all_day,
              course_id,
              teacher_id,
              payment_amount,
              color
            `)
            .in("course_id", courseIds)
            .in("event_type", ["class", "assignment", "exam"])
            .order("start_time", { ascending: true })

          if (courseError) {
            console.error("Error fetching course events:", courseError)
          } else {
            allEvents = [...allEvents, ...(courseEvents || [])]
          }
        }

        // Public events for students
        const { data: publicEvents, error: publicError } = await supabase
          .from("calendar_events")
          .select(`
            id,
            title,
            description,
            event_type,
            start_time,
            end_time,
            all_day,
            course_id,
            teacher_id,
            payment_amount,
            color
          `)
          .in("event_type", ["holiday", "other"])
          .order("start_time", { ascending: true })

        if (publicError) {
          console.error("Error fetching public events:", publicError)
        } else {
          allEvents = [...allEvents, ...(publicEvents || [])]
        }

      } else if (userRole === "teacher" && teacherId) {
        // Teachers see:
        // 1. Classes assigned to them
        // 2. Payment events for them  
        // 3. Course events for their courses (assignments, exams)
        // 4. Public events (holidays, general announcements)

        // Classes assigned to teacher
        const { data: classEvents, error: classError } = await supabase
          .from("calendar_events")
          .select(`
            id,
            title,
            description,
            event_type,
            start_time,
            end_time,
            all_day,
            course_id,
            teacher_id,
            payment_amount,
            color
          `)
          .eq("teacher_id", teacherId)
          .eq("event_type", "class")
          .order("start_time", { ascending: true })

        if (classError) {
          console.error("Error fetching class events:", classError)
        } else {
          allEvents = [...allEvents, ...(classEvents || [])]
        }

        // Payment events for teacher
        const { data: paymentEvents, error: paymentError } = await supabase
          .from("calendar_events")
          .select(`
            id,
            title,
            description,
            event_type,
            start_time,
            end_time,
            all_day,
            course_id,
            teacher_id,
            payment_amount,
            color
          `)
          .eq("teacher_id", teacherId)
          .eq("event_type", "payment")
          .order("start_time", { ascending: true })

        if (paymentError) {
          console.error("Error fetching payment events:", paymentError)
        } else {
          allEvents = [...allEvents, ...(paymentEvents || [])]
        }

        // Get teacher's courses
        const { data: teacherCourses } = await supabase
          .from("courses")
          .select("id")
          .eq("teacher_id", teacherId)
        
        const teacherCourseIds = teacherCourses?.map(c => c.id) || []

        // Course events for teacher's courses
        if (teacherCourseIds.length > 0) {
          const { data: courseEvents, error: courseError } = await supabase
            .from("calendar_events")
            .select(`
              id,
              title,
              description,
              event_type,
              start_time,
              end_time,
              all_day,
              course_id,
              teacher_id,
              payment_amount,
              color
            `)
            .in("course_id", teacherCourseIds)
            .in("event_type", ["assignment", "exam"])
            .order("start_time", { ascending: true })

          if (courseError) {
            console.error("Error fetching course events:", courseError)
          } else {
            allEvents = [...allEvents, ...(courseEvents || [])]
          }
        }

        // Public events for teachers
        const { data: publicEvents, error: publicError } = await supabase
          .from("calendar_events")
          .select(`
            id,
            title,
            description,
            event_type,
            start_time,
            end_time,
            all_day,
            course_id,
            teacher_id,
            payment_amount,
            color
          `)
          .in("event_type", ["holiday", "other"])
          .order("start_time", { ascending: true })

        if (publicError) {
          console.error("Error fetching public events:", publicError)
        } else {
          allEvents = [...allEvents, ...(publicEvents || [])]
        }
      }

      console.log("Total events fetched:", allEvents.length)

      // Remove duplicates based on ID
      const uniqueEvents = allEvents.filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      )

      // Fetch related course and teacher information
      const eventsWithRelations = await Promise.all(
        uniqueEvents.map(async (event: any) => {
          let course_title = ""
          let teacher_name = ""

          // Fetch course title if course_id exists
          if (event.course_id) {
            const { data: courseData } = await supabase
              .from("courses")
              .select("title")
              .eq("id", event.course_id)
              .single()
            
            course_title = courseData?.title || ""
          }

          // Fetch teacher name if teacher_id exists
          if (event.teacher_id) {
            const { data: teacherData } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", event.teacher_id)
              .single()
            
            teacher_name = teacherData?.full_name || ""
          }

          return {
            ...event,
            course_title,
            teacher_name,
          }
        })
      )

      setEvents(eventsWithRelations)
    } catch (err: any) {
      console.error("Error fetching events:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userRole, userId, courseIds, teacherId, supabase])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading events...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No upcoming events</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${EVENT_TYPE_COLORS[event.event_type as keyof typeof EVENT_TYPE_COLORS] || EVENT_TYPE_COLORS.other}`}
                      />
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant="outline">
                        {EVENT_TYPE_LABELS[event.event_type as keyof typeof EVENT_TYPE_LABELS] || "Other"}
                      </Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.all_day ? (
                          "All day"
                        ) : (
                          <>
                            {format(new Date(event.start_time), "MMM d, h:mm a")}
                            {event.end_time && " - " + format(new Date(event.end_time), "h:mm a")}
                          </>
                        )}
                      </div>
                      
                      {event.course_title && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {event.course_title}
                        </div>
                      )}
                      
                      {event.teacher_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {event.teacher_name}
                        </div>
                      )}
                      
                      {event.payment_amount && (
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          RM {event.payment_amount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
