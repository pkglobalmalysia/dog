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
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Clock, Video } from "lucide-react";
import { format } from "date-fns";

type Profile = {
  full_name: string;
};

type Course = {
  id: string;
  title: string;
  teacher_id?: string;
  profiles?: Profile[] | Profile | null;
};

type Lecture = {
  id: string;
  course_id?: string;
  courses?: Course[] | Course | null;
};

type RecordedLecture = {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  duration_minutes?: number;
  recorded_date: string;
  lectures?: Lecture[] | Lecture | null;
};

interface FormattedLecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number; // make this required, not optional
  recorded_date: string;
  course_title: string;
  teacher_name: string;
}

const formatVideoUrl = (url: string) => {
  if (!url) return url;
  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export default function StudentLectures() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<FormattedLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  const fetchLectures = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);

      if (enrollmentError) {
        console.error("Error fetching enrollments:", enrollmentError);
        throw new Error("Failed to fetch enrolled courses");
      }

      if (!enrollments || enrollments.length === 0) {
        setLectures([]);
        return;
      }


      // Fetch recorded lectures from the new table
      const { data: recordedLecturesData } =
        (await supabase.from("recorded_lectures").select(`
    id,
    title,
    description,
    video_url,
    duration_minutes,
    recorded_date,
    lectures!inner (
      id,
      course_id,
      courses (
        id,
        title,
        teacher_id,
        profiles (
          full_name
        )
      )
    )
  `)) as { data: RecordedLecture[] | null; error: unknown };

      const formattedLectures: FormattedLecture[] =
        recordedLecturesData?.map((recordedLecture) => {
          const lecture = Array.isArray(recordedLecture.lectures)
            ? recordedLecture.lectures[0]
            : recordedLecture.lectures;

          const course = Array.isArray(lecture?.courses)
            ? lecture.courses[0]
            : lecture?.courses;

          const teacherName = Array.isArray(course?.profiles)
            ? course.profiles[0]?.full_name
            : course?.profiles?.full_name;

          return {
            id: recordedLecture.id,
            title: recordedLecture.title,
            description: recordedLecture.description || "",
            video_url: recordedLecture.video_url,
            duration_minutes: recordedLecture.duration_minutes ?? 0, // default to 0 to avoid undefined
            recorded_date: recordedLecture.recorded_date,
            course_title: course?.title || "Unknown Course",
            teacher_name: teacherName || "Unknown Teacher",
          };
        }) || [];

      setLectures(formattedLectures);
    } catch (error: unknown) {
      console.error("Error fetching lectures:", error);
      setError((error as Error).message || "Failed to load lectures");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchLectures();
    }
  }, [user, fetchLectures]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading recorded lectures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold">Recorded Lectures</h1>
          <p className="text-muted-foreground mt-2">
            Access all your course recordings
          </p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchLectures} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold">Recorded Lectures</h1>
        <p className="text-muted-foreground mt-2">
          Access all your course recordings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lectures.length > 0 ? (
          lectures.map((lecture) => (
            <Card key={lecture.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{lecture.title}</CardTitle>
                    <CardDescription>{lecture.course_title}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    <Video className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lecture.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lecture.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(lecture.recorded_date), "PPP")}
                    </span>
                  </div>
                  {lecture.duration_minutes > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(lecture.duration_minutes)}</span>
                    </div>
                  )}
                  <div className="text-xs">
                    <span>By {lecture.teacher_name}</span>
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <a
                    href={formatVideoUrl(lecture.video_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Lecture
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p>No recorded lectures available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your teachers haven&apos;t uploaded any lectures yet, or
                  you&apos;re not enrolled in any courses.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
