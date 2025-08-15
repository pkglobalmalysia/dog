"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, BookOpen, Play, Calendar } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface ModernCourseCardProps {
  id: string
  title: string
  description: string
  teacher: string
  progress?: number
  totalStudents?: number
  nextClass?: string
  imageUrl?: string
  status?: "active" | "completed" | "upcoming"
  variant?: "student" | "teacher" | "admin"
}

export function ModernCourseCard({
  id,
  title,
  description,
  teacher,
  progress = 0,
  totalStudents = 0,
  nextClass,
  imageUrl,
  status = "active",
  variant = "student",
}: ModernCourseCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-orange-100 text-orange-800"
    }
  }

  const getGradient = () => {
    switch (variant) {
      case "teacher":
        return "from-blue-500 to-cyan-600"
      case "admin":
        return "from-purple-500 to-indigo-600"
      default:
        return "from-emerald-500 to-teal-600"
    }
  }

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      {/* Course Image/Header */}
      <div className={`relative h-48 bg-gradient-to-br ${getGradient()} p-6 flex flex-col justify-between`}>
        <div className="flex items-start justify-between">
          <Badge className={getStatusColor()}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
          <div className="flex items-center space-x-2 text-white/80">
            <Users className="h-4 w-4" />
            <span className="text-sm">{totalStudents}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{title}</h3>
          <div className="flex items-center text-white/90">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src="/placeholder.svg?height=24&width=24" />
              <AvatarFallback className="text-xs bg-white/20">{teacher.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{teacher}</span>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Progress (for students) */}
        {variant === "student" && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Course Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Next Class */}
        {nextClass && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Next: {format(new Date(nextClass), "MMM d, h:mm a")}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/${variant}/courses/${id}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>

          {nextClass && (
            <Button size="sm" className={`bg-gradient-to-r ${getGradient()}`}>
              <Play className="h-4 w-4 mr-2" />
              Join Class
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
