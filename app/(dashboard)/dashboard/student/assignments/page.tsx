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
    if (!supabase) return;
    if (!user) return;

    try {
      // Get enrolled courses first
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      if (enrollmentError) throw enrollmentError;

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e) => e.course_id);

        // Get assignments for enrolled courses with optimized query
        const { data: assignmentsData, error } = await supabase
          .from("assignments")
          .select(
            `
          id,
          title,
          description,
          due_date,
          max_points,
          courses:course_id!inner (
            title
          ),
          assignment_submissions!left (
            id,
            submitted_at,
            grade,
            feedback,
            feedback_file_url,
            feedback_file_name,
            file_url,
            submission_text
          )
        `
          )
          .in("course_id", courseIds)
          .eq("assignment_submissions.student_id", user.id)
          .order("due_date", { ascending: true });

        if (error) throw error;

        const formattedAssignments =
          assignmentsData?.map((assignment) => {
            const course = Array.isArray(assignment.courses)
              ? assignment.courses[0]
              : assignment.courses;

            return {
              id: assignment.id,
              title: assignment.title,
              description: assignment.description,
              due_date: assignment.due_date,
              max_points: assignment.max_points,
              course_title: course?.title || "Unknown Course",
              submission: assignment.assignment_submissions?.[0] || undefined,
            };
          }) || [];
        setAssignments(formattedAssignments as Assignment[]);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
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

      // Submit assignment
      const { error } = await supabase.from("assignment_submissions").upsert({
        assignment_id: assignmentId,
        student_id: user.id,
        submission_text: submissionText.trim() || null,
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Submission failed: ${error.message}`);
      }

      setMessage({
        type: "success",
        text: "Assignment submitted successfully!",
      });
      setSubmissionText("");
      setSelectedFile(null);
      setActiveSubmission(null);
      fetchAssignments();
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
    <div className="space-y-6 mx-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground mt-2">
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

      <div className="grid gap-6">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{assignment.title}</CardTitle>
                    <CardDescription>{assignment.course_title}</CardDescription>
                  </div>
                  {getStatusBadge(assignment)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{assignment.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due: {format(new Date(assignment.due_date), "PPP p")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Max Points: {assignment.max_points}</span>
                  </div>
                </div>

                {assignment.submission ? (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                    <h4 className="font-medium mb-2">Your Submission</h4>
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
