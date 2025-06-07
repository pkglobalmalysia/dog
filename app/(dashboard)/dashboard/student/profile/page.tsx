"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Mail, Calendar, BookOpen, Award, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

type StudentProfile = {
  id: string
  full_name: string
  email: string
  created_at: string
}

type CourseEnrollment = {
  course_id: string
  course_title: string
  teacher_name: string
  enrolled_at: string
}

type GradeRecord = {
  assignment_title: string
  course_title: string
  grade: number
  max_points: number
  submitted_at: string
}

export default function StudentProfile() {
  const { user } = useAuth()
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState("")

  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })

  // Wrap fetchStudentProfile with useCallback to fix the dependency issue
 const fetchStudentProfile = useCallback(async () => {
  if (!user) return;

  try {
    // Fetch student profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setStudentProfile(profileData);
      setFullName(profileData.full_name);
    }

    // Fetch course enrollments
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select(`
        course_id,
        enrolled_at,
        courses(title, profiles(full_name))
      `)
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false });

    if (enrollmentData) {
      const formattedEnrollments = enrollmentData.map((enrollment) => {
        const course = Array.isArray(enrollment.courses) ? enrollment.courses[0] : enrollment.courses;
        const teacherProfile = Array.isArray(course?.profiles) ? course?.profiles[0] : course?.profiles;

        return {
          course_id: enrollment.course_id,
          course_title: course?.title || "Unknown Course",
          teacher_name: teacherProfile?.full_name || "Unknown Teacher",
          enrolled_at: enrollment.enrolled_at,
        };
      });
      setEnrollments(formattedEnrollments);
    }

    // Fetch grade records
    const { data: gradeData } = await supabase
      .from("assignment_submissions")
      .select(`
        grade,
        submitted_at,
        assignments(title, max_points, courses(title))
      `)
      .eq("student_id", user.id)
      .not("grade", "is", null)
      .order("submitted_at", { ascending: false });

    if (gradeData) {
      const formattedGrades = gradeData.map((submission) => {
        const assignment = Array.isArray(submission.assignments) ? submission.assignments[0] : submission.assignments;
        const course = Array.isArray(assignment?.courses) ? assignment.courses[0] : assignment.courses;

        return {
          assignment_title: assignment?.title || "Unknown Assignment",
          course_title: course?.title || "Unknown Course",
          grade: submission.grade || 0,
          max_points: assignment?.max_points || 0,
          submitted_at: submission.submitted_at,
        };
      });
      setGrades(formattedGrades);
    }
  } catch (error) {
    console.error("Error fetching student profile:", error);
  } finally {
    setLoading(false);
  }
}, [user, supabase]);


  // Fixed useEffect with fetchStudentProfile in dependency array
  useEffect(() => {
    if (user) {
      fetchStudentProfile()
    }
  }, [user, fetchStudentProfile])

  const handleUpdateProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id)

      if (error) throw error

      setStudentProfile((prev) => (prev ? { ...prev, full_name: fullName } : null))
      setEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const calculateOverallGrade = () => {
    if (grades.length === 0) return 0
    const totalPoints = grades.reduce((sum, grade) => sum + grade.max_points, 0)
    const earnedPoints = grades.reduce((sum, grade) => sum + grade.grade, 0)
    return totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your profile and view your academic progress</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              {editing ? (
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              ) : (
                <p className="text-lg font-medium">{studentProfile?.full_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p>{studentProfile?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{studentProfile?.created_at ? format(new Date(studentProfile.created_at), "PPP") : "Unknown"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Badge variant="outline">Student</Badge>
            </div>
          </div>
          <div className="mt-4">
            {editing ? (
              <div className="flex gap-2">
                <Button onClick={handleUpdateProfile}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded Assignments</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateOverallGrade().toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Course Enrollments</CardTitle>
          <CardDescription>Courses you are currently enrolled in</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.course_id}>
                    <TableCell className="font-medium">{enrollment.course_title}</TableCell>
                    <TableCell>{enrollment.teacher_name}</TableCell>
                    <TableCell>{format(new Date(enrollment.enrolled_at), "PPP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>You are not enrolled in any courses yet.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Grade History */}
      <Card>
        <CardHeader>
          <CardTitle>Grade History</CardTitle>
          <CardDescription>Your recent assignment grades</CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{grade.assignment_title}</TableCell>
                    <TableCell>{grade.course_title}</TableCell>
                    <TableCell>
                      {grade.grade}/{grade.max_points}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (grade.grade / grade.max_points) * 100 >= 90
                            ? "default"
                            : (grade.grade / grade.max_points) * 100 >= 70
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {((grade.grade / grade.max_points) * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(grade.submitted_at), "PPP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>No graded assignments yet.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
