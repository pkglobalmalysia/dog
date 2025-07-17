"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, FileText, Video, Clock } from "lucide-react";
import { format, isFuture } from "date-fns";
import Link from "next/link";
import { useCallback } from "react";

type Course = {
  id: string;
  title: string;
  description: string;
  scheduled_time: string;
  live_class_url: string;
  teacher_id: string;
  teacher_name: string;
  totalAssignments: number;
  completedAssignments: number;
  progress: number;
  totalLectures: number;
  attendedLectures: number;
  nextLecture?: {
    date: string;
    title: string;
  };
};

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const supabase = createClientComponentClient();

  const fetchCourses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      if (enrollmentsError) {
        console.error("Error fetching enrollments:", enrollmentsError);
        return;
      }

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e) => e.course_id);

        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(
            `
          id,
          title,
          description,
          scheduled_time,
          live_class_url,
          teacher_id,
          profiles(full_name)
        `
          )
          .in("id", courseIds)
          .order("title", { ascending: true });

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          return;
        }

        // Get assignments for courses with proper submission tracking
        let assignmentsData: any[] = [];
        let submissionsData: any[] = [];
        
        try {
          console.log("📚 Fetching assignments for course IDs:", courseIds);
          const assignmentsResult = await supabase
            .from("assignments")
            .select("id, title, due_date, course_id, max_points")
            .in("course_id", courseIds);
            
          if (assignmentsResult.error) {
            console.warn("⚠️ Assignments query error:", assignmentsResult.error);
            assignmentsData = [];
          } else {
            assignmentsData = assignmentsResult.data || [];
            console.log("✅ Found", assignmentsData.length, "assignments");
          }

          // Get submission data for the student
          if (assignmentsData.length > 0) {
            const assignmentIds = assignmentsData.map(a => a.id);
            const submissionsResult = await supabase
              .from("assignments_submissions")
              .select("assignment_id, status, grade, submitted_at")
              .eq("student_id", user.id)
              .in("assignment_id", assignmentIds);
              
            if (submissionsResult.error) {
              console.warn("⚠️ Submissions query error:", submissionsResult.error);
              submissionsData = [];
            } else {
              submissionsData = submissionsResult.data || [];
              console.log("✅ Found", submissionsData.length, "submissions");
            }
          }
        } catch (queryError) {
          console.error("❌ Query failed:", queryError);
          assignmentsData = [];
          submissionsData = [];
        }

        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select(
            `
          id,
          date,
          status,
          course_id
        `
          )
          .eq("student_id", user.id)
          .in("course_id", courseIds);

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError);
        }

        const { data: lecturesData, error: lecturesError } = await supabase
          .from("lectures")
          .select(
            `
          id,
          title,
          date,
          course_id
        `
          )
          .in("course_id", courseIds)
          .order("date", { ascending: true });

        if (lecturesError) {
          console.error("Error fetching lectures:", lecturesError);
        }

        if (coursesData) {
          const formattedCourses = coursesData.map((course) => {
            // Get course assignments with proper null checks
            const courseAssignments = assignmentsData.filter((a: any) => a.course_id === course.id);
            
            // Calculate assignment completion based on submissions
            const courseSubmissions = submissionsData.filter((s: any) => {
              const assignment = assignmentsData.find(a => a.id === s.assignment_id);
              return assignment && assignment.course_id === course.id;
            });
            
            const completedAssignments = courseSubmissions.filter((s: any) => 
              s.status === 'submitted' || s.status === 'graded'
            ).length;
            
            const totalAssignments = courseAssignments.length;
            const assignmentProgress = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
            
            console.log(`📊 Course "${course.title}" Assignment Stats:`, {
              courseAssignments: courseAssignments.length,
              courseSubmissions: courseSubmissions.length,
              completedAssignments,
              totalAssignments,
              assignmentProgress: `${assignmentProgress.toFixed(1)}%`
            });

            const courseLectures = lecturesData?.filter((l) => l.course_id === course.id) || [];
            const courseAttendance = attendanceData?.filter((a) => a.course_id === course.id) || [];
            const attendedLectures = courseAttendance.filter((a) => a.status === "present").length;
            const totalLectures = courseLectures.length;
            const lectureProgress = totalLectures > 0 ? (attendedLectures / totalLectures) * 100 : 0;

            console.log(`📊 Course "${course.title}" Lecture Stats:`, {
              courseLectures: courseLectures.length,
              courseAttendance: courseAttendance.length,
              attendedLectures,
              totalLectures,
              lectureProgress: `${lectureProgress.toFixed(1)}%`
            });

            // Overall progress calculation (weighted average)
            const progress = Math.round((assignmentProgress * 0.6) + (lectureProgress * 0.4));

            const futureLectures = courseLectures.filter(
              (l) => l.date && isFuture(new Date(l.date))
            );
            const nextLecture = futureLectures.length > 0
              ? {
                  date: futureLectures[0].date,
                  title: futureLectures[0].title,
                }
              : undefined;

            const teacherProfile = Array.isArray(course.profiles)
              ? course.profiles[0]
              : course.profiles;

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

          setCourses(formattedCourses);
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]); 

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user, fetchCourses]);

  const filteredCourses = () => {
    switch (activeTab) {
      case "in-progress":
        return courses.filter(
          (course) => course.progress > 0 && course.progress < 100
        );
      case "completed":
        return courses.filter((course) => course.progress === 100);
      case "not-started":
        return courses.filter((course) => course.progress === 0);
      default:
        return courses;
    }
  };

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
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning progress and manage your enrolled courses
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse More Courses
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {courses.filter((c) => c.progress === 100).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {courses.filter((c) => c.progress > 0 && c.progress < 100).length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {courses.filter((c) => c.progress === 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Not Started</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm">
            In Progress ({courses.filter((c) => c.progress > 0 && c.progress < 100).length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Completed ({courses.filter((c) => c.progress === 100).length})
          </TabsTrigger>
          <TabsTrigger value="not-started" className="text-xs sm:text-sm">
            Not Started ({courses.filter((c) => c.progress === 0).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCourses().length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No courses found
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {activeTab === "all"
                    ? "You haven't enrolled in any courses yet. Start learning by browsing our available courses."
                    : `You don't have any ${activeTab.replace("-", " ")} courses at the moment.`}
                </p>
                {activeTab === "all" && (
                  <Button asChild className="mt-6">
                    <Link href="/courses">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Courses
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses().map((course) => (
                <Card key={course.id} className="group overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl min-w-0 w-full">
                  <CardHeader className="pb-6 px-6 pt-6">
                    <div className="space-y-4">
                      {/* Course Title */}
                      <div className="space-y-3">
                        <CardTitle className="text-xl font-bold leading-tight text-gray-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem] flex items-center">
                          {course.title}
                        </CardTitle>
                        
                        {/* Teacher Info */}
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md border-2 border-white">
                            <span className="text-sm font-bold text-white">
                              {course.teacher_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Instructor</p>
                            <p className="text-lg font-semibold text-gray-900 truncate">{course.teacher_name}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex justify-end">
                        <Badge
                          className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${
                            course.progress === 100
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : course.progress > 0
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {course.progress === 100
                            ? "✓ Completed"
                            : course.progress > 0
                            ? `${course.progress}% Complete`
                            : "Not Started"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-6 pb-6 space-y-6">
                    {/* Progress Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-900">Overall Progress</h4>
                        <span className="text-2xl font-bold text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all duration-700 rounded-full shadow-sm ${
                            course.progress === 100 
                              ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' 
                              : course.progress > 0
                              ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent rounded-full"></div>
                      </div>
                    </div>

                    {/* Stats Grid - Fixed overflow */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Assignments */}
                      <div className="bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-sm min-w-0">
                        <div className="text-center space-y-3">
                          <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <p className="text-xl font-bold text-gray-900 break-words leading-tight">
                              {course.completedAssignments}<span className="text-base font-normal text-gray-600">/{course.totalAssignments}</span>
                            </p>
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Assignments</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lectures */}
                      <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-sm min-w-0">
                        <div className="text-center space-y-3">
                          <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <p className="text-xl font-bold text-gray-900 break-words leading-tight">
                              {course.attendedLectures}<span className="text-base font-normal text-gray-600">/{course.totalLectures}</span>
                            </p>
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Lectures</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Next Lecture */}
                    {course.nextLecture && (
                      <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-start space-x-4">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-base text-blue-900 leading-tight mb-1">
                              Next Class: {course.nextLecture.title}
                            </p>
                            <p className="text-sm text-blue-700 font-medium">
                              {format(new Date(course.nextLecture.date), "EEEE, MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="px-6 pb-6">
                    <div className="w-full space-y-3">
                      <Button asChild className="w-full h-12 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold rounded-xl">
                        <Link href={`/dashboard/student/courses/${course.id}`} className="flex items-center justify-center gap-3">
                          <BookOpen className="h-5 w-5" />
                          <span>View Course Details</span>
                        </Link>
                      </Button>
                      {course.live_class_url && (
                        <Button asChild variant="outline" className="w-full h-12 border-2 border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 text-base font-semibold rounded-xl">
                          <a
                            href={course.live_class_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3"
                          >
                            <Video className="h-5 w-5" />
                            <span>Join Live Class</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
