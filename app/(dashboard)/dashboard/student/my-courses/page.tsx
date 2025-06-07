"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, FileText, Video, Clock } from "lucide-react"
import { format, isFuture } from "date-fns"
import Link from "next/link"

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
  totalLectures: number
  attendedLectures: number
  nextLecture?: {
    date: string
    title: string
  }
}

export default function MyCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id)

      if (enrollmentsError) {
        console.error("Error fetching enrollments:", enrollmentsError)
        return
      }

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e) => e.course_id)

        // Fetch courses with teacher info
        const { data: coursesData, error: coursesError } = await supabase
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
          .order("title", { ascending: true })

        if (coursesError) {
          console.error("Error fetching courses:", coursesError)
          return
        }

        // Fetch assignments for each course
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("assignments")
          .select(`
            id,
            title,
            due_date,
            course_id,
            assignment_submissions(
              id,
              student_id
            )
          `)
          .in("course_id", courseIds)

        if (assignmentsError) {
          console.error("Error fetching assignments:", assignmentsError)
        }

        // Fetch attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select(`
            id,
            date,
            status,
            course_id
          `)
          .eq("student_id", user.id)
          .in("course_id", courseIds)

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError)
        }

        // Fetch lectures from the newly created table
        const { data: lecturesData, error: lecturesError } = await supabase
          .from("lectures")
          .select(`
            id,
            title,
            date,
            course_id
          `)
          .in("course_id", courseIds)
          .order("date", { ascending: true })

        if (lecturesError) {
          console.error("Error fetching lectures:", lecturesError)
        }

        if (coursesData) {
         const formattedCourses = coursesData.map((course) => {
  // Calculate assignment progress
  const courseAssignments = assignmentsData?.filter((a) => a.course_id === course.id) || [];
  const completedAssignments = courseAssignments.filter((a) =>
    a.assignment_submissions?.some((sub) => sub.student_id === user.id),
  ).length;
  const totalAssignments = courseAssignments.length;
  const progress = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  // Calculate lecture attendance
  const courseLectures = lecturesData?.filter((l) => l.course_id === course.id) || [];
  const courseAttendance = attendanceData?.filter((a) => a.course_id === course.id) || [];
  const attendedLectures = courseAttendance.filter((a) => a.status === "present").length;
  const totalLectures = courseLectures.length;

  // Find next lecture
  const futureLectures = courseLectures.filter((l) => l.date && isFuture(new Date(l.date)));
  const nextLecture =
    futureLectures.length > 0
      ? {
          date: futureLectures[0].date,
          title: futureLectures[0].title,
        }
      : undefined;

  // Fix the profile access
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
    totalLectures,
    attendedLectures,
    nextLecture,
  };
});


          setCourses(formattedCourses)
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = () => {
    switch (activeTab) {
      case "in-progress":
        return courses.filter((course) => course.progress > 0 && course.progress < 100)
      case "completed":
        return courses.filter((course) => course.progress === 100)
      case "not-started":
        return courses.filter((course) => course.progress === 0)
      default:
        return courses
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Courses</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Button asChild>
          <Link href="/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse More Courses
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="all">All Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({courses.filter((c) => c.progress > 0 && c.progress < 100).length})
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({courses.filter((c) => c.progress === 100).length})</TabsTrigger>
          <TabsTrigger value="not-started">Not Started ({courses.filter((c) => c.progress === 0).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCourses().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-center">No courses found in this category</p>
                <p className="text-gray-500 text-center mt-1">
                  {activeTab === "all"
                    ? "You haven't enrolled in any courses yet."
                    : `You don't have any ${activeTab.replace("-", " ")} courses.`}
                </p>
                {activeTab === "all" && (
                  <Button asChild className="mt-4">
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses().map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription className="mt-1">Instructor: {course.teacher_name}</CardDescription>
                      </div>
                      <Badge
                        className={
                          course.progress === 100
                            ? "bg-green-100 text-green-800"
                            : course.progress > 0
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {course.progress === 100
                          ? "Completed"
                          : course.progress > 0
                            ? `${course.progress}% Complete`
                            : "Not Started"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${course.progress}%` }} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            {course.completedAssignments}/{course.totalAssignments} Assignments
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            {course.attendedLectures}/{course.totalLectures} Lectures
                          </span>
                        </div>
                      </div>

                      {course.nextLecture && (
                        <div className="flex items-center text-sm bg-blue-50 p-2 rounded-md">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <p className="font-medium">Next Lecture: {course.nextLecture.title}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(course.nextLecture.date), "PPP p")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/student/courses/${course.id}`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Course Details
                      </Link>
                    </Button>
                    {course.live_class_url && (
                      <Button asChild>
                        <a href={course.live_class_url} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-2 h-4 w-4" />
                          Join Class
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
