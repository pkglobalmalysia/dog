"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, Users, Calendar, Clock, Star, ArrowRight } from "lucide-react"
import { format } from "date-fns"

type Course = {
  id: string
  title: string
  description: string
  teacher_name: string
  scheduled_time: string
  student_count: number
  status: string
  max_students: number
  live_class_url: string
  teacher_id: string
  isEnrolled?: boolean
  enrollmentStatus?: 'none' | 'pending' | 'enrolled'
}

export default function CoursesClient() {
  const { user, isLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'enrolled'>('none')

  const supabase = createClientComponentClient()

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch all active courses from the database
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          scheduled_time,
          live_class_url,
          teacher_id,
          max_students,
          status,
          profiles(full_name),
          enrollments(count)
        `)
        .eq("status", "active")
        .order("scheduled_time", { ascending: true })

      if (coursesError) {
        console.error("Error fetching courses:", coursesError)
        return
      }

      // Get user's enrollments and enrollment requests if user is logged in
      let userEnrollments: any[] = []
      let userEnrollmentRequests: any[] = []

      if (user) {
        // Fetch user's enrollments
        const { data: enrollmentsData } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", user.id)

        userEnrollments = enrollmentsData || []

        // Fetch user's pending enrollment requests
        const { data: requestsData } = await supabase
          .from("enrollment_requests")
          .select("course_id, status")
          .eq("student_id", user.id)
          .eq("status", "pending")

        userEnrollmentRequests = requestsData || []
      }

      const formattedCourses: Course[] = (coursesData || []).map((course) => {
        const teacherProfile = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles
        const enrollmentCount = Array.isArray(course.enrollments) ? course.enrollments.length : 0

        // Check enrollment status for this course
        const isEnrolled = userEnrollments.some(enrollment => enrollment.course_id === course.id)
        const hasPendingRequest = userEnrollmentRequests.some(request => request.course_id === course.id)

        let enrollmentStatus: 'none' | 'pending' | 'enrolled' = 'none'
        if (isEnrolled) {
          enrollmentStatus = 'enrolled'
        } else if (hasPendingRequest) {
          enrollmentStatus = 'pending'
        }

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          teacher_name: teacherProfile?.full_name || "No Teacher Assigned",
          scheduled_time: course.scheduled_time,
          student_count: enrollmentCount,
          status: course.status || "active",
          max_students: course.max_students || 30,
          live_class_url: course.live_class_url || "",
          teacher_id: course.teacher_id || "",
          isEnrolled: isEnrolled,
          enrollmentStatus: enrollmentStatus,
        }
      })
      
      setCourses(formattedCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  const checkEnrollmentStatus = useCallback(async () => {
    if (!user) return

    try {
      // Check if user has any pending enrollment requests
      const { data: pendingRequests } = await supabase
        .from("enrollment_requests")
        .select("id")
        .eq("student_id", user.id)
        .eq("status", "pending")

      if (pendingRequests && pendingRequests.length > 0) {
        setEnrollmentStatus('pending')
        return
      }

      // Check if user is enrolled in any courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)

      if (enrollments && enrollments.length > 0) {
        setEnrollmentStatus('enrolled')
      } else {
        setEnrollmentStatus('none')
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchCourses()
    if (user) {
      checkEnrollmentStatus()
    }
  }, [fetchCourses, checkEnrollmentStatus, user])

  const handleEnrollment = async (courseId: string) => {
    if (!user) {
      // Redirect to login/signup
      window.location.href = '/signup/student'
      return
    }

    // Find the course to check its enrollment status
    const course = courses.find(c => c.id === courseId)
    if (!course) {
      alert("Course not found!")
      return
    }

    if (course.enrollmentStatus === 'enrolled') {
      alert("You are already enrolled in this course!")
      return
    }

    if (course.enrollmentStatus === 'pending') {
      alert("You have already requested enrollment for this course!")
      return
    }

    try {
      // Create enrollment request
      const { error } = await supabase
        .from("enrollment_requests")
        .insert({
          student_id: user.id,
          course_id: courseId,
          status: "pending",
          requested_at: new Date().toISOString(),
        })

      if (error) {
        console.error("Error creating enrollment request:", error)
        alert("Failed to submit enrollment request. Please try again.")
        return
      }

      alert("Enrollment request submitted successfully! You will be notified once approved.")
      
      // Refresh courses to update enrollment status
      fetchCourses()
    } catch (error) {
      console.error("Error handling enrollment:", error)
      alert("An error occurred. Please try again.")
    }
  }

  if (isLoading || loading) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-12 w-96 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-6 w-128 mx-auto mb-8 bg-white/20" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-32 bg-white/20" />
              <Skeleton className="h-12 w-32 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Course Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            English Courses in Malaysia
          </h1>
          <h2 className="text-xl md:text-2xl mb-6 text-blue-100">
            Master English Speaking with iCSE&apos;s Proven Programs
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
            Choose from our comprehensive range of English speaking courses designed specifically 
            for Malaysian professionals. Join 10,000+ successful graduates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
              <Link href="/signup/student">Enroll Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Available Courses</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Browse all courses created by our administrators and request enrollment
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our English Speaking Courses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive English training programs with guaranteed results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-blue-600" />
                  </div>
                  <div className="absolute top-4 left-4">
                    {course.enrollmentStatus === 'enrolled' ? (
                      <Badge className="bg-green-100 text-green-800 font-medium">
                        ✓ Enrolled
                      </Badge>
                    ) : course.enrollmentStatus === 'pending' ? (
                      <Badge className="bg-yellow-100 text-yellow-800 font-medium">
                        ⏳ Pending
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 font-medium">
                        Course
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                      <Users className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-medium">{course.student_count}/{course.max_students}</span>
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Ongoing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{course.student_count} students</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {course.scheduled_time ? format(new Date(course.scheduled_time), 'MMM dd, yyyy') : 'TBA'}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Instructor: <span className="font-medium">{course.teacher_name}</span>
                  </div>

                  <div className="pt-2">
                    {user ? (
                      course.enrollmentStatus === 'enrolled' ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled
                        >
                          ✓ Enrolled
                        </Button>
                      ) : course.enrollmentStatus === 'pending' ? (
                        <Button 
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                          disabled
                        >
                          ⏳ Request Pending
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleEnrollment(course.id)}
                          className="w-full"
                        >
                          Request Enrollment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/signup/student">
                          Sign Up to Enroll
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No courses available
              </h3>
              <p className="text-gray-500">
                Check back later for new courses created by administrators.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your English Learning Journey?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of professionals who have transformed their careers with our English courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/signup/student">Enroll Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More About iCSE</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
