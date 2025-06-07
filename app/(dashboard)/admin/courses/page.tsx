"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Course = {
  id: string
  title: string
  description: string
  scheduled_time: string
  live_class_url: string
  teacher_id?: string
  teacher_name?: string
  enrollment_count: number
  max_students: number
  status: "active" | "inactive"
}

type Teacher = {
  id: string
  full_name: string
  email: string
}

type EnrollmentRequest = {
  id: string
  student_id: string
  student_name: string
  student_email: string
  course_id: string
  course_title: string
  requested_at: string
  status: "pending" | "approved" | "rejected"
}

type Message = {
  type: "success" | "error"
  text: string
}

export default function AdminCoursesPage() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [liveClassUrl, setLiveClassUrl] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [maxStudents, setMaxStudents] = useState(30)

  const supabase = createClientComponentClient()

const fetchData = useCallback(async () => {
  try {
    // Fetch courses with teacher info and enrollment count
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
      .order("created_at", { ascending: false });

    if (coursesError) throw coursesError;

    const formattedCourses =
      coursesData?.map((course) => {
        const teacherProfile = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles;
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          scheduled_time: course.scheduled_time,
          live_class_url: course.live_class_url,
          teacher_id: course.teacher_id,
          teacher_name: teacherProfile?.full_name || "No Teacher Assigned",
          enrollment_count: Array.isArray(course.enrollments) ? course.enrollments.length : 0,
          max_students: course.max_students || 30,
          status: course.status || "active",
        };
      }) || [];

    setCourses(formattedCourses);

    // Fetch approved teachers
    const { data: teachersData, error: teachersError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "teacher")
      .eq("approved", true);

    if (teachersError) throw teachersError;
    setTeachers(teachersData || []);

    // Fetch enrollment requests
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("enrollment_requests")
      .select(`
        id,
        student_id,
        course_id,
        status,
        requested_at,
        profiles!enrollment_requests_student_id_fkey(full_name, email),
        courses(title)
      `)
      .order("requested_at", { ascending: false });

    if (enrollmentError) throw enrollmentError;

    const formattedEnrollments =
      enrollmentData?.map((request) => {
        const studentProfile = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles;
        const courseInfo = Array.isArray(request.courses) ? request.courses[0] : request.courses;
        return {
          id: request.id,
          student_id: request.student_id,
          student_name: studentProfile?.full_name || "Unknown Student",
          student_email: studentProfile?.email || "",
          course_id: request.course_id,
          course_title: courseInfo?.title || "Unknown Course",
          requested_at: request.requested_at,
          status: request.status,
        };
      }) || [];

    setEnrollmentRequests(formattedEnrollments);
  } catch (error) {
    console.error("Error fetching data:", error);
    setMessage({ type: "error", text: "Failed to load data" });
  } finally {
    setLoading(false);
  }
}, [supabase]);


  useEffect(() => {
    if (profile?.role === "admin") {
      fetchData()
    }
  }, [profile, fetchData])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await supabase.from("courses").insert({
        title,
        description,
        scheduled_time: scheduledTime,
        live_class_url: liveClassUrl,
        teacher_id: teacherId || null,
        max_students: maxStudents,
        status: "active",
      })

      if (error) throw error

      setMessage({ type: "success", text: "Course created successfully!" })
      setIsCreating(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to create course" })
    }
  }

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingCourse) return

    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title,
          description,
          scheduled_time: scheduledTime,
          live_class_url: liveClassUrl,
          teacher_id: teacherId || null,
          max_students: maxStudents,
        })
        .eq("id", editingCourse.id)

      if (error) throw error

      setMessage({ type: "success", text: "Course updated successfully!" })
      setEditingCourse(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update course" })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return

    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId)

      if (error) throw error

      setMessage({ type: "success", text: "Course deleted successfully!" })
      fetchData()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to delete course" })
    }
  }

  const handleEnrollmentRequest = async (requestId: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        // Get the enrollment request details
        const request = enrollmentRequests.find((r) => r.id === requestId)
        if (!request) throw new Error("Request not found")

        // Create enrollment
        const { error: enrollError } = await supabase.from("enrollments").insert({
          student_id: request.student_id,
          course_id: request.course_id,
          enrolled_at: new Date().toISOString(),
        })

        if (enrollError) throw enrollError

        // Update request status
        const { error: updateError } = await supabase
          .from("enrollment_requests")
          .update({ status: "approved" })
          .eq("id", requestId)

        if (updateError) throw updateError

        setMessage({ type: "success", text: "Enrollment approved successfully!" })
      } else {
        // Reject enrollment
        const { error } = await supabase.from("enrollment_requests").update({ status: "rejected" }).eq("id", requestId)

        if (error) throw error

        setMessage({ type: "success", text: "Enrollment rejected." })
      }

      fetchData()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to process enrollment request" })
    }
  }

  const startEdit = (course: Course) => {
    setEditingCourse(course)
    setTitle(course.title)
    setDescription(course.description)
    setScheduledTime(course.scheduled_time)
    setLiveClassUrl(course.live_class_url)
    setTeacherId(course.teacher_id || "")
    setMaxStudents(course.max_students)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setScheduledTime("")
    setLiveClassUrl("")
    setTeacherId("")
    setMaxStudents(30)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading course management...</p>
      </div>
    )
  }

  if (profile?.role !== "admin") {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>You do not have permission to access this page</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Course Management</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage courses, assign teachers, and handle enrollments
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {(isCreating || editingCourse) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCourse ? "Edit Course" : "Create New Course"}</CardTitle>
            <CardDescription>
              {editingCourse ? "Update course information" : "Fill in the details for the new course"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher">Assign Teacher</Label>
                  <select
                    id="teacher"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">No Teacher Assigned</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="liveClassUrl">Live Class URL</Label>
                <Input
                  id="liveClassUrl"
                  type="url"
                  value={liveClassUrl}
                  onChange={(e) => setLiveClassUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingCourse ? "Update Course" : "Create Course"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingCourse(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollment Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>Manage all courses in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.teacher_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {course.enrollment_count}/{course.max_students}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(course.scheduled_time), "PPP p")}</TableCell>
                      <TableCell>
                        <Badge variant={course.status === "active" ? "default" : "secondary"}>{course.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(course)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Requests</CardTitle>
              <CardDescription>Review and approve student enrollment requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.student_name}</p>
                          <p className="text-sm text-muted-foreground">{request.student_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{request.course_title}</TableCell>
                      <TableCell>{format(new Date(request.requested_at), "PPP")}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEnrollmentRequest(request.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEnrollmentRequest(request.id, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}