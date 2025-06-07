"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2, Clock, DollarSign, Eye, Filter, RefreshCw, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Valid event types that match the database constraint
const VALID_EVENT_TYPES = ["class", "assignment", "exam", "payment", "holiday", "other"] as const
type EventType = (typeof VALID_EVENT_TYPES)[number]

type CalendarEvent = {
  id: string
  title: string
  description: string | null
  event_type: EventType
  start_time: string
  end_time: string | null
  all_day: boolean
  course_id: string | null
  teacher_id: string | null
  payment_amount: number | null
  color: string
  course_title?: string
  teacher_name?: string
  created_by?: string | null
  created_at?: string | null
}

type Course = {
  id: string
  title: string
}

type Teacher = {
  id: string
  full_name: string
}

type Message = {
  type: "success" | "error" | "info"
  text: string
}

// Helper functions for proper date handling
const formatDateForInput = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  // Convert to local timezone for datetime-local input
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

const formatDateForStorage = (localDateString: string) => {
  if (!localDateString) return ""
  // Create date from local datetime-local input and convert to ISO
  const localDate = new Date(localDateString)
  return localDate.toISOString()
}

export default function AdminCalendar() {
  const { user, profile } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [showEventsList, setShowEventsList] = useState(true)

  // Filter states
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [filterTeacher, setFilterTeacher] = useState<string>("all")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "class" as EventType,
    start_time: "",
    end_time: "",
    all_day: false,
    course_id: "",
    teacher_id: "",
    payment_amount: "",
    color: "#3b82f6",
  })

  const supabase = createClientComponentClient()

  // Wrap applyFilters with useCallback to fix the dependency issue
  const applyFilters = useCallback(() => {
    let filtered = [...events]

    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.event_type === filterType)
    }

    if (filterCourse !== "all") {
      filtered = filtered.filter((event) => event.course_id === filterCourse)
    }

    if (filterTeacher !== "all") {
      filtered = filtered.filter((event) => event.teacher_id === filterTeacher)
    }

    setFilteredEvents(filtered)
  }, [events, filterType, filterCourse, filterTeacher])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Fetching calendar data...")

      // Use a simple select query with all expected columns
      const { data: eventsData, error: eventsError } = await supabase
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
          color,
          created_by,
          created_at
        `)
        .order("start_time", { ascending: true })

      if (eventsError) {
        console.error("Error fetching events:", eventsError)
        setMessage({
          type: "error",
          text: `Failed to fetch events: ${eventsError.message}. Please run the database setup scripts.`,
        })
        return
      }

      // Process events data with safe defaults
      const processedEvents: CalendarEvent[] = (eventsData || []).map((event: any) => ({
        id: event.id,
        title: event.title || "Untitled Event",
        description: event.description || null,
        event_type: VALID_EVENT_TYPES.includes(event.event_type) ? event.event_type : "other",
        start_time: event.start_time,
        end_time: event.end_time || null,
        all_day: event.all_day ?? false,
        course_id: event.course_id || null,
        teacher_id: event.teacher_id || null,
        payment_amount: event.payment_amount || null,
        color: event.color || "#3b82f6",
        created_by: event.created_by || null,
        created_at: event.created_at || null,
      }))

      // Fetch related data for each event
      const eventsWithRelations = await Promise.all(
        processedEvents.map(async (event: CalendarEvent) => {
          let course_title = ""
          let teacher_name = ""

          if (event.course_id) {
            try {
              const { data: courseData } = await supabase
                .from("courses")
                .select("title")
                .eq("id", event.course_id)
                .single()
              course_title = courseData?.title || ""
            } catch (error) {
              console.warn("Could not fetch course data for event:", event.id)
            }
          }

          if (event.teacher_id) {
            try {
              const { data: teacherData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", event.teacher_id)
                .single()
              teacher_name = teacherData?.full_name || ""
            } catch (error) {
              console.warn("Could not fetch teacher data for event:", event.id)
            }
          }

          return {
            ...event,
            course_title,
            teacher_name,
          }
        }),
      )

      setEvents(eventsWithRelations)

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title")
        .order("title")

      if (coursesError) {
        console.error("Error fetching courses:", coursesError)
      } else {
        setCourses(coursesData || [])
      }

      // Fetch teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "teacher")
        .eq("approved", true)
        .order("full_name")

      if (teachersError) {
        console.error("Error fetching teachers:", teachersError)
      } else {
        setTeachers(teachersData || [])
      }

      if (!eventsError && !coursesError && !teachersError) {
        setMessage({
          type: "success",
          text: "Calendar data loaded successfully!",
        })
      }
    } catch (error: unknown) {
      console.error("Error fetching data:", error)
      setMessage({
        type: "error",
        text: "Failed to load calendar data. Please ensure the database is properly set up.",
      })
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

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const clearFilters = () => {
    setFilterType("all")
    setFilterCourse("all")
    setFilterTeacher("all")
    setMessage({ type: "info", text: "Filters cleared!" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.start_time) {
      setMessage({ type: "error", text: "Please fill in required fields" })
      return
    }

    if (!user?.id) {
      setMessage({ type: "error", text: "User not authenticated" })
      return
    }

    setSubmitting(true)

    try {
      // Ensure event_type is one of the valid types
      const eventType = VALID_EVENT_TYPES.includes(formData.event_type as EventType) ? formData.event_type : "other"

      console.log("Submitting event with type:", eventType)

      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_type: eventType,
        start_time: formatDateForStorage(formData.start_time),
        end_time: formData.end_time ? formatDateForStorage(formData.end_time) : null,
        all_day: formData.all_day,
        course_id: formData.course_id || null,
        teacher_id: formData.teacher_id || null,
        payment_amount: formData.payment_amount ? Number.parseFloat(formData.payment_amount) : null,
        color: formData.color,
        created_by: user.id,
      }

      if (editingEvent) {
        const { error } = await supabase.from("calendar_events").update(eventData).eq("id", editingEvent.id)

        if (error) throw new Error(`Failed to update event: ${error.message}`)
        setMessage({ type: "success", text: "Event updated successfully!" })
      } else {
        const { error } = await supabase.from("calendar_events").insert(eventData)

        if (error) throw new Error(`Failed to create event: ${error.message}`)
        setMessage({ type: "success", text: "Event created successfully!" })

        // Auto-create lecture if it's a class event
        if (formData.event_type === "class" && formData.course_id) {
          await createLectureFromEvent(eventData)
        }
      }

      resetForm()
      await fetchData()
    } catch (error: unknown) {
      console.error("Submit error:", error)
      setMessage({
        type: "error",
        text: (error as any).message || "Failed to save event",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const createLectureFromEvent = async (eventData: any) => {
    try {
      await supabase.from("lectures").insert({
        title: eventData.title,
        description: eventData.description || "",
        date: eventData.start_time,
        course_id: eventData.course_id,
      })
      console.log("Auto-created lecture from calendar event")
    } catch (error) {
      console.error("Failed to auto-create lecture:", error)
    }
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || "",
      event_type: VALID_EVENT_TYPES.includes(event.event_type as EventType) ? event.event_type : "other",
      start_time: formatDateForInput(event.start_time),
      end_time: event.end_time ? formatDateForInput(event.end_time) : "",
      all_day: event.all_day,
      course_id: event.course_id || "",
      teacher_id: event.teacher_id || "",
      payment_amount: event.payment_amount?.toString() || "",
      color: event.color || "#3b82f6",
    })
    setShowEventsList(false)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This will also delete any associated lectures.")) return

    try {
      // Delete associated lectures first
      await supabase.from("lectures").delete().eq("course_id", eventId)

      // Delete the event
      const { error } = await supabase.from("calendar_events").delete().eq("id", eventId)

      if (error) throw new Error(`Failed to delete event: ${error.message}`)
      setMessage({ type: "success", text: "Event deleted successfully!" })
      await fetchData()
    } catch (error: unknown) {
      console.error("Delete error:", error)
      setMessage({
        type: "error",
        text: (error as any).message || "Failed to delete event",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_type: "class",
      start_time: "",
      end_time: "",
      all_day: false,
      course_id: "",
      teacher_id: "",
      payment_amount: "",
      color: "#3b82f6",
    })
    setEditingEvent(null)
    setShowEventsList(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      class: "bg-blue-100 text-blue-800",
      assignment: "bg-orange-100 text-orange-800",
      exam: "bg-red-100 text-red-800",
      payment: "bg-green-100 text-green-800",
      holiday: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading calendar...</p>
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Calendar Management - ADMIN CONTROL
        </h1>
        <p className="mt-2 opacity-90">Full control over calendar events, auto-creates lectures for classes.</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">All calendar events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.event_type === "class").length}</div>
            <p className="text-xs text-muted-foreground">Scheduled classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.event_type === "exam").length}</div>
            <p className="text-xs text-muted-foreground">Scheduled exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEvents.length}</div>
            <p className="text-xs text-muted-foreground">Showing events</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Event Filters
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEventsList(!showEventsList)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showEventsList ? "Hide Events" : "Show Events"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="assignment">Assignment Due</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="payment">Teacher Payment</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create/Edit Event Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingEvent ? "Edit Event" : "Create New Event"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="event_type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({ ...formData, event_type: value as EventType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">Class (Auto-creates Lecture)</SelectItem>
                    <SelectItem value="assignment">Assignment Due</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="payment">Teacher Payment</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {(formData.event_type === "class" ||
                formData.event_type === "assignment" ||
                formData.event_type === "exam") && (
                <div>
                  <Label htmlFor="course_id">Course *</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(formData.event_type === "class" || formData.event_type === "payment") && (
                <div>
                  <Label htmlFor="teacher_id">Teacher *</Label>
                  <Select
                    value={formData.teacher_id}
                    onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.event_type === "payment" && (
                <div>
                  <Label htmlFor="payment_amount">Payment Amount (RM)</Label>
                  <Input
                    id="payment_amount"
                    name="payment_amount"
                    type="number"
                    step="0.01"
                    value={formData.payment_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Event description (optional)"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                </Button>
                {editingEvent && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Events List */}
        {showEventsList && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Calendar Events</span>
                <Badge variant="secondary">{filteredEvents.length} events</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.event_type)}`}>
                            {event.event_type}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.start_time && !isNaN(new Date(event.start_time).getTime())
                              ? format(new Date(event.start_time), "PPP p")
                              : "Invalid date"}
                          </div>
                          {event.course_title && <p>Course: {event.course_title}</p>}
                          {event.teacher_name && <p>Teacher: {event.teacher_name}</p>}
                          {event.payment_amount && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              RM {event.payment_amount}
                            </div>
                          )}
                          {event.description && <p>{event.description}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      {events.length === 0 ? "No events created yet" : "No events match your filters"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
