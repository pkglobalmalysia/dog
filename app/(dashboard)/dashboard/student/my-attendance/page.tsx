"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BookOpen } from "lucide-react";

type AttendanceRecord = {
  id: string;
  date: string;
  status: "present" | "absent" | "late";
  course_title: string;
};

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  const fetchAttendance = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("attendance")
        .select(
          `
          id,
          date,
          status,
          course_id,
          courses ( title )
        `
        )
        .eq("student_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching attendance:", error);
        return;
      }
      const formatted: AttendanceRecord[] = data.map((entry) => {
        const course = Array.isArray(entry.courses)
          ? entry.courses[0]
          : entry.courses;

        return {
          id: entry.id,
          date: entry.date,
          status: entry.status,
          course_title: course?.title || "Unknown Course",
        };
      });

      setRecords(formatted);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2" />
          <p>Loading your attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground mt-2">
          View your attendance history for all enrolled courses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Fetched based on attendance marked by your teachers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Attendance Found</p>
              <p className="text-muted-foreground">
                Your attendance will appear here once your teacher marks it.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), "PP")}</TableCell>
                    <TableCell>{record.course_title}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getStatusBadge(record.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
