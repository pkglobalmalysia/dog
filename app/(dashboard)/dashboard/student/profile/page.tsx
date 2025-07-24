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
  profile_picture_url: string | null
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

type PaymentRecord = {
  id: string
  amount: number
  receipt_url: string | null
  payment_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  admin_notes: string | null
  payment_method?: string
  course_title?: string
}

export default function StudentProfile() {
  const { user } = useAuth()
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    ic_number: ""
  })
  const [newPayment, setNewPayment] = useState({
    amount: "",
    course_id: "",
    receipt_file: null as File | null
  })

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
      .select("id, full_name, email, created_at, profile_picture_url")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setStudentProfile(profileData);
      setFullName(profileData.full_name);
    }

    // Fetch course enrollments - Using main enrollments table
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select(`
        course_id,
        enrolled_at,
        courses(
          title, 
          teacher_id,
          teacher:profiles!courses_teacher_id_fkey(full_name)
        )
      `)
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false });

    if (enrollmentData) {
      const formattedEnrollments = enrollmentData.map((enrollment) => {
        const course = Array.isArray(enrollment.courses) ? enrollment.courses[0] : enrollment.courses;
        const teacherProfile = Array.isArray(course?.teacher) ? course?.teacher[0] : course?.teacher;

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
      .from("assignments_submissions")
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

    // Fetch payment history using direct student_id reference (after schema fix)
    const { data: paymentData } = await supabase
      .from("student_payments")
      .select(`
        id,
        amount,
        receipt_url,
        payment_status,
        created_at,
        admin_notes,
        course_id,
        payment_method
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (paymentData) {
      const formattedPayments = paymentData.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        receipt_url: payment.receipt_url,
        payment_status: payment.payment_status as 'pending' | 'approved' | 'rejected',
        created_at: payment.created_at,
        admin_notes: payment.admin_notes,
        course_title: payment.course_id ? "Course Payment" : "General Payment"
      }));
      setPayments(formattedPayments);
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

  const handleRefreshProfile = async () => {
    setLoading(true)
    await fetchStudentProfile()
    setLoading(false)
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPayment.amount || !newPayment.receipt_file) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const formData = new FormData()
      formData.append('amount', newPayment.amount)
      formData.append('course_id', newPayment.course_id)
      formData.append('receipt_file', newPayment.receipt_file)

      const response = await fetch('/api/student/payments', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        alert('Payment submitted successfully! It will be reviewed by admin.')
        setNewPayment({ amount: '', course_id: '', receipt_file: null })
        // Reset file input
        const fileInput = document.getElementById('receipt_file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        // Refresh payments
        await fetchStudentProfile()
      } else {
        alert('Failed to submit payment: ' + result.error)
      }
    } catch (error) {
      console.error('Payment submission error:', error)
      alert('Failed to submit payment. Please try again.')
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
    <div className="space-y-6 mx-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Student Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and view your academic progress</p>
        </div>
        <Button 
          onClick={handleRefreshProfile} 
          variant="outline"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Profile"}
        </Button>
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
          {/* Profile Picture Display */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
              {studentProfile?.profile_picture_url ? (
                <img 
                  src={`${studentProfile.profile_picture_url}?t=${Date.now()}`} 
                  alt="Profile Picture" 
                  className="w-full h-full object-cover"
                  key={studentProfile.profile_picture_url}
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Contact admin to update your profile picture
            </p>
          </div>
          
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

      {/* Payment Submission */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Payment</CardTitle>
          <CardDescription>Submit your course payment with receipt for admin review</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (RM)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="200.00"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="course_id">Course (Optional)</Label>
                <select
                  id="course_id"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newPayment.course_id}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, course_id: e.target.value }))}
                >
                  <option value="">Select a course (optional)</option>
                  {enrollments.map((enrollment) => (
                    <option key={enrollment.course_id} value={enrollment.course_id}>
                      {enrollment.course_title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="receipt_file">Receipt Image</Label>
              <Input
                id="receipt_file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setNewPayment(prev => ({ ...prev, receipt_file: file }))
                }}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload a clear image of your payment receipt
              </p>
            </div>
            <Button type="submit" className="w-full">
              Submit Payment for Review
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your payment submissions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Admin Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">RM {payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.course_title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.payment_status === 'approved'
                            ? "default"
                            : payment.payment_status === 'rejected'
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {payment.payment_status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(payment.created_at), "PPP")}</TableCell>
                    <TableCell>
                      {payment.receipt_url && (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Receipt
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.admin_notes && (
                        <span className="text-sm text-muted-foreground">
                          {payment.admin_notes}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>No payment submissions yet.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
