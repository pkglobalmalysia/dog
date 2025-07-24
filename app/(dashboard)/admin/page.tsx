"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  Video,
  UserCheck,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

type DashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  approvedTeachers: number;
  pendingTeachers: number;
  totalCourses: number;
  totalLectures: number;
  totalAssignments: number;
  monthlyPayments: number;
};
interface Profile {
  full_name: string;
}
type Course = {
  id: string;
  title: string;
  description: string;
  scheduled_time: string;
  teacher_name: string;
  enrollment_count: number;
  profiles?: Profile[] | Profile | null;
};

type UpcomingLecture = {
  id: string;
  title: string;
  course_title: string;
  date: string;
  teacher_name: string;
};

type RecentAssignment = {
  id: string;
  title: string;
  course_title: string;
  due_date: string;
  teacher_name: string;
  submission_count: number;
};

type PendingApproval = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    approvedTeachers: 0,
    pendingTeachers: 0,
    totalCourses: 0,
    totalLectures: 0,
    totalAssignments: 0,
    monthlyPayments: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [upcomingLectures, setUpcomingLectures] = useState<UpcomingLecture[]>(
    []
  );
  const [recentAssignments, setRecentAssignments] = useState<
    RecentAssignment[]
  >([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Starting dashboard data fetch...");

      // Test authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error("No authenticated user found");
      }
      
      console.log("User authenticated:", user.email);

      // Run all static count queries in parallel
      const [
        studentsResult,
        allTeachersResult,
        approvedTeachersResult,
        pendingTeachersResult,
        coursesResult,
        lecturesResult,
        assignmentsResult,
        paymentsResult,
        approvedLecturesResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id").eq("role", "student"),
        supabase.from("profiles").select("id").eq("role", "teacher"),
        supabase
          .from("profiles")
          .select("id")
          .eq("role", "teacher")
          .eq("approved", true),
        supabase
          .from("profiles")
          .select("id")
          .eq("role", "teacher")
          .eq("approved", false),
        supabase.from("courses").select("id"),
        supabase.from("lectures").select("id"),
        supabase.from("assignments").select("id"),
        supabase.from("salary_payments_new").select("final_amount"),
        supabase
          .from("lecture_attendance")
          .select("total_amount")
          .eq("status", "approved"),
      ]);

      console.log("Basic queries completed, checking for errors...");

      // Check for errors in basic queries
      const basicErrors = [
        { name: "students", error: studentsResult.error },
        { name: "allTeachers", error: allTeachersResult.error },
        { name: "approvedTeachers", error: approvedTeachersResult.error },
        { name: "pendingTeachers", error: pendingTeachersResult.error },
        { name: "courses", error: coursesResult.error },
        { name: "lectures", error: lecturesResult.error },
        { name: "assignments", error: assignmentsResult.error },
        { name: "payments", error: paymentsResult.error },
        { name: "approvedLectures", error: approvedLecturesResult.error },
      ];

      const firstError = basicErrors.find(item => item.error);
      if (firstError) {
        console.error(`Error in ${firstError.name} query:`, firstError.error);
        throw new Error(`Failed to fetch ${firstError.name}: ${(firstError.error as any)?.message || JSON.stringify(firstError.error)}`);
      }

      // Aggregate payments
      const totalSalaryPayments =
        paymentsResult.data?.reduce(
          (sum, payment: any) => sum + (payment.final_amount || 0),
          0
        ) || 0;

      const totalLecturePayments =
        approvedLecturesResult.data?.reduce(
          (sum, lecture: any) => sum + (lecture.total_amount || 0),
          0
        ) || 0;

      const totalPayments = totalSalaryPayments + totalLecturePayments;

      // Set stats
      setStats({
        totalStudents: studentsResult.data?.length || 0,
        totalTeachers: allTeachersResult.data?.length || 0,
        approvedTeachers: approvedTeachersResult.data?.length || 0,
        pendingTeachers: pendingTeachersResult.data?.length || 0,
        totalCourses: coursesResult.data?.length || 0,
        totalLectures: lecturesResult.data?.length || 0,
        totalAssignments: assignmentsResult.data?.length || 0,
        monthlyPayments: totalPayments,
      });

      // Fetch & format recent courses
      console.log("Fetching recent courses...");
      const { data: coursesData, error: coursesError } = (await supabase
        .from("courses")
        .select(
          `
    id,
    title,
    description,
    scheduled_time,
    profiles!courses_teacher_id_fkey(full_name)
  `
        )
        .order("scheduled_time", { ascending: false })
        .limit(5)) as { data: Course[] | null; error: unknown };

      if (coursesError) {
        console.error("Courses query error:", coursesError);
        throw new Error(`Failed to fetch courses: ${(coursesError as any)?.message || JSON.stringify(coursesError)}`);
      }

      const formattedCourses = (coursesData || []).map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        scheduled_time: course.scheduled_time,
        teacher_name: Array.isArray(course.profiles)
          ? course.profiles[0]?.full_name ?? "Unknown Teacher"
          : course.profiles?.full_name ?? "Unknown Teacher",
        enrollment_count: 0,
      }));

      setCourses(formattedCourses);

      // Fetch & format upcoming lectures
      console.log("Fetching upcoming lectures...");
      const today = new Date();
      const { data: lecturesData, error: lecturesError } = await supabase
        .from("lectures")
        .select(
          `
        id,
        title,
        date,
        courses (
          title,
          profiles!courses_teacher_id_fkey (full_name)
        )
      `
        )
        .gte("date", today.toISOString())
        .order("date", { ascending: true })
        .limit(5);

      if (lecturesError) {
        console.error("Lectures query error:", lecturesError);
        throw new Error(`Failed to fetch lectures: ${(lecturesError as any)?.message || JSON.stringify(lecturesError)}`);
      }

      const formattedLectures = (lecturesData || []).map((lecture) => {
        const course = Array.isArray(lecture.courses)
          ? lecture.courses[0]
          : lecture.courses;
        const profile = Array.isArray(course?.profiles)
          ? course.profiles[0]
          : course?.profiles;

        return {
          id: lecture.id,
          title: lecture.title,
          date: lecture.date,
          course_title: course?.title || "Unknown Course",
          teacher_name: profile?.full_name || "Unknown Teacher",
        };
      });

      setUpcomingLectures(formattedLectures);

      // Fetch & format recent assignments
      console.log("Fetching recent assignments...");
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("assignments")
        .select(
          `
        id,
        title,
        due_date,
        courses (
          title,
          profiles!courses_teacher_id_fkey (full_name)
        )
      `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (assignmentsError) {
        console.error("Assignments query error:", assignmentsError);
        throw new Error(`Failed to fetch assignments: ${(assignmentsError as any)?.message || JSON.stringify(assignmentsError)}`);
      }

      const formattedAssignments = (assignmentsData || []).map((assignment) => {
        const course = Array.isArray(assignment.courses)
          ? assignment.courses[0]
          : assignment.courses;
        const profile = Array.isArray(course?.profiles)
          ? course.profiles[0]
          : course?.profiles;

        return {
          id: assignment.id,
          title: assignment.title,
          due_date: assignment.due_date,
          course_title: course?.title || "Unknown Course",
          teacher_name: profile?.full_name || "Unknown Teacher",
          submission_count: 0, // Default to 0 until we fix the relationship
        };
      });

      setRecentAssignments(formattedAssignments);

      // Fetch pending approvals
      console.log("Fetching pending approvals...");
      const { data: pendingData, error: pendingError } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .eq("role", "teacher")
        .eq("approved", false)
        .order("created_at", { ascending: false });

      if (pendingError) {
        console.error("Pending approvals query error:", pendingError);
        throw new Error(`Failed to fetch pending approvals: ${(pendingError as any)?.message || JSON.stringify(pendingError)}`);
      }

      setPendingApprovals(pendingData || []);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "Failed to load dashboard data";
      console.error("Error fetching dashboard data:", errorMessage);
      console.error("Full error details:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchDashboardData();
    }
  }, [profile, fetchDashboardData]);

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: true })
        .eq("id", teacherId);

      if (error) throw error;

      fetchDashboardData();
    } catch (err: any) {
      setError(err.message || "Failed to approve teacher");
    }
  };

  const handleRejectTeacher = async (teacherId: string) => {
    if (!confirm("Are you sure you want to reject this teacher application?"))
      return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", teacherId);

      if (error) throw error;

      fetchDashboardData();
    } catch (err: any) {
      setError(err.message || "Failed to reject teacher");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="glass-effect rounded-2xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || profile?.role !== "admin") {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "You do not have permission to access this page"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 border-0 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              Admin Dashboard <span className="text-gradient">🛡️</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Welcome back,{" "}
              <span className="font-semibold text-purple-600">
                {profile?.full_name}
              </span>
              . Here is what is happening in your LMS today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalStudents + stats.totalTeachers}
              </div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl card-hover glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalStudents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Active learners
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl card-hover glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved Teachers
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.approvedTeachers}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingTeachers} pending approval
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl card-hover glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalCourses}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalLectures} lectures scheduled
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl card-hover glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Payments
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  RM {stats.monthlyPayments.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalAssignments} assignments created
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Teacher Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="border-0 shadow-xl glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              Pending Teacher Approvals ({pendingApprovals.length})
            </CardTitle>
            <CardDescription>
              Review and approve teacher applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">
                      Applied Date
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((teacher) => (
                    <TableRow
                      key={teacher.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium">
                        {teacher.full_name}
                      </TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>
                        {format(new Date(teacher.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleApproveTeacher(teacher.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleRejectTeacher(teacher.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <TabsTrigger
            value="courses"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
          >
            Recent Courses
          </TabsTrigger>
          <TabsTrigger
            value="lectures"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
          >
            Upcoming Lectures
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
          >
            Recent Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card className="border-0 shadow-xl glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Recent Courses
              </CardTitle>
              <CardDescription>
                Latest courses created in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold">
                          Course Title
                        </TableHead>
                        <TableHead className="font-semibold">Teacher</TableHead>
                        <TableHead className="font-semibold">
                          Scheduled Date
                        </TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow
                          key={course.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="font-medium">
                            {course.title}
                          </TableCell>
                          <TableCell>{course.teacher_name}</TableCell>
                          <TableCell>
                            {format(
                              new Date(course.scheduled_time),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {course.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No courses found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Courses will appear here when created
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lectures">
          <Card className="border-0 shadow-xl glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Upcoming Lectures
              </CardTitle>
              <CardDescription>
                Scheduled lectures for the coming days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingLectures.length > 0 ? (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold">
                          Lecture Title
                        </TableHead>
                        <TableHead className="font-semibold">Course</TableHead>
                        <TableHead className="font-semibold">Teacher</TableHead>
                        <TableHead className="font-semibold">
                          Date & Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingLectures.map((lecture) => (
                        <TableRow
                          key={lecture.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="font-medium">
                            {lecture.title}
                          </TableCell>
                          <TableCell>{lecture.course_title}</TableCell>
                          <TableCell>{lecture.teacher_name}</TableCell>
                          <TableCell>
                            {format(
                              new Date(lecture.date),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No upcoming lectures
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Lectures will appear here when scheduled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card className="border-0 shadow-xl glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Recent Assignments
              </CardTitle>
              <CardDescription>
                Latest assignments created by teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAssignments.length > 0 ? (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableHead className="font-semibold">
                          Assignment Title
                        </TableHead>
                        <TableHead className="font-semibold">Course</TableHead>
                        <TableHead className="font-semibold">Teacher</TableHead>
                        <TableHead className="font-semibold">
                          Due Date
                        </TableHead>
                        <TableHead className="font-semibold">
                          Submissions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAssignments.map((assignment) => (
                        <TableRow
                          key={assignment.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="font-medium">
                            {assignment.title}
                          </TableCell>
                          <TableCell>{assignment.course_title}</TableCell>
                          <TableCell>{assignment.teacher_name}</TableCell>
                          <TableCell>
                            {format(
                              new Date(assignment.due_date),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {assignment.submission_count} submissions
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No assignments found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assignments will appear here when created
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
