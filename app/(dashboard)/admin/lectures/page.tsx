"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { Calendar, Clock, Edit, Plus, Search, Trash2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Lecture = {
  id: string
  title: string
  description: string
  date: string
  course_id: string
  course_title: string
  teacher_name: string
}

type Course = {
  id: string
  title: string
  teacher_id: string
  teacher_name: string
}

// Add this helper function after the type definitions
const formatDateForStorage = (localDateString: string) => {
  if (!localDateString) return ""
  // Create date from local datetime-local input and convert to ISO
  const localDate = new Date(localDateString)
  return localDate.toISOString()
}

export default function AdminLecturesPage() {
  const {  } = useAuth()
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    course_id: "",
  })

  const supabase = createClientComponentClient()

  const fetchLectures = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("lectures")
        .select(`
          id,
          title,
          description,
          date,
          course_id,
          courses (
            title,
            teacher_id,
            profiles (
              full_name
            )
          )
        `)
        .order("date", { ascending: true })

      if (error) {
        console.error("Error fetching lectures:", error)
        return
      }

      const formattedLectures = data.map((lecture) => {
  const course = Array.isArray(lecture.courses) ? lecture.courses[0] : lecture.courses;
  const profile = Array.isArray(course?.profiles) ? course.profiles[0] : course?.profiles;

  return {
    id: lecture.id,
    title: lecture.title,
    description: lecture.description,
    date: lecture.date,
    course_id: lecture.course_id,
    course_title: course?.title || "Unknown Course",
    teacher_name: profile?.full_name || "Unknown Teacher",
  };
});

console.log(formattedLectures, "Formatted Lectures Fetched");


      setLectures(formattedLectures)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

const fetchCourses = useCallback(async () => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        teacher_id,
        profiles:teacher_id (
          full_name
        )
      `)
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching courses:", error);
      return;
    }

    const formattedCourses = data.map((course) => {
      const profile = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles;

      return {
        id: course.id,
        title: course.title,
        teacher_id: course.teacher_id,
        teacher_name: profile?.full_name || "Unknown Teacher",
      };
    });

    setCourses(formattedCourses);
  } catch (error) {
    console.error("Error:", error);
  }
}, [supabase]);


  useEffect(() => {
    fetchLectures()
    fetchCourses()
  }, [fetchLectures, fetchCourses])

  const handleAddLecture = async () => {
    try {
      const {  error } = await supabase
        .from("lectures")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            date: formatDateForStorage(formData.date), // Use helper function
            course_id: formData.course_id,
          },
        ])
        .select()

      if (error) {
        console.error("Error adding lecture:", error)
        return
      }

      // Refresh lectures
      fetchLectures()
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleEditLecture = async () => {
    if (!currentLecture) return

    try {
      const { error } = await supabase
        .from("lectures")
        .update({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          course_id: formData.course_id,
        })
        .eq("id", currentLecture.id)

      if (error) {
        console.error("Error updating lecture:", error)
        return
      }

      // Refresh lectures
      fetchLectures()
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDeleteLecture = async () => {
    if (!currentLecture) return

    try {
      const { error } = await supabase.from("lectures").delete().eq("id", currentLecture.id)

      if (error) {
        console.error("Error deleting lecture:", error)
        return
      }

      // Refresh lectures
      fetchLectures()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const openEditDialog = (lecture: Lecture) => {
    setCurrentLecture(lecture)
    setFormData({
      title: lecture.title,
      description: lecture.description,
      date: lecture.date, // Keep as ISO string
      course_id: lecture.course_id,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (lecture: Lecture) => {
    setCurrentLecture(lecture)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      course_id: "",
    })
    setCurrentLecture(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle datetime-local inputs with proper timezone conversion
    if (name === "date" && value) {
      // Convert local datetime to ISO string for database storage
      const localDate = new Date(value)
      const isoString = localDate.toISOString()
      setFormData((prev) => ({ ...prev, [name]: isoString }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleCourseChange = (value: string) => {
    setFormData((prev) => ({ ...prev, course_id: value }))
  }

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch =
      lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCourse = selectedCourse && selectedCourse !== "all" ? lecture.course_id === selectedCourse : true

    return matchesSearch && matchesCourse
  })

  const upcomingLectures = filteredLectures.filter((lecture) => new Date(lecture.date) >= new Date())
  const pastLectures = filteredLectures.filter((lecture) => new Date(lecture.date) < new Date())

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lecture Management</h1>
          <p className="text-muted-foreground">Manage all lectures across courses</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lecture
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lectures..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedCourse || "all"}
          onValueChange={(value) => setSelectedCourse(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Lectures ({upcomingLectures.length})</TabsTrigger>
          <TabsTrigger value="past">Past Lectures ({pastLectures.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingLectures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Video className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">No upcoming lectures found</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lecture
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingLectures.map((lecture) => (
                <Card key={lecture.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{lecture.title}</CardTitle>
                        <CardDescription>{lecture.course_title}</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        Upcoming
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2 mb-4">{lecture.description}</p>
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(lecture.date), "PPP")}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {format(new Date(lecture.date), "p")}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Video className="mr-2 h-4 w-4" />
                        {lecture.teacher_name}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(lecture)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(lecture)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastLectures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Video className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">No past lectures found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastLectures.map((lecture) => (
                <Card key={lecture.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{lecture.title}</CardTitle>
                        <CardDescription>{lecture.course_title}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-gray-100">
                        Past
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2 mb-4">{lecture.description}</p>
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(lecture.date), "PPP")}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {format(new Date(lecture.date), "p")}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Video className="mr-2 h-4 w-4" />
                        {lecture.teacher_name}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(lecture)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(lecture)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Lecture Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Lecture</DialogTitle>
            <DialogDescription>Create a new lecture for a course. Fill in the details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Lecture Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter lecture title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter lecture description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Select value={formData.course_id} onValueChange={handleCourseChange}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Courses</SelectLabel>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - {course.teacher_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLecture}>Add Lecture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lecture Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Lecture</DialogTitle>
            <DialogDescription>Update the lecture details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Lecture Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter lecture title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter lecture description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Date & Time</Label>
              <Input
                id="edit-date"
                name="date"
                type="datetime-local"
                value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-course">Course</Label>
              <Select value={formData.course_id} onValueChange={handleCourseChange}>
                <SelectTrigger id="edit-course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Courses</SelectLabel>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - {course.teacher_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLecture}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Lecture Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Lecture</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lecture? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentLecture && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium">{currentLecture.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{currentLecture.course_title}</p>
                <p className="text-sm text-muted-foreground mt-1">{format(new Date(currentLecture.date), "PPP p")}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLecture}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
