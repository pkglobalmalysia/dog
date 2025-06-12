"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { BookOpen, Users, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Course = {
  id: string
  title: string
  description: string
  scheduled_time: string
  teacher_name: string
  enrollment_count: number
  max_students: number
  status: string
  is_enrolled: boolean
  has_pending_request: boolean
}

type Message = {
  type: "success" | "error"
  text: string
}

export default function CoursesPage() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)

  const supabase = createClientComponentClient()

  const fetchCourses = useCallback(async () => {
    try {
      // Fetch all active courses with teacher info and enrollment count
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          scheduled_time,
          max_students,
          status,
          profiles(full_name),
          enrollments(count)
        `)
        .eq("status", "active")
        .order("scheduled_time", { ascending: true })

      if (coursesError) throw coursesError

      if (coursesData) {
        // Check enrollment status for each course if user is logged in
        const coursesWithStatus = await Promise.all(
          coursesData.map(async (course) => {
            let is_enrolled = false
            let has_pending_request = false

            if (user && profile?.role === "student") {
              // Check if already enrolled
              const { data: enrollment } = await supabase
                .from("enrollments")
                .select("id")
                .eq("student_id", user.id)
                .eq("course_id", course.id)
                .single()

              is_enrolled = !!enrollment

              // Check if has pending request
              if (!is_enrolled) {
                const { data: request } = await supabase
                  .from("enrollment_requests")
                  .select("id")
                  .eq("student_id", user.id)
                  .eq("course_id", course.id)
                  .eq("status", "pending")
                  .single()

                has_pending_request = !!request
              }
            }

            return {
              id: course.id,
              title: course.title,
              description: course.description,
              scheduled_time: course.scheduled_time,
              teacher_name: course.profiles?.[0]?.full_name || "No Teacher Assigned",
              enrollment_count: Array.isArray(course.enrollments) ? course.enrollments.length : 0,
              max_students: course.max_students || 30,
              status: course.status,
              is_enrolled,
              has_pending_request,
            }
          }),
        )

        setCourses(coursesWithStatus)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      setMessage({ type: "error", text: "Failed to load courses" })
    } finally {
      setLoading(false)
    }
  }, [user, profile, supabase])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleEnrollmentRequest = async (courseId: string) => {
    if (!user || profile?.role !== "student") {
      setMessage({ type: "error", text: "Please log in as a student to enroll" })
      return
    }

    try {
      const { error } = await supabase.from("enrollment_requests").insert({
        student_id: user.id,
        course_id: courseId,
        status: "pending",
        requested_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({ type: "success", text: "Enrollment request submitted! Please wait for admin approval." })
      fetchCourses() // Refresh to update button states
    } catch (error: any) {
      if (error.code === "23505") {
        setMessage({ type: "error", text: "You have already requested enrollment for this course" })
      } else {
        setMessage({ type: "error", text: error.message || "Failed to submit enrollment request" })
      }
    }
  }

  const getEnrollmentButton = (course: Course) => {
    if (!user || profile?.role !== "student") {
      return (
        <Button variant="outline" disabled>
          Login as Student to Enroll
        </Button>
      )
    }

    if (course.is_enrolled) {
      return (
        <Button disabled className="bg-green-600">
          <CheckCircle className="h-4 w-4 mr-2" />
          Enrolled
        </Button>
      )
    }

    if (course.has_pending_request) {
      return (
        <Button disabled variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Request Pending
        </Button>
      )
    }

    if (course.enrollment_count >= course.max_students) {
      return (
        <Button disabled variant="outline">
          Course Full
        </Button>
      )
    }

    return <Button onClick={() => handleEnrollmentRequest(course.id)}>Request Enrollment</Button>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold">Available Courses</h1>
            <p className="text-muted-foreground mt-2">Browse and enroll in courses offered by our expert teachers</p>
          </div>

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="mt-1">Teacher: {course.teacher_name}</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Course
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(course.scheduled_time), "PPP p")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {course.enrollment_count}/{course.max_students} students enrolled
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">{getEnrollmentButton(course)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p>No courses available at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later for new course offerings</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
