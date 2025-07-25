"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { useSupabase } from "@/hooks/use-supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Calendar, FileText, Video, DollarSign, Award, Play } from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import CalendarEventsView from "@/components/calendar-events-view"

type Course = {
  id: string
  title: string
  description: string
  scheduled_time: string
  live_class_url: string
  student_count: number
}

type Student = {
  id: string
  full_name: string
  email: string
  course_title: string
  enrollment_date: string
}

type Assignment = {
  id: string
  title: string
  due_date: string
  course_title: string
  submissions_count: number
  total_students: number
}

type TeacherStats = {
  totalCourses: number
  totalStudents: number
  totalAssignments: number
  currentMonthEarnings: number
  approvedClasses: number
}

export default function TeacherDashboard() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [stats, setStats] = useState<TeacherStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    currentMonthEarnings: 0,
    approvedClasses: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = useSupabase()

  const fetchTeacherData = useCallback(async () => {
    if (!user) {
      return
    }

    try {
      const { data: coursesData } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          scheduled_time,
          live_class_url,
          enrollments(count)
        `)
        .eq("teacher_id", user.id)
        .order("scheduled_time", { ascending: true })

      if (coursesData) {
        const formattedCourses = coursesData.map((course) => {
          return {
            id: course.id,
            title: course.title,
            description: course.description,
            scheduled_time: course.scheduled_time,
            live_class_url: course.live_class_url,
            student_count: course.enrollments?.[0]?.count || 0,
          }
        })
        setCourses(formattedCourses)

        const courseIds = formattedCourses.map((c) => c.id)

        // Get all enrollments for teacher's courses
        const { data: enrollmentData } = await supabase
          .from("enrollments")
          .select("student_id, course_id, enrolled_at")
          .in("course_id", courseIds)
          .order("enrolled_at", { ascending: false })

        if (enrollmentData && enrollmentData.length > 0) {
          const studentIds = enrollmentData.map((e) => e.student_id)
          
          // Get student profiles
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", studentIds)

          // Get course titles
          const { data: coursesInfo } = await supabase
            .from("courses")
            .select("id, title")
            .in("id", courseIds)

          if (profilesData && coursesInfo) {
            const formattedStudents = enrollmentData.map((enrollment) => {
              const profile = profilesData.find(p => p.id === enrollment.student_id)
              const course = coursesInfo.find(c => c.id === enrollment.course_id)
              return {
                id: profile?.id || "",
                full_name: profile?.full_name || "",
                email: profile?.email || "",
                course_title: course?.title || "",
                enrollment_date: enrollment.enrolled_at || new Date().toISOString(),
              }
            }).filter(student => student.id) // Filter out any students without valid profiles
            setStudents(formattedStudents)
          }
        } else {
          setStudents([])
        }

        // Get teacher's courses first, then assignments for those courses
        const teacherCourseIds = coursesData?.map(course => course.id) || [];
        
        let assignmentsData: any[] | null = null;
        
        if (teacherCourseIds.length > 0) {
          const result = await supabase
            .from("assignments")
            .select(`
              id,
              title,
              due_date,
              course_id,
              courses(title),
              assignments_submissions(count)
            `)
            .in("course_id", teacherCourseIds)
            .order("due_date", { ascending: false })
            .limit(10);
          
          assignmentsData = result.data;
        } else {
          assignmentsData = [];
        }

        if (assignmentsData) {
          const formattedAssignments = assignmentsData.map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            due_date: assignment.due_date,
            course_title: assignment.courses?.[0]?.title || "",
            submissions_count: assignment.assignments_submissions?.length || 0,
            total_students: formattedCourses.find((c) => c.title === assignment.courses?.[0]?.title)?.student_count || 0,
          }))
          setAssignments(formattedAssignments)
        } else {
          // Handle the case where assignments query failed due to auth issues
          setAssignments([])
        }

        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()

        // Fetch approved lecture earnings for current month
        const { data: earningsData } = await supabase
          .from("lecture_attendance")
          .select(`
            total_amount,
            approved_at,
            lectures(date)
          `)
          .eq("teacher_id", user.id)
          .eq("status", "approved")

        let currentMonthEarnings = 0
        let approvedClasses = 0

        if (earningsData) {
          earningsData.forEach((record) => {
            if (record.approved_at) {
              const approvedDate = new Date(record.approved_at)
              if (approvedDate.getMonth() + 1 === currentMonth && approvedDate.getFullYear() === currentYear) {
                currentMonthEarnings += record.total_amount || 0
                approvedClasses += 1
              }
            }
          })
        }

        const totalCourses = formattedCourses.length
        const totalStudents = formattedCourses.reduce((sum, course) => sum + course.student_count, 0)
        const totalAssignments = assignmentsData?.length || 0

        setStats({
          totalCourses,
          totalStudents,
          totalAssignments,
          currentMonthEarnings, // This now includes approved lecture payments
          approvedClasses,
        })
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      fetchTeacherData()
    }
  }, [user, fetchTeacherData, loading])

  // Fallback effect to handle auth initialization delays
  useEffect(() => {
    if (!user && !loading) {
      const timer = setTimeout(() => {
        if (profile && !user) {
          window.location.reload()
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [user, loading, profile])

  // Retry mechanism for assignments when they're missing but courses exist
  useEffect(() => {
    if (user && stats.totalCourses > 0 && stats.totalAssignments === 0 && assignments.length === 0) {
      const timer = setTimeout(() => {
        fetchTeacherData()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [user, stats, assignments.length, fetchTeacherData])

  const getUpcomingClass = () => {
    const now = new Date()
    return courses.find((course) => new Date(course.scheduled_time) > now)
  }

  const upcomingClass = getUpcomingClass()

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="glass-effect rounded-2xl p-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-20" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border-0 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, <span className="text-gradient">{profile?.full_name}</span>! 👨‍🏫
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              You are teaching <span className="font-semibold text-blue-600">{stats.totalCourses}</span> courses to{" "}
              <span className="font-semibold text-green-600">{stats.totalStudents}</span> students.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl flex-1 sm:flex-none">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">RM {stats.currentMonthEarnings.toFixed(0)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-xl card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Courses</CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Students</CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Assignments</CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Created assignments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Monthly Earnings</CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">RM {stats.currentMonthEarnings.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">{stats.approvedClasses} approved classes</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Class */}
      {upcomingClass && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-blue-800 dark:text-blue-200 text-base sm:text-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              Next Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">{upcomingClass.title}</h3>
                <div className="space-y-1">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    {upcomingClass.student_count} students enrolled
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    {format(new Date(upcomingClass.scheduled_time), "PPP p")}
                  </p>
                </div>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg w-full sm:w-auto">
                <a href={upcomingClass.live_class_url} target="_blank" rel="noopener noreferrer">
                  <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Start Class
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Recent Assignments */}
        <Card className="border-0 shadow-xl glass-effect">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                Recent Assignments
              </CardTitle>
              <Button variant="outline" size="sm" asChild className="hover:bg-purple-50 w-full sm:w-auto">
                <Link href="/dashboard/teacher/assignments">Manage All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.course_title}</p>
                    <p className="text-xs text-muted-foreground">Due: {format(new Date(assignment.due_date), "PPP")}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                      {assignment.submissions_count}/{assignment.total_students} submitted
                    </Badge>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-sm">No assignments created yet</p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/dashboard/teacher/assignments">Create Assignment</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="border-0 shadow-xl glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Recent Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {students.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                      {student.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{student.full_name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                    <p className="text-xs text-muted-foreground">Enrolled in: {student.course_title}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(student.enrollment_date), "MMM dd")}
                    </p>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-sm">No students enrolled yet</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Students will appear here when they enroll</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Events Section */}
      <CalendarEventsView 
        userRole="teacher" 
        userId={user?.id || ""} 
        teacherId={user?.id || ""}
      />

      {/* My Courses */}
      <Card className="border-0 shadow-xl glass-effect">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              My Courses
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit">
              {courses.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    {course.student_count} students
                  </Badge>
                </div>
                <h4 className="font-semibold mb-2 text-base sm:text-lg">{course.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-muted-foreground flex items-center gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    {format(new Date(course.scheduled_time), "MMM dd, p")}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full hover:bg-blue-50" asChild>
                  <a href={course.live_class_url} target="_blank" rel="noopener noreferrer">
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Start Class
                  </a>
                </Button>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full text-center py-8 sm:py-12">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No courses assigned yet</h3>
                <p className="text-sm text-muted-foreground">
                  Courses are created by administrators and assigned to teachers
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
