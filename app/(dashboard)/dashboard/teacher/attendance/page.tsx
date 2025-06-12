"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, AlertCircle, Users } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCallback } from "react"
type Course = {
  id: string
  title: string
  student_count: number
}



type AttendanceRecord = {
  id?: string
  student_id: string
  student_name: string
  student_email: string
  status: "present" | "absent" | "late"
}

type Message = {
  type: "success" | "error"
  text: string
}

export default function TeacherAttendancePage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })


  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

const fetchCourses = useCallback(async () => {
  if (!user) return;

  try {
    setLoading(true);

    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id, 
        title,
        enrollments(count)
      `)
      .eq("teacher_id", user.id);

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      throw coursesError;
    }

    const coursesWithCounts =
      coursesData?.map((course) => ({
        id: course.id,
        title: course.title,
        student_count: course.enrollments?.[0]?.count || 0,
      })) || [];

    setCourses(coursesWithCounts);

    if (coursesWithCounts.length > 0) {
      setSelectedCourse(coursesWithCounts[0].id);
    }
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    setMessage({ type: "error", text: error.message || "Failed to load courses" });
  } finally {
    setLoading(false);
  }
}, [user, supabase]);

useEffect(() => {
  fetchCourses();
}, [user, fetchCourses]);

const fetchStudentsAndAttendance = useCallback(async () => {
  if (!selectedCourse || !selectedDate) return;

  try {
    setAttendanceLoading(true);

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("enrollments")
      .select(`
        student_id,
        profiles!inner(id, full_name, email)
      `)
      .eq("course_id", selectedCourse);

    if (enrollmentError) {
      console.error("Error fetching enrollments:", enrollmentError);
      throw enrollmentError;
    }

    const studentsData =
      enrollmentData?.map((enrollment) => ({
        id: enrollment.profiles?.[0]?.id,
        full_name: enrollment.profiles?.[0]?.full_name || "Unknown",
        email: enrollment.profiles?.[0]?.email || "No email",
      })) || [];


    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("course_id", selectedCourse)
      .eq("date", selectedDate);

    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
      throw attendanceError;
    }

    const allStudentAttendance: AttendanceRecord[] = studentsData.map((student) => {
      const existingRecord = attendanceData?.find((record) => record.student_id === student.id);
      return {
        id: existingRecord?.id,
        student_id: student.id,
        student_name: student.full_name,
        student_email: student.email,
        status: (existingRecord?.status as "present" | "absent" | "late") || "absent",
      };
    });

    setAttendance(allStudentAttendance);
  } catch (error: any) {
    console.error("Error fetching students and attendance:", error);
    setMessage({ type: "error", text: error.message || "Failed to load attendance data" });
  } finally {
    setAttendanceLoading(false);
  }
}, [selectedCourse, selectedDate, supabase]); 

   useEffect(() => {
    if (selectedCourse) {
      fetchStudentsAndAttendance()
    }
  }, [selectedCourse, selectedDate, fetchStudentsAndAttendance])

  const updateAttendance = async (studentId: string, status: "present" | "absent" | "late") => {
    if (!user || !selectedCourse) return

    try {
      // First check if attendance record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from("attendance")
        .select("id")
        .eq("course_id", selectedCourse)
        .eq("student_id", studentId)
        .eq("date", selectedDate)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing record:", checkError)
        throw checkError
      }

      let result
      if (existingRecord) {
        // Update existing record
        result = await supabase
          .from("attendance")
          .update({
            status,
            marked_at: new Date().toISOString(),
          })
          .eq("id", existingRecord.id)
      } else {
        // Insert new record
        result = await supabase.from("attendance").insert({
          course_id: selectedCourse,
          student_id: studentId,
          teacher_id: user.id,
          date: selectedDate,
          status,
          marked_at: new Date().toISOString(),
        })
      }

      if (result.error) {
        console.error("Error updating attendance:", result.error)
        throw result.error
      }

      // Update local state
      setAttendance((prev) => prev.map((record) => (record.student_id === studentId ? { ...record, status } : record)))

      setMessage({ type: "success", text: `Attendance marked as ${status}!` })
    } catch (error: any) {
      console.error("Error updating attendance:", error)
      setMessage({
        type: "error",
        text: error.message || `Failed to mark attendance as ${status}`,
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Late</Badge>
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      default:
        return <Badge variant="outline">Not Marked</Badge>
    }
  }

  const getAttendanceStats = () => {
    const present = attendance.filter((a) => a.status === "present").length
    const late = attendance.filter((a) => a.status === "late").length
    const absent = attendance.filter((a) => a.status === "absent").length
    const total = attendance.length

    return { present, late, absent, total }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading attendance system...</p>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold">Student Attendance</h1>
          <p className="text-muted-foreground mt-2">Mark and manage student attendance for your courses</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Courses Assigned</p>
            <p className="text-muted-foreground">You dont have any courses assigned to you yet.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getAttendanceStats()

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">Student Attendance</h1>
        <p className="text-muted-foreground mt-2">Mark and manage student attendance for your courses</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance Controls</CardTitle>
          <CardDescription>Select course and date to mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.student_count} students)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          {/* Attendance Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                  <div className="text-sm text-muted-foreground">Present</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                  <div className="text-sm text-muted-foreground">Late</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                  <div className="text-sm text-muted-foreground">Absent</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                {format(new Date(selectedDate), "PPPP")} - {courses.find((c) => c.id === selectedCourse)?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading attendance...</span>
                </div>
              ) : attendance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.student_id}>
                        <TableCell className="font-medium">{record.student_name}</TableCell>
                        <TableCell>{record.student_email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            {getStatusBadge(record.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={record.status === "present" ? "default" : "outline"}
                              onClick={() => updateAttendance(record.student_id, "present")}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === "late" ? "default" : "outline"}
                              onClick={() => updateAttendance(record.student_id, "late")}
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === "absent" ? "destructive" : "outline"}
                              onClick={() => updateAttendance(record.student_id, "absent")}
                            >
                              Absent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No Students Enrolled</p>
                  <p className="text-muted-foreground">This course does not have any enrolled students yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}