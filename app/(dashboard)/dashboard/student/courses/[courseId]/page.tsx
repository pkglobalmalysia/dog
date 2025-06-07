"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import {
  BookOpen,
  FileText,
  Video,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileAudio,
  FileVideo,
  Download,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

type Course = {
  id: string
  title: string
  description: string
  scheduled_time: string
  live_class_url: string
  teacher_id: string
  teacher_name: string
}

type Lecture = {
  id: string
  title: string
  description: string
  date: string
  course_id: string
}

type Assignment = {
  id: string
  title: string
  description: string
  due_date: string
  max_points: number
  course_id: string
  submission?: {
    id: string
    submitted_at: string
    grade?: number
    feedback?: string
    feedback_file_url?: string
    feedback_file_name?: string
    file_url?: string
    submission_text?: string
  }
}

type Message = {
  type: "success" | "error"
  text: string
}

export default function CourseDetailsPage() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [submissionText, setSubmissionText] = useState<{ [key: string]: string }>({})
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({})
  const [activeSubmission, setActiveSubmission] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const supabase = createClientComponentClient()

  const fetchCourseDetails = useCallback(async () => {
    if (!user || !courseId) return

    try {
      setLoading(true)

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
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
        .eq("id", courseId)
        .single()

      if (courseError) {
        console.error("Error fetching course:", courseError)
        return
      }

     if (courseData) {
  // profiles is an array, get first element safely
  const teacherProfile = Array.isArray(courseData.profiles) ? courseData.profiles[0] : undefined;

  setCourse({
    id: courseData.id,
    title: courseData.title,
    description: courseData.description,
    scheduled_time: courseData.scheduled_time,
    live_class_url: courseData.live_class_url,
    teacher_id: courseData.teacher_id,
    teacher_name: teacherProfile?.full_name || "Unknown Teacher",
  });
}


      // Fetch lectures
      const { data: lecturesData, error: lecturesError } = await supabase
        .from("lectures")
        .select(`
          id,
          title,
          description,
          date,
          course_id
        `)
        .eq("course_id", courseId)
        .order("date", { ascending: true })

      if (lecturesError) {
        console.error("Error fetching lectures:", lecturesError)
      } else if (lecturesData) {
        setLectures(lecturesData)
      }

      // Fetch assignments with submissions including feedback files
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          description,
          due_date,
          max_points,
          course_id,
          assignment_submissions!inner(
            id,
            submitted_at,
            grade,
            feedback,
            feedback_file_url,
            feedback_file_name,
            file_url,
            submission_text,
            student_id
          )
        `)
        .eq("course_id", courseId)
        .eq("assignment_submissions.student_id", user.id)
        .order("due_date", { ascending: true })

      // Also fetch assignments without submissions
      const { data: allAssignmentsData, error: allAssignmentsError } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          description,
          due_date,
          max_points,
          course_id
        `)
        .eq("course_id", courseId)
        .order("due_date", { ascending: true })

      if (allAssignmentsError) {
        console.error("Error fetching assignments:", allAssignmentsError)
      } else if (allAssignmentsData) {
        // Merge assignments with their submissions
        const formattedAssignments = allAssignmentsData.map((assignment) => {
          const submissionData = assignmentsData?.find((a) => a.id === assignment.id)
          return {
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            due_date: assignment.due_date,
            max_points: assignment.max_points,
            course_id: assignment.course_id,
            submission: submissionData?.assignment_submissions?.[0] || undefined,
          }
        })
        setAssignments(formattedAssignments)
      }
    } catch (error) {
      console.error("Error fetching course details:", error)
    } finally {
      setLoading(false)
    }
  }, [courseId, supabase, user])

  useEffect(() => {
    if (user && courseId) {
      fetchCourseDetails()
    }
  }, [user, courseId, fetchCourseDetails])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSubmission = async (assignmentId: string) => {
    if (!user || (!submissionText[assignmentId]?.trim() && !selectedFiles[assignmentId])) {
      setMessage({ type: "error", text: "Please provide either text or file submission" })
      return
    }

    setSubmitting(assignmentId)
    setUploadProgress(0)

    try {
      let fileUrl = null

      // Upload file if selected
      if (selectedFiles[assignmentId]) {
        try {
          const file = selectedFiles[assignmentId]!
          const fileExt = file.name.split(".").pop()
          const fileName = `${user.id}/${assignmentId}/${Date.now()}.${fileExt}`

          // For larger files like video/audio, we'll show progress
          const chunkSize = 1024 * 1024 // 1MB chunks
          if (file.size > chunkSize * 5) {
            // If file is larger than 5MB
            // Custom upload with progress tracking for large files
            const totalChunks = Math.ceil(file.size / chunkSize)
            let uploadedChunks = 0

            for (let start = 0; start < file.size; start += chunkSize) {
              const end = Math.min(start + chunkSize, file.size)
              const chunk = file.slice(start, end)

              const { error: chunkError } = await supabase.storage
                .from("assignments")
                .upload(`${fileName}_part_${uploadedChunks}`, chunk, {
                  cacheControl: "3600",
                  upsert: true,
                })

              if (chunkError) throw chunkError

              uploadedChunks++
              setUploadProgress(Math.round((uploadedChunks / totalChunks) * 100))
            }

            // Final file URL
            const {
              data: { publicUrl },
            } = supabase.storage.from("assignments").getPublicUrl(`${fileName}_part_0`)

            fileUrl = publicUrl
          } else {
            // Regular upload for smaller files
            const {  error: uploadError } = await supabase.storage
              .from("assignments")
              .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
              })

            if (uploadError) {
              console.error("Upload error:", uploadError)
              throw new Error(`File upload failed: ${uploadError.message}`)
            }

            const {
              data: { publicUrl },
            } = supabase.storage.from("assignments").getPublicUrl(fileName)

            fileUrl = publicUrl
          }

          setUploadProgress(100)
        } catch (fileError) {
          console.error("File upload error:", fileError)
          if (!submissionText[assignmentId]?.trim()) {
            throw new Error("File upload failed and no text submission provided")
          }
          setMessage({ type: "error", text: "File upload failed, but text submission will be saved" })
        }
      }

      // Submit assignment
      const { error } = await supabase.from("assignment_submissions").upsert({
        assignment_id: assignmentId,
        student_id: user.id,
        submission_text: submissionText[assignmentId]?.trim() || null,
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Database error:", error)
        throw new Error(`Submission failed: ${error.message}`)
      }

      setMessage({ type: "success", text: "Assignment submitted successfully!" })
      setSubmissionText((prev) => ({ ...prev, [assignmentId]: "" }))
      setSelectedFiles((prev) => ({ ...prev, [assignmentId]: null }))
      setActiveSubmission(null)
      fetchCourseDetails()
    } catch (error: any) {
      console.error("Error submitting assignment:", error)
      setMessage({ type: "error", text: error.message || "Failed to submit assignment" })
    } finally {
      setSubmitting(null)
      setUploadProgress(0)
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submission) {
      if (assignment.submission.grade !== null && assignment.submission.grade !== undefined) {
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
            Grade: {assignment.submission.grade}/{assignment.max_points}
          </span>
        )
      }
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">Submitted</span>
    }
    if (isOverdue(assignment.due_date)) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">Overdue</span>
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">Pending</span>
  }

  const getFileTypeIcon = (url: string) => {
    if (!url) return <FileText className="h-4 w-4" />

    const extension = url.split(".").pop()?.toLowerCase()

    if (["mp3", "wav", "ogg", "aac"].includes(extension || "")) {
      return <FileAudio className="h-4 w-4" />
    } else if (["mp4", "webm", "mov", "avi"].includes(extension || "")) {
      return <FileVideo className="h-4 w-4" />
    } else {
      return <FileText className="h-4 w-4" />
    }
  }

  const renderFilePreview = (url: string) => {
    if (!url) return null

    const extension = url.split(".").pop()?.toLowerCase()

    if (["mp3", "wav", "ogg", "aac"].includes(extension || "")) {
      return (
        <audio controls className="w-full mt-2">
          <source src={url} type={`audio/${extension}`} />
          Your browser does not support the audio element.
        </audio>
      )
    } else if (["mp4", "webm", "mov"].includes(extension || "")) {
      return (
        <video controls className="w-full mt-2 max-h-[200px]">
          <source src={url} type={`video/${extension}`} />
          Your browser does not support the video element.
        </video>
      )
    } else if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
      return (
        <Image
          src={url || "/placeholder.svg"}
          alt="Submission preview"
          className="mt-2 max-h-[200px] rounded"
          crossOrigin="anonymous"
        />
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/dashboard/student/my-courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <p className="text-gray-500 mb-4">
          The course you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button asChild>
          <Link href="/dashboard/student/my-courses">Go Back to My Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/student/my-courses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{course.title}</h1>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Instructor: {course.teacher_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{course.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-gray-500" />
              <span>Next class: {format(new Date(course.scheduled_time), "PPP p")}</span>
            </div>
            {course.live_class_url && (
              <Button asChild>
                <a href={course.live_class_url} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-4 w-4" />
                  Join Live Class
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="lectures">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lectures">
            <Video className="h-4 w-4 mr-2" />
            Lectures ({lectures.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <FileText className="h-4 w-4 mr-2" />
            Assignments ({assignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lectures" className="mt-6">
          {lectures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Video className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No lectures available</p>
                <p className="text-gray-500 text-center mt-1">There are no lectures scheduled for this course yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {lectures.map((lecture) => (
                <Card key={lecture.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{lecture.title}</CardTitle>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(lecture.date), "PPP p")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{lecture.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No assignments available</p>
                <p className="text-gray-500 text-center mt-1">There are no assignments for this course yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      {getStatusBadge(assignment)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{assignment.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {format(new Date(assignment.due_date), "PPP p")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Max Points: {assignment.max_points}</span>
                      </div>
                    </div>

                    {assignment.submission ? (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Your Submission</h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Submitted:</strong> {format(new Date(assignment.submission.submitted_at), "PPP p")}
                          </p>
                          {assignment.submission.submission_text && (
                            <p>
                              <strong>Text:</strong> {assignment.submission.submission_text}
                            </p>
                          )}
                          {assignment.submission.file_url && (
                            <div>
                              <p className="flex items-center">
                                <strong className="mr-2">File:</strong>
                                {getFileTypeIcon(assignment.submission.file_url)}
                                <a
                                  href={assignment.submission.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline ml-1"
                                >
                                  View Submission
                                </a>
                              </p>
                              {renderFilePreview(assignment.submission.file_url)}
                            </div>
                          )}
                          {assignment.submission.grade !== null && assignment.submission.grade !== undefined && (
                            <p>
                              <strong>Grade:</strong> {assignment.submission.grade}/{assignment.max_points}
                            </p>
                          )}
                          {assignment.submission.feedback && (
                            <p>
                              <strong>Feedback:</strong> {assignment.submission.feedback}
                            </p>
                          )}

                          {/* Teacher Feedback File Section */}
                          {assignment.submission.feedback_file_url && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                Teacher Feedback File
                              </h5>
                              <div className="flex items-center gap-2">
                                {getFileTypeIcon(assignment.submission.feedback_file_url)}
                                <a
                                  href={assignment.submission.feedback_file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline"
                                >
                                  <Download className="h-4 w-4" />
                                  {assignment.submission.feedback_file_name || "Download Feedback File"}
                                </a>
                              </div>
                              {renderFilePreview(assignment.submission.feedback_file_url)}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : !isOverdue(assignment.due_date) ? (
                      <div className="space-y-4">
                        {activeSubmission === assignment.id ? (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                            <h4 className="font-medium">Submit Assignment</h4>

                            <div className="space-y-2">
                              <Label htmlFor={`submissionText-${assignment.id}`}>Text Submission</Label>
                              <Textarea
                                id={`submissionText-${assignment.id}`}
                                placeholder="Enter your assignment text here..."
                                value={submissionText[assignment.id] || ""}
                                onChange={(e) =>
                                  setSubmissionText((prev) => ({ ...prev, [assignment.id]: e.target.value }))
                                }
                                rows={4}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`fileUpload-${assignment.id}`}>File Upload</Label>
                              <Input
                                id={`fileUpload-${assignment.id}`}
                                type="file"
                                onChange={(e) =>
                                  setSelectedFiles((prev) => ({
                                    ...prev,
                                    [assignment.id]: e.target.files?.[0] || null,
                                  }))
                                }
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav,.ogg,.mp4,.webm,.mov,.avi"
                              />
                              <p className="text-xs text-muted-foreground">
                                Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG, MP3, WAV, OGG, MP4, WEBM, MOV, AVI
                              </p>
                              {selectedFiles[assignment.id] && (
                                <div className="text-xs text-muted-foreground">
                                  Selected file: {selectedFiles[assignment.id]?.name ?? "No file selected"} (
                                  {selectedFiles[assignment.id] ? Math.round(selectedFiles[assignment.id]!.size / 1024) : 0} KB)
                                </div>
                              )}
                            </div>

                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                                <p className="text-xs text-center mt-1">Uploading: {uploadProgress}%</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSubmission(assignment.id)}
                                disabled={submitting === assignment.id}
                              >
                                {submitting === assignment.id ? "Submitting..." : "Submit Assignment"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setActiveSubmission(null)
                                  setSubmissionText((prev) => ({ ...prev, [assignment.id]: "" }))
                                  setSelectedFiles((prev) => ({ ...prev, [assignment.id]: null }))
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button onClick={() => setActiveSubmission(assignment.id)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Submit Assignment
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">
                        This assignment is overdue and can no longer be submitted.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
