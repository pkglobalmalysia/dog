"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/stat-card"
import { ProgressCircle } from "@/components/dashboard/progress-circle"
import { UpcomingClassCard } from "@/components/dashboard/upcoming-class-card"
import { CourseProgressRow } from "@/components/dashboard/course-progress-row"
import { BookOpen, Clock, FileText, Video, CheckCircle, X } from "lucide-react"
import { isFuture, format } from "date-fns"

type Course = {
  id: string
  title: string
  description: string
  scheduled_time: string
  live_class_url: string
  teacher_id: string
  teacher_name: string
  totalAssignments: number
  completedAssignments: number
  progress: number
}

type Assignment = {
  id: string
  title: string
  due_date: string
  max_points: number
  course_title: string
  submission?: {
    grade?: number
    submitted_at: string
  }
}

type AttendanceRecord = {
  date: string
  status: string
  course_title: string
}

type GradeStats = {
  totalAssignments: number
  completedAssignments: number
  averageGrade: number
  totalPoints: number
  earnedPoints: number
}

export default function StudentDashboard() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [gradeStats, setGradeStats] = useState<GradeStats>({
    totalAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0,
    totalPoints: 0,
    earnedPoints: 0,
  })
  const [loading, setLoading] = useState(true)
  const [enrollmentStatus, setEnrollmentStatus] = useState<"enrolled" | "pending" | "none">("none")

  const supabase = createClientComponentClient()

  // Wrap fetchStudentData with useCallback to fix the dependency issue
  const fetchStudentData = useCallback(async () => {
    if (!user) return

    try {
      // Get enrolled courses
      const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("student_id", user.id)

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e) => e.course_id)

        // Fetch courses with teacher info
        const { data: coursesData } = await supabase
          .from("courses")
          .select(`
            id,
            title,
            description,
            scheduled_time,
            live_class_url,
            teacher_id,
            profiles(full_name)
          `)
          .in("id", courseIds)
          .order("scheduled_time", { ascending: true })

        // Fetch assignments for each course to calculate real progress
        const { data: assignmentsData } = await supabase
          .from("assignments")
          .select(`
            id,
            title,
            due_date,
            max_points,
            course_id,
            courses(title),
            assignment_submissions(
              grade,
              submitted_at,
              student_id
            )
          `)
          .in("course_id", courseIds)
          .order("due_date", { ascending: false })

        if (coursesData) {
          // Calculate real progress for each course based on assignments
        const formattedCourses = coursesData.map((course) => {
  const courseAssignments = assignmentsData?.filter((a) => a.course_id === course.id) || [];
  const courseSubmissions = courseAssignments.filter((a) =>
    a.assignment_submissions?.some((sub) => sub.student_id === user.id),
  );

  const totalAssignments = courseAssignments.length;
  const completedAssignments = courseSubmissions.length;
  const progress = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  // Fix profiles array access
  const teacherProfile = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    scheduled_time: course.scheduled_time,
    live_class_url: course.live_class_url,
    teacher_id: course.teacher_id,
    teacher_name: teacherProfile?.full_name || "Unknown Teacher",
    totalAssignments,
    completedAssignments,
    progress,
  };
});

          setCourses(formattedCourses)
        }

        if (assignmentsData) {
          const formattedAssignments = assignmentsData.map((assignment) => {
  const course = Array.isArray(assignment.courses) ? assignment.courses[0] : assignment.courses;

  return {
    id: assignment.id,
    title: assignment.title,
    due_date: assignment.due_date,
    max_points: assignment.max_points,
    course_title: course?.title || "Unknown Course",
    submission: assignment.assignment_submissions?.find((sub) => sub.student_id === user.id) || undefined,
  };
});
          setAssignments(formattedAssignments)

          // Calculate grade statistics from real data
          const totalAssignments = formattedAssignments.length
          const completedAssignments = formattedAssignments.filter((a) => a.submission).length
          const gradedAssignments = formattedAssignments.filter(
            (a) => a.submission?.grade !== null && a.submission?.grade !== undefined,
          )

          let totalPoints = 0
          let earnedPoints = 0

          gradedAssignments.forEach((assignment) => {
            totalPoints += assignment.max_points
            earnedPoints += assignment.submission?.grade || 0
          })

          const averageGrade = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0

          setGradeStats({
            totalAssignments,
            completedAssignments,
            averageGrade,
            totalPoints,
            earnedPoints,
          })
        }

        // Fetch attendance records
        const { data: attendanceData } = await supabase
          .from("attendance")
          .select(`
            date,
            status,
            courses(title)
          `)
          .eq("student_id", user.id)
          .in("course_id", courseIds)
          .order("date", { ascending: false })
          .limit(10)

        if (attendanceData) {
          const formattedAttendance = attendanceData.map((record) => {
    const course = Array.isArray(record.courses) ? record.courses[0] : record.courses;

    return {
      date: record.date,
      status: record.status,
      course_title: course?.title || "Unknown Course",
    };
  });
          setAttendance(formattedAttendance)
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Wrap checkEnrollmentStatus with useCallback to fix the dependency issue
  const checkEnrollmentStatus = useCallback(async () => {
    if (!user) return

    try {
      // Check if student has any approved enrollments
      const { data: enrollments } = await supabase.from("enrollments").select("id").eq("student_id", user.id).limit(1)

      if (enrollments && enrollments.length > 0) {
        setEnrollmentStatus("enrolled")
        return
      }

      // Check if student has pending enrollment requests
      const { data: requests } = await supabase
        .from("enrollment_requests")
        .select("id")
        .eq("student_id", user.id)
        .eq("status", "pending")
        .limit(1)

      if (requests && requests.length > 0) {
        setEnrollmentStatus("pending")
      } else {
        setEnrollmentStatus("none")
      }
    } catch (error) {
      console.error("Error checking enrollment status:", error)
    }
  }, [user, supabase])

  // Fixed useEffect with proper dependencies
  useEffect(() => {
    if (user) {
      checkEnrollmentStatus()
      fetchStudentData()
    }
  }, [user, checkEnrollmentStatus, fetchStudentData])

  const getUpcomingClasses = () => {
    return courses
      .filter((course) => isFuture(new Date(course.scheduled_time)))
      .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
  }

  const getAttendancePercentage = () => {
    if (attendance.length === 0) return 0
    const presentCount = attendance.filter((record) => record.status === "present").length
    return Math.round((presentCount / attendance.length) * 100)
  }

  const upcomingClasses = getUpcomingClasses()
  const attendancePercentage = getAttendancePercentage()
  const completionRate = Math.round(gradeStats.averageGrade)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
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
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-green-800 dark:text-green-200">
            Great effort so far {profile?.full_name}&#33; Keep up the hard work, and with a bit more focus on your
            attendance, you&apos;re sure to reach your full potential&#33;
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>

      {/* Enrollment Status */}
      {enrollmentStatus === "none" && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <BookOpen className="h-5 w-5" />
              Get Started with Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 dark:text-blue-100">
                  You haven not enrolled in any courses yet. Browse our available courses and request enrollment to get
                  started!
                </p>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {enrollmentStatus === "pending" && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Clock className="h-5 w-5" />
              Enrollment Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-900 dark:text-yellow-100">
                  Your enrollment requests are being reviewed by the admin. You&apos;ll receive access to your dashboard
                  once approved.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/courses">View Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall performance</CardTitle>
            <p className="text-sm text-gray-500">Course completion rate</p>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <ProgressCircle value={completionRate} size={160} label="PRO LEARNER" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Total enrolled courses"
            value={courses.length}
            icon={BookOpen}
            iconClassName="bg-green-100 text-green-600"
          />
          <StatCard
            title="Live class attended"
            value={`${attendancePercentage}%`}
            icon={Video}
            iconClassName="bg-orange-100 text-orange-600"
            progress={attendancePercentage}
          />
          <StatCard
            title="Course completed"
            value={`${Math.round(completionRate)}%`}
            icon={CheckCircle}
            iconClassName="bg-blue-100 text-blue-600"
            progress={completionRate}
          />
          <StatCard
            title="Assignment done"
            value={`${Math.round((gradeStats.completedAssignments / Math.max(gradeStats.totalAssignments, 1)) * 100)}%`}
            icon={FileText}
            iconClassName="bg-purple-100 text-purple-600"
            progress={(gradeStats.completedAssignments / Math.max(gradeStats.totalAssignments, 1)) * 100}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {upcomingClasses.slice(0, 3).map((course) => (
                <UpcomingClassCard
                  key={course.id}
                  title={course.title}
                  subject={course.title.substring(0, 3).toUpperCase()}
                  teacher={course.teacher_name}
                  time={course.scheduled_time}
                  joinUrl={course.live_class_url}
                />
              ))}
              {upcomingClasses.length === 0 && <p className="text-center text-gray-500 py-4">No upcoming classes</p>}
            </div>
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assignment</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/student/assignments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{assignment.title}</h4>
                      <p className="text-xs text-gray-500">{assignment.course_title}</p>
                    </div>
                  </div>
                  <div>
                    {assignment.submission?.grade !== null && assignment.submission?.grade !== undefined ? (
                      <Badge className="bg-green-100 text-green-800">
                        {assignment.submission.grade}/{assignment.max_points}
                      </Badge>
                    ) : assignment.submission ? (
                      <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
                    ) : (
                      <Badge variant="outline">Due: {format(new Date(assignment.due_date), "MMM d")}</Badge>
                    )}
                  </div>
                </div>
              ))}
              {assignments.length === 0 && <p className="text-center text-gray-500 py-4">No assignments yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Total courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {courses.map((course) => (
              <CourseProgressRow
                key={course.id}
                id={course.id}
                title={course.title}
                code={course.title.substring(0, 3).toUpperCase()}
                progress={course.progress}
                totalAssignments={course.totalAssignments}
                completedAssignments={course.completedAssignments}
              />
            ))}
            {courses.length === 0 && <p className="text-center text-gray-500 py-4">No courses enrolled</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
