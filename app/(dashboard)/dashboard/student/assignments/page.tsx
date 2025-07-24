"use client";


import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  ImageIcon,
  Video,
  Music,
  File,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
    return <ImageIcon className="h-4 w-4" />;
  } else if (["mp4", "avi", "mov", "wmv"].includes(extension || "")) {
    return <Video className="h-4 w-4" />;
  } else if (["mp3", "wav", "ogg"].includes(extension || "")) {
    return <Music className="h-4 w-4" />;
  } else if (["pdf", "doc", "docx", "txt"].includes(extension || "")) {
    return <FileText className="h-4 w-4" />;
  } else {
    return <File className="h-4 w-4" />;
  }
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  course_title: string;
  submission?: {
    id: string;
    submitted_at: string;
    grade?: number;
    feedback?: string;
    feedback_file_url?: string;
    feedback_file_name?: string;
    file_url?: string;
    submission_text?: string;
  };
};

type Message = {
  type: "success" | "error";
  text: string;
};

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchAssignments = useCallback(async () => {
    if (!supabase) {
      console.error("❌ Supabase client not available");
      return;
    }
    if (!user) {
      console.error("❌ User not logged in");
      return;
    }

    console.log("🚀 Starting fetchAssignments for user:", user.id);
    setLoading(true);

    try {
      // First, verify user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("❌ Session error:", sessionError);
        throw new Error("Authentication session error");
      }
      if (!session) {
        console.error("❌ No active session found");
        throw new Error("No active session - please login again");
      }
      console.log("✅ Session verified for user:", session.user.id);
      
      // Get enrolled courses first
      console.log("🎓 Fetching enrollments for student:", user.id);
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      console.log("📚 Enrollments data:", enrollments);
      console.log("❌ Enrollments error:", enrollmentError);

      if (enrollmentError) {
        console.error("❌ Enrollment fetch error details:", {
          message: enrollmentError instanceof Error ? enrollmentError.message : String(enrollmentError),
          code: enrollmentError?.code,
          details: enrollmentError?.details,
          hint: enrollmentError?.hint,
          raw: enrollmentError
        });
        throw enrollmentError;
      }

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e) => e.course_id);

        // Get assignments for enrolled courses with fallback for missing assignments_submissions
        console.log("📚 Fetching assignments for courses:", courseIds);
        console.log("👤 Current user ID:", user.id);
        
        // First try the full query with assignments_submissions
        let assignmentsData = null;
        let error = null;
        
        try {
          const result = await supabase
            .from("assignments")
            .select(
              `
            id,
            title,
            description,
            due_date,
            max_points,
            course_id,
            courses:course_id!inner (
              title
            ),
            assignments_submissions!left (
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
          `
            )
            .in("course_id", courseIds)
            .order("due_date", { ascending: true });
            
          assignmentsData = result.data;
          error = result.error;
        } catch (queryError) {
          console.warn("Full query failed, trying fallback without submissions:", queryError);
          error = queryError;
        }
        
        // If the full query failed, try a simpler query without assignments_submissions
        if (error || !assignmentsData) {
          console.log("🔄 Falling back to basic assignment query without submissions");
          const fallbackResult = await supabase
            .from("assignments")
            .select(
              `
            id,
            title,
            description,
            due_date,
            max_points,
            course_id,
            courses:course_id!inner (
              title
            )
          `
            )
            .in("course_id", courseIds)
            .order("due_date", { ascending: true });
            
          assignmentsData = fallbackResult.data;
          error = fallbackResult.error;
          
          if (error) {
            console.error("❌ Even fallback query failed:", error);
            throw error;
          } else {
            console.log("✅ Fallback query succeeded");
          }
        }

        console.log("📋 Raw assignments data:", assignmentsData);

        if (error) throw error;

        const formattedAssignments =
          assignmentsData?.map((assignment: any) => {
            const course = Array.isArray(assignment.courses)
              ? assignment.courses[0]
              : assignment.courses;

            // Handle submissions - might be undefined if table doesn't exist
            let userSubmissions = [];
            if (assignment.assignments_submissions) {
              // Filter submissions to only include ones from current student
              userSubmissions = assignment.assignments_submissions?.filter(
                (sub: any) => sub.student_id === user.id
              ) || [];
            }

            console.log(`📝 Assignment "${assignment.title}" submissions for user:`, userSubmissions);

            return {
              id: assignment.id,
              title: assignment.title,
              description: assignment.description,
              due_date: assignment.due_date,
              max_points: assignment.max_points,
              course_title: course?.title || "Unknown Course",
              submission: userSubmissions[0] || undefined,
            };
          }) || [];
        setAssignments(formattedAssignments as Assignment[]);
      } else {
        console.log("📭 No enrollments found for student - setting empty assignments array");
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        raw: error
      });
      setMessage({ type: "error", text: "Failed to load assignments" });
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user, fetchAssignments]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmission = async (assignmentId: string) => {
    if (!user || (!submissionText.trim() && !selectedFile)) {
      setMessage({
        type: "error",
        text: "Please provide either text or file submission",
      });
      return;
    }

    setSubmitting(assignmentId);

    try {
      let fileUrl = null;

      // Upload file if selected
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split(".").pop();
          const fileName = `${
            user.id
          }/${assignmentId}/${Date.now()}.${fileExt}`;
          if (!supabase) return;

          const { error: uploadError } = await supabase.storage
            .from("assignments")
            .upload(fileName, selectedFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(`File upload failed: ${uploadError.message}`);
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("assignments").getPublicUrl(fileName);

          fileUrl = publicUrl;
        } catch (fileError) {
          console.error("File upload error:", fileError);
          if (!submissionText.trim()) {
            throw new Error(
              "File upload failed and no text submission provided"
            );
          }
          setMessage({
            type: "error",
            text: "File upload failed, but text submission will be saved",
          });
        }
      }
      if (!supabase) return;

      // Submit assignment with fallback handling
      let submissionResult;
      try {
        submissionResult = await supabase.from("assignments_submissions").upsert({
          assignment_id: assignmentId,
          student_id: user.id,
          submission_text: submissionText.trim() || null,
          file_url: fileUrl,
          submitted_at: new Date().toISOString(),
        });
      } catch (dbError: any) {
        console.error("Direct database submission failed:", dbError);
        
        // Try API fallback if direct database access fails
        if (dbError?.code === '42P01' || dbError?.message?.includes('does not exist')) {
          console.log("🔄 Trying API fallback for assignment submission...");
          try {
            const response = await fetch('/api/submit-assignment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                assignment_id: assignmentId,
                submission_text: submissionText.trim() || null,
                file_url: fileUrl,
              }),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.error || 'API submission failed');
            }
            
            setMessage({
              type: "success",
              text: result.message || "Assignment submitted successfully!",
            });
            setSubmissionText("");
            setSelectedFile(null);
            setActiveSubmission(null);
            fetchAssignments();
            return; // Exit early on success
            
          } catch (apiError: any) {
            console.error("API fallback also failed:", apiError);
            throw new Error(`Both direct and API submission failed: ${apiError.message}`);
          }
        } else {
          throw new Error(`Database operation failed: ${dbError?.message || 'Unknown error'}`);
        }
      }

      if (submissionResult?.error) {
        const error = submissionResult.error;
        console.error("Database submission error:", error);
        console.error("Submission error details:", {
          message: error instanceof Error ? error.message : String(error),
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          raw: error
        });
        
        // Try API fallback for database errors too
        if (error?.code === '42P01' || error?.message?.includes('does not exist') || 
            error?.code === '42501' || !error?.message) {
          console.log("🔄 Database error detected, trying API fallback...");
          try {
            // Get the current session for auth token
            const { data: { session } } = await supabase.auth.getSession();
            
            const response = await fetch('/api/submit-assignment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token || ''}`,
              },
              body: JSON.stringify({
                assignment_id: assignmentId,
                submission_text: submissionText.trim() || null,
                file_url: fileUrl,
              }),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.error || 'API submission failed');
            }
            
            setMessage({
              type: "success",
              text: result.message || "Assignment submitted successfully!",
            });
            setSubmissionText("");
            setSelectedFile(null);
            setActiveSubmission(null);
            fetchAssignments();
            return; // Exit early on success
            
          } catch (apiError: any) {
            console.error("API fallback failed:", apiError);
            // Fall through to original error handling
          }
        }
        
        // Provide more specific error messages based on error type
        if (error?.code === '42P01') {
          throw new Error('Assignment submissions table does not exist. Please contact administrator.');
        } else if (error?.code === '42501') {
          throw new Error('Permission denied. You may not have access to submit assignments.');
        } else if (error?.message?.includes('foreign key')) {
          throw new Error('Invalid assignment reference. Please refresh and try again.');
        } else {
          throw new Error(`Submission failed: ${error?.message || 'Unknown database error'}`);
        }
      }

      // If we reach here, the direct database submission was successful
      setMessage({
        type: "success",
        text: "Assignment submitted successfully!",
      });
      setSubmissionText("");
      setSelectedFile(null);
      setActiveSubmission(null);
      
      // Refresh assignments to show updated status
      await fetchAssignments();
    } catch (error: unknown) {
      console.error("Error submitting assignment:", error);
      setMessage({
        type: "error",
        text: (error as Error).message || "Failed to submit assignment",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const isOverdue = useCallback((dueDate: string) => {
    return new Date(dueDate) < new Date();
  }, []);

  const getStatusBadge = useCallback(
    (assignment: Assignment) => {
      if (assignment.submission) {
        if (assignment.submission.grade !== null) {
          return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
        }
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      }
      if (isOverdue(assignment.due_date)) {
        return <Badge variant="destructive">Overdue</Badge>;
      }
      return <Badge variant="outline">Pending</Badge>;
    },
    [isOverdue]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 mx-4 sm:mx-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          View and submit your course assignments
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:gap-6">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg">{assignment.title}</CardTitle>
                    <CardDescription className="text-sm">{assignment.course_title}</CardDescription>
                  </div>
                  <div className="self-start sm:self-auto">
                    {getStatusBadge(assignment)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{assignment.description}</p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>
                      Due: {format(new Date(assignment.due_date), "PPP p")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Max Points: {assignment.max_points}</span>
                  </div>
                </div>

                {assignment.submission ? (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg space-y-4">
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Your Submission</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Submitted:</strong>{" "}
                        {format(
                          new Date(assignment.submission.submitted_at),
                          "PPP p"
                        )}
                      </p>
                      {assignment.submission.submission_text && (
                        <p>
                          <strong>Text:</strong>{" "}
                          {assignment.submission.submission_text}
                        </p>
                      )}
                      {assignment.submission.file_url && (
                        <p>
                          <strong>File:</strong>{" "}
                          <a
                            href={assignment.submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Submission
                          </a>
                        </p>
                      )}
                      {assignment.submission.grade !== null && (
                        <p>
                          <strong>Grade:</strong> {assignment.submission.grade}/
                          {assignment.max_points}
                        </p>
                      )}
                    </div>

                    {/* Teacher Feedback Section */}
                    {(assignment.submission.feedback ||
                      assignment.submission.feedback_file_url) && (
                      <div className="border-t pt-4 mt-4">
                        <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Teacher Feedback
                        </h5>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-3">
                          {assignment.submission.feedback && (
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Comments:
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {assignment.submission.feedback}
                              </p>
                            </div>
                          )}

                          {assignment.submission.feedback_file_url &&
                            assignment.submission.feedback_file_name && (
                              <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                                  Feedback File:
                                </p>
                                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                                  {getFileIcon(
                                    assignment.submission.feedback_file_name
                                  )}
                                  <span className="text-sm flex-1 truncate">
                                    {assignment.submission.feedback_file_name}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                    className="h-8 px-3"
                                  >
                                    <a
                                      href={
                                        assignment.submission.feedback_file_url
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={
                                        assignment.submission.feedback_file_name
                                      }
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : !isOverdue(assignment.due_date) ? (
                  <div className="space-y-4">
                    {activeSubmission === assignment.id ? (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium">Submit Assignment</h4>

                        <div className="space-y-2">
                          <Label htmlFor="submissionText">
                            Text Submission
                          </Label>
                          <Textarea
                            id="submissionText"
                            placeholder="Enter your assignment text here..."
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fileUpload">File Upload</Label>
                          <Input
                            id="fileUpload"
                            type="file"
                            onChange={(e) =>
                              setSelectedFile(e.target.files?.[0] || null)
                            }
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          />
                          <p className="text-xs text-muted-foreground">
                            Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSubmission(assignment.id)}
                            disabled={submitting === assignment.id}
                          >
                            {submitting === assignment.id
                              ? "Submitting..."
                              : "Submit Assignment"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setActiveSubmission(null);
                              setSubmissionText("");
                              setSelectedFile(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setActiveSubmission(assignment.id)}
                      >
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
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>No assignments available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
