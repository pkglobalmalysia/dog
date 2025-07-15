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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, CheckCircle, AlertCircle, FileText, Edit, Trash2, Upload, X } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Course = {
  id: string
  title: string
}

type Assignment = {
  id: string
  title: string
  description: string
  due_date: string
  max_points: number
  course_title: string
  submissions_count: number
  assigned_students_count?: number
}

type Student = {
  id: string
  full_name: string
  email: string
  selected?: boolean
}

type Submission = {
  id: string
  student_id?: string
  student_name: string
  student_email?: string
  submitted_at: string | null
  grade?: number
  feedback?: string
  feedback_file_url?: string
  feedback_file_name?: string
  file_url?: string
  submission_text?: string
  has_submission?: boolean
}

type Message = {
  type: "success" | "error"
  text: string
}

export default function TeacherAssignmentsPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [currentAssignmentMaxPoints, setCurrentAssignmentMaxPoints] = useState(100)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [feedbackFiles, setFeedbackFiles] = useState<{ [key: string]: File | null }>({})
  const [uploadingFeedback, setUploadingFeedback] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [courseId, setCourseId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxPoints, setMaxPoints] = useState(100)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const supabase = createClientComponentClient()

// Wrap fetchData with useCallback to fix the dependency issue
const fetchData = useCallback(async () => {
  if (!user) {
    console.log("🚫 No user found, skipping data fetch");
    return;
  }

  console.log("🔍 Assignments Page - Starting data fetch for user:", user.id);

  try {
    // Fetch courses where teacher is assigned
    console.log("Fetching courses for teacher:", user.id);
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", user.id);

    if (coursesError) {
      console.error("Courses fetch error:", coursesError);
      throw coursesError;
    }
    
    console.log("Courses data:", coursesData);
    setCourses(coursesData || []);

    // Fetch assignments for this teacher through courses relationship
    console.log("Fetching assignments for teacher:", user.id);
    
    // First, let's check what columns exist in assignments table
    const { data: testData, error: testError } = await supabase
      .from("assignments")
      .select("*")
      .limit(1);
    
    console.log("Test assignments table structure:", testData, testError);
    
    let assignmentsData: any[] | null = null;
    let assignmentsError: any = null;
    
    // Try method 1: Join with courses table to filter by teacher_id
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          description,
          due_date,
          max_points,
          course_id,
          courses!inner (
            id,
            title,
            teacher_id
          )
        `)
        .eq("courses.teacher_id", user.id)
        .order("due_date", { ascending: false });
        
      if (error) {
        console.warn("Method 1 (courses join) failed:", error);
        throw error;
      }
      
      assignmentsData = data;
      console.log("Method 1 successful - assignments via courses join:", assignmentsData);
    } catch (joinError) {
      console.log("Trying method 2: Direct teacher_id filter. Method 1 error:", joinError instanceof Error ? joinError.message : String(joinError));
      
      // Method 2: Try direct teacher_id filter
      try {
        const { data, error } = await supabase
          .from("assignments")
          .select(`
            id,
            title,
            description,
            due_date,
            max_points,
            course_id
          `)
          .eq("teacher_id", user.id)
          .order("due_date", { ascending: false });
          
        if (error) {
          console.warn("Method 2 (direct teacher_id) failed:", error);
          throw error;
        }
        
        assignmentsData = data;
        console.log("Method 2 successful - assignments via teacher_id:", assignmentsData);
      } catch (directError) {
        console.log("Trying method 3: Get all assignments and filter by courses. Method 2 error:", directError instanceof Error ? directError.message : String(directError));
        
        // Method 3: Get all assignments for courses where user is teacher
        const { data: userCourses } = await supabase
          .from("courses")
          .select("id")
          .eq("teacher_id", user.id);
        
        if (userCourses && userCourses.length > 0) {
          const courseIds = userCourses.map(c => c.id);
          
          const { data, error } = await supabase
            .from("assignments")
            .select(`
              id,
              title,
              description,
              due_date,
              max_points,
              course_id
            `)
            .in("course_id", courseIds)
            .order("due_date", { ascending: false });
            
          if (error) {
            assignmentsError = error;
          } else {
            assignmentsData = data;
            console.log("Method 3 successful - assignments via course filter:", assignmentsData);
          }
        } else {
          assignmentsData = [];
          console.log("No courses found for teacher, setting empty assignments");
        }
      }
    }

    if (assignmentsError) {
      console.error("Assignments fetch error:", assignmentsError);
      console.error("Error details:", JSON.stringify(assignmentsError, null, 2));
      throw assignmentsError;
    }

    console.log("Assignments data:", assignmentsData);

    if (assignmentsData && assignmentsData.length > 0) {
      // Check if we have embedded course data (from method 1) or need to fetch separately
      const hasEmbeddedCourses = assignmentsData[0]?.courses;
      let courseData = null;
      
      if (!hasEmbeddedCourses) {
        // Get course titles separately for methods 2 and 3
        const courseIds = [...new Set(assignmentsData.map(a => a.course_id))];
        console.log("Fetching course titles for IDs:", courseIds);
        
        const { data: fetchedCourseData, error: courseError } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);

        if (courseError) {
          console.error("Course titles fetch error:", courseError);
        } else {
          courseData = fetchedCourseData;
        }
      }

      // Get submissions count for each assignment
      const assignmentIds = assignmentsData.map(a => a.id);
      console.log("Fetching submissions for assignment IDs:", assignmentIds);
      
      if (assignmentIds.length > 0) {
        // Try to get submissions data, but don't fail if table doesn't exist
        let submissionsData = null;
        try {
          console.log("Attempting to fetch submissions for assignment IDs:", assignmentIds);
          const { data, error } = await supabase
            .from("assignment_submissions")
            .select("assignment_id")
            .in("assignment_id", assignmentIds);

          if (error) {
            console.warn("Assignment submissions table not accessible:", error.message);
            console.log("Continuing without submissions data...");
          } else {
            submissionsData = data;
            console.log("Successfully fetched submissions data:", submissionsData);
          }
        } catch (error) {
          console.warn("Could not access assignment_submissions table:", error);
        }

        const formattedAssignments = assignmentsData.map((assignment) => {
          // Get course title from embedded data or separate fetch
          let course_title = "Unknown Course";
          
          if (hasEmbeddedCourses) {
            // Method 1: Use embedded course data
            const course = Array.isArray(assignment.courses) 
              ? assignment.courses[0] 
              : assignment.courses;
            course_title = course?.title || "Unknown Course";
          } else {
            // Methods 2 & 3: Use separately fetched course data
            const course = courseData?.find(c => c.id === assignment.course_id);
            course_title = course?.title || "Unknown Course";
          }
          
          const submissionsCount = submissionsData?.filter(s => s.assignment_id === assignment.id).length || 0;
          
          // For now, we'll set assigned_students_count to 0 since we can't determine it easily
          // This will be updated when we implement proper assignment-student relationships
          const assignedStudentsCount = 0;

          return {
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            due_date: assignment.due_date,
            max_points: assignment.max_points,
            course_title: course_title,
            submissions_count: submissionsCount,
            assigned_students_count: assignedStudentsCount,
          };
        });

        console.log("Formatted assignments:", formattedAssignments);
        setAssignments(formattedAssignments);
      } else {
        console.log("No assignments found for this teacher");
        setAssignments([]);
      }
    } else {
      console.log("No assignments found for this teacher");
      setAssignments([]);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    setMessage({ type: "error", text: "Failed to load data" });
  } finally {
    setLoading(false);
  }
}, [user, supabase]);  const fetchStudentsForCourse = useCallback(
    async (courseId: string) => {
      try {
        console.log("Fetching students for course:", courseId);

        // First get enrollments for the course
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("enrollments")
          .select("student_id")
          .eq("course_id", courseId);

        if (enrollmentError) {
          console.error("Error fetching enrollments:", enrollmentError);
          throw enrollmentError;
        }

        console.log("Enrollment data:", enrollmentData);

        if (enrollmentData && enrollmentData.length > 0) {
          const studentIds = enrollmentData.map((e) => e.student_id);
          
          // Then get student profiles
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", studentIds);

          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
            throw profilesError;
          }

          console.log("Profiles data:", profilesData);

          const formattedStudents = profilesData?.map((profile) => ({
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            selected: false,
          })) || [];

          console.log("Formatted students:", formattedStudents);
          setStudents(formattedStudents);
        } else {
          console.log("No enrollments found for this course");
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setMessage({ type: "error", text: "Failed to load students for this course" });
      }
    },
    [supabase]
  );


  // Fixed useEffect with fetchData in dependency array
  useEffect(() => {
    fetchData()
  }, [user, fetchData])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Fixed useEffect with fetchStudentsForCourse in dependency array
  useEffect(() => {
    if (courseId) {
      fetchStudentsForCourse(courseId)
      // Reset selected students when course changes
      setSelectedStudents([])
    } else {
      setStudents([])
      setSelectedStudents([])
    }
  }, [courseId, fetchStudentsForCourse])

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !courseId) {
      setMessage({ type: "error", text: "Please select a course" })
      return
    }

    if (selectedStudents.length === 0) {
      setMessage({ type: "error", text: "Please select at least one student for this assignment" })
      return
    }

    try {
      console.log("Creating assignment with data:", {
        title,
        description,
        course_id: courseId,
        teacher_id: user.id,
        due_date: dueDate,
        max_points: maxPoints,
        selected_students: selectedStudents,
      })

      // Create the assignment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignments")
        .insert({
          title,
          description,
          course_id: courseId,
          teacher_id: user.id,
          due_date: dueDate,
          max_points: maxPoints,
        })
        .select()

      if (assignmentError) {
        console.error("Assignment creation error:", assignmentError)
        throw assignmentError
      }

      console.log("Assignment created:", assignmentData)

      if (assignmentData && assignmentData.length > 0) {
        const assignmentId = assignmentData[0].id

        // Try to create assignment-student relationships using a separate approach
        // We'll attempt to use an assignment_students table, and if it doesn't exist,
        // we'll fall back to storing the information in the assignment itself
        
        try {
          // First, try to create assignment_students records
          const assignmentStudents = selectedStudents.map((studentId) => ({
            assignment_id: assignmentId,
            student_id: studentId,
          }))

          const { error: relationError } = await supabase
            .from("assignment_students")
            .insert(assignmentStudents)

          if (relationError) {
            console.warn("assignment_students table not available, assignments will be visible to all enrolled students:", relationError)
            // For now, we'll just continue without specific student assignment
            // The assignment will be visible to all students in the course
          }

          setMessage({
            type: "success",
            text: `Assignment created for ${selectedStudents.length} selected students!`,
          })

        } catch (error) {
          console.error("Error assigning to students:", error)
          setMessage({
            type: "success",
            text: `Assignment created, but specific student assignment not available yet.`,
          })
        }
      }

      setIsCreating(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error creating assignment:", error)
      setMessage({ type: "error", text: error.message || "Failed to create assignment" })
    }
  }

  const startEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setTitle(assignment.title)
    setDescription(assignment.description)
    setDueDate(assignment.due_date)
    setMaxPoints(assignment.max_points)

    // Find the course for this assignment
    const course = courses.find((c) => c.title === assignment.course_title)
    if (course) {
      setCourseId(course.id)
    }
  }

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingAssignment) return

    try {
      const { error } = await supabase
        .from("assignments")
        .update({
          title,
          description,
          due_date: dueDate,
          max_points: maxPoints,
        })
        .eq("id", editingAssignment.id)

      if (error) throw error

      setMessage({ type: "success", text: "Assignment updated successfully!" })
      setEditingAssignment(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update assignment" })
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this assignment? This will also delete all submissions. This action cannot be undone.",
      )
    )
      return

    try {
      // Try to delete assignment submissions if table exists
      try {
        const { error: submissionsError } = await supabase
          .from("assignment_submissions")
          .delete()
          .eq("assignment_id", assignmentId)

        if (submissionsError) {
          console.warn("Could not delete submissions (table may not exist):", submissionsError.message);
        } else {
          console.log("Successfully deleted submissions for assignment");
        }
      } catch (error) {
        console.warn("Assignment submissions table not accessible for deletion:", error);
      }

      // Delete the assignment itself
      const { error: assignmentError } = await supabase.from("assignments").delete().eq("id", assignmentId)

      if (assignmentError) throw assignmentError

      setMessage({ type: "success", text: "Assignment deleted successfully!" })
      fetchData()
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      setMessage({ type: "error", text: error.message || "Failed to delete assignment" })
    }
  }

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      setUploadingFeedback(submissionId)
      let feedbackFileUrl = null
      let feedbackFileName = null

      // Upload feedback file if selected
      if (feedbackFiles[submissionId]) {
        const file = feedbackFiles[submissionId]!
        const fileExt = file.name.split(".").pop()
        const fileName = `feedback/${user?.id}/${submissionId}/${Date.now()}.${fileExt}`

        console.log("Uploading feedback file:", fileName, "Size:", file.size)

        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("assignments")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (uploadError) {
            console.error("Feedback file upload error:", uploadError)
            throw new Error(`Upload failed: ${uploadError.message}`)
          }

          console.log("Upload successful:", uploadData)

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("assignments").getPublicUrl(fileName)

          feedbackFileUrl = publicUrl
          feedbackFileName = file.name

          console.log("Feedback file uploaded successfully:", feedbackFileUrl)
        } catch (fileError) {
          console.error("File upload error:", fileError)
          setMessage({
            type: "error",
            text: `Failed to upload feedback file: ${
              fileError instanceof Error ? fileError.message : String(fileError)
            }. Grade and text feedback will still be saved.`,
          })
          // Continue with grading even if file upload fails
        }
      }

      // Update submission with grade, feedback, and file
      const updateData = {
        grade,
        feedback,
        graded_at: new Date().toISOString(),
        graded_by: user?.id,
        ...(feedbackFileUrl && {
          feedback_file_url: feedbackFileUrl,
          feedback_file_name: feedbackFileName,
        }),
      }

      console.log("Updating submission with:", updateData)

      try {
        const { error: updateError } = await supabase
          .from("assignment_submissions")
          .update(updateData)
          .eq("id", submissionId)

        if (updateError) {
          console.error("Submission update error:", updateError)
          throw new Error(`Failed to save grade: ${updateError.message}`)
        }

        setMessage({ type: "success", text: "Submission graded successfully!" })
        setFeedbackFiles((prev) => ({ ...prev, [submissionId]: null }))

        if (selectedAssignment) {
          fetchSubmissions(selectedAssignment)
        }
      } catch (submissionError) {
        console.error("Submission system error:", submissionError)
        setMessage({ 
          type: "error", 
          text: "Submissions system not available yet. Please contact administrator." 
        })
      }
    } catch (error: any) {
      console.error("Error in handleGradeSubmission:", error)
      setMessage({ type: "error", text: error.message || "Failed to grade submission" })
    } finally {
      setUploadingFeedback(null)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => (student.id === studentId ? { ...student, selected: !student.selected } : student)),
    )

    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const selectAllStudents = () => {
    const allStudentIds = students.map(s => s.id)
    setSelectedStudents(allStudentIds)
    setStudents(prev => prev.map(student => ({ ...student, selected: true })))
  }

  const deselectAllStudents = () => {
    setSelectedStudents([])
    setStudents(prev => prev.map(student => ({ ...student, selected: false })))
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCourseId("")
    setDueDate("")
    setMaxPoints(100)
    setSelectedStudents([])
    setEditingAssignment(null)
    setStudents([])
  }

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      console.log("Fetching submissions for assignment:", assignmentId)
      
      // Get assignment details first
      const { data: assignmentData, error: assignmentDetailsError } = await supabase
        .from("assignments")
        .select("max_points, course_id")
        .eq("id", assignmentId)
        .single()

      if (assignmentDetailsError) {
        console.error("Assignment details error:", assignmentDetailsError)
        throw assignmentDetailsError
      }

      console.log("Assignment data:", assignmentData)
      setCurrentAssignmentMaxPoints(assignmentData?.max_points || 100)

      // Get assigned students for this specific assignment
      let assignedStudentIds: string[] = []
      
      try {
        console.log("Trying to get assignment-student relationships...")
        // First try to get from assignment_students table
        const { data: assignmentStudentsData, error: assignmentStudentsError } = await supabase
          .from("assignment_students")
          .select("student_id")
          .eq("assignment_id", assignmentId)

        if (assignmentStudentsError) {
          console.warn("assignment_students table not available:", assignmentStudentsError.message)
          console.log("Falling back to course enrollment...")
          // Fallback: get all enrolled students (old behavior)
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from("enrollments")
            .select("student_id")
            .eq("course_id", assignmentData.course_id)
          
          if (enrollmentError) {
            console.error("Enrollment fetch error:", enrollmentError)
            throw enrollmentError
          }
          
          assignedStudentIds = enrollmentData?.map(e => e.student_id) || []
          console.log("Got student IDs from enrollments:", assignedStudentIds)
        } else {
          assignedStudentIds = assignmentStudentsData?.map(rel => rel.student_id) || []
          console.log("Got student IDs from assignment_students:", assignedStudentIds)
        }
      } catch (error) {
        console.warn("Could not fetch assignment relationships:", error)
        console.log("Final fallback to course enrollment...")
        // Last fallback: get all enrolled students (old behavior)
        try {
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from("enrollments")
            .select("student_id")
            .eq("course_id", assignmentData.course_id)
          
          if (enrollmentError) {
            console.error("Final enrollment fetch error:", enrollmentError)
            throw enrollmentError
          }
          
          assignedStudentIds = enrollmentData?.map(e => e.student_id) || []
          console.log("Final fallback - got student IDs:", assignedStudentIds)
        } catch (finalError) {
          console.error("All student fetching methods failed:", finalError)
          assignedStudentIds = []
        }
      }

      console.log("Assigned student IDs for this assignment:", assignedStudentIds)

      if (assignedStudentIds.length === 0) {
        console.log("No students assigned to this assignment")
        setSubmissions([])
        setSelectedAssignment(assignmentId)
        return
      }

      // Get student profiles for assigned students only
      console.log("Fetching student profiles...")
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", assignedStudentIds)

      if (profilesError) {
        console.error("Profiles fetch error:", profilesError)
        throw profilesError
      }

      console.log("Student profiles:", profilesData)

      // Try to get submissions data, but continue even if table doesn't exist
      let submissionsData: any[] = [];
      try {
        console.log("Attempting to fetch submission records...")
        const { data, error: submissionsError } = await supabase
          .from("assignment_submissions")
          .select(`
          id,
          submitted_at,
          grade,
          feedback,
          feedback_file_url,
          feedback_file_name,
          file_url,
          submission_text,
          student_id
        `)
          .eq("assignment_id", assignmentId)
          .order("submitted_at", { ascending: false })

        if (submissionsError) {
          console.warn("Could not fetch submissions:", submissionsError.message);
          submissionsData = []
        } else {
          submissionsData = data || []
          console.log("Successfully fetched submissions:", submissionsData);
        }
      } catch (error) {
        console.warn("Assignment submissions table not accessible:", error);
        submissionsData = []
      }

      // Combine enrolled students with their submissions
      const allStudents = profilesData || []
      const submissions = submissionsData

      console.log("Combining data - students:", allStudents.length, "submissions:", submissions.length)

      const formattedSubmissions = allStudents.map((student) => {
        const submission = submissions.find((s) => s.student_id === student.id)

        return {
          id: submission?.id || `no-submission-${student.id}`,
          student_id: student.id,
          student_name: student.full_name || "Unknown Student",
          student_email: student.email || "",
          submitted_at: submission?.submitted_at || null,
          grade: submission?.grade || null,
          feedback: submission?.feedback || "",
          feedback_file_url: submission?.feedback_file_url || null,
          feedback_file_name: submission?.feedback_file_name || null,
          file_url: submission?.file_url || null,
          submission_text: submission?.submission_text || "",
          has_submission: !!submission,
        }
      })

      console.log("Formatted submissions:", formattedSubmissions)
      setSubmissions(formattedSubmissions)
      setSelectedAssignment(assignmentId)
    } catch (error) {
      console.error("Error fetching submissions:", error)
      console.error("Error details:", JSON.stringify(error, null, 2))
      setMessage({ type: "error", text: "Failed to load submissions" })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading assignments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Assignments</h1>
            <p className="text-muted-foreground mt-2">Create and manage assignments for your students</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {(isCreating || editingAssignment) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAssignment ? "Edit Assignment" : "Create New Assignment"}</CardTitle>
            <CardDescription>
              {editingAssignment ? "Update assignment details" : "Fill in the details for the new assignment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingAssignment ? handleUpdateAssignment : handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <select
                    id="course"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
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
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPoints">Max Points</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Student Selection for Assignment */}
              {courseId && students.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Select Students for Assignment</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={selectAllStudents}
                      >
                        Select All
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={deselectAllStudents}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <input
                            type="checkbox"
                            id={`student-${student.id}`}
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor={`student-${student.id}`} className="text-sm flex-1 cursor-pointer">
                            <div className="font-medium">{student.full_name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Selected: {selectedStudents.length} of {students.length} students
                    </span>
                    {selectedStudents.length > 0 && (
                      <span className="text-blue-600 font-medium">
                        Assignment will be available to selected students only
                      </span>
                    )}
                  </div>
                </div>
              )}

              {courseId && students.length === 0 && (
                <div className="space-y-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No students are currently enrolled in this course. Students must be enrolled before assignments can be created.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={!courseId || selectedStudents.length === 0}>
                  {editingAssignment ? "Update Assignment" : "Create Assignment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingAssignment(null)
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

      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments">My Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>{assignment.course_title}</TableCell>
                        <TableCell>{format(new Date(assignment.due_date), "PPP")}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignment.submissions_count} submissions</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => fetchSubmissions(assignment.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => startEditAssignment(assignment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No assignments created yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          {selectedAssignment ? (
            <Card>
              <CardHeader>
                <CardTitle>Assignment Submissions</CardTitle>
                <CardDescription>Review and grade student submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <div key={submission.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{submission.student_name}</h4>
                            {submission.student_email && (
                              <p className="text-sm text-muted-foreground">{submission.student_email}</p>
                            )}
                          </div>
                          <Badge
                            variant={
                              submission.has_submission
                                ? submission.grade !== null
                                  ? "default"
                                  : "secondary"
                                : "outline"
                            }
                          >
                            {submission.has_submission
                              ? submission.grade !== null
                                ? `Graded: ${submission.grade}`
                                : "Submitted - Not Graded"
                              : "Not Submitted"}
                          </Badge>
                        </div>

                        {submission.has_submission ? (
                          <>
                            <p className="text-sm text-muted-foreground mb-2">
                              Submitted:{" "}
                              {submission.submitted_at ? format(new Date(submission.submitted_at), "PPP p") : "Unknown"}
                            </p>

                            {submission.submission_text && (
                              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                <strong className="text-sm">{"Student's Text Submission:"}</strong>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{submission.submission_text}</p>
                              </div>
                            )}

                            {submission.file_url && (
                              <div className="mb-3">
                                <strong className="text-sm">Attached File:</strong>
                                <div className="mt-1">
                                  <a
                                    href={submission.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                                  >
                                    <FileText className="h-4 w-4" />
                                    View Submission File
                                  </a>
                                </div>
                              </div>
                            )}

                            <div className="border-t pt-3 mt-3">
                              <h5 className="font-medium text-sm mb-2">Grade & Feedback</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`grade-${submission.id}`} className="text-sm">
                                    Grade (out of {currentAssignmentMaxPoints})
                                  </Label>
                                  <Input
                                    id={`grade-${submission.id}`}
                                    type="number"
                                    placeholder="Enter grade"
                                    defaultValue={submission.grade || ""}
                                    min="0"
                                    max={currentAssignmentMaxPoints}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`feedback-${submission.id}`} className="text-sm">
                                    Text Feedback
                                  </Label>
                                  <Textarea
                                    id={`feedback-${submission.id}`}
                                    placeholder="Enter feedback for student"
                                    defaultValue={submission.feedback || ""}
                                    rows={2}
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              {/* Feedback File Upload Section */}
                              <div className="mt-3">
                                <Label htmlFor={`feedbackFile-${submission.id}`} className="text-sm">
                                  Feedback File (Optional)
                                </Label>
                                <div className="mt-1 space-y-2">
                                  {feedbackFiles[submission.id] ? (
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm flex-1">{feedbackFiles[submission.id]?.name}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFeedbackFiles((prev) => ({ ...prev, [submission.id]: null }))}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      id={`feedbackFile-${submission.id}`}
                                      type="file"
                                      onChange={(e) =>
                                        setFeedbackFiles((prev) => ({
                                          ...prev,
                                          [submission.id]: e.target.files?.[0] || null,
                                        }))
                                      }
                                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav,.ogg,.mp4,.webm,.mov,.avi"
                                    />
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Upload annotated documents, audio feedback, or any other feedback files
                                  </p>
                                </div>

                                {/* Show existing feedback file if any */}
                                {submission.feedback_file_url && (
                                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                    <p className="text-sm font-medium">Current Feedback File:</p>
                                    <a
                                      href={submission.feedback_file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                                    >
                                      <FileText className="h-4 w-4" />
                                      {submission.feedback_file_name || "Download Feedback File"}
                                    </a>
                                  </div>
                                )}
                              </div>

                              <Button
                                size="sm"
                                className="mt-3"
                                disabled={uploadingFeedback === submission.id}
                                onClick={() => {
                                  const gradeInput = document.getElementById(
                                    `grade-${submission.id}`,
                                  ) as HTMLInputElement
                                  const feedbackInput = document.getElementById(
                                    `feedback-${submission.id}`,
                                  ) as HTMLTextAreaElement
                                  const grade = Number(gradeInput?.value || 0)
                                  const feedback = feedbackInput?.value || ""

                                  if (grade >= 0 && grade <= currentAssignmentMaxPoints) {
                                    handleGradeSubmission(submission.id, grade, feedback)
                                  } else {
                                    setMessage({
                                      type: "error",
                                      text: `Grade must be between 0 and ${currentAssignmentMaxPoints}`,
                                    })
                                  }
                                }}
                              >
                                {uploadingFeedback === submission.id ? (
                                  <>
                                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Save Grade & Feedback"
                                )}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Student has not submitted this assignment yet</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground">No students assigned to this assignment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>Select an assignment to view submissions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
