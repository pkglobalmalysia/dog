"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, BookOpen, Play, Calendar, Clock, Star, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PremiumCourseCardProps {
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
  rating?: number
  duration?: string
}

export function PremiumCourseCard({
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
  rating = 4.8,
  duration = "12 weeks",
}: PremiumCourseCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
          gradient: "from-emerald-500 to-teal-600",
        }
      case "upcoming":
        return {
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          gradient: "from-blue-500 to-cyan-600",
        }
      default:
        return {
          badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
          gradient: "from-orange-500 to-amber-600",
        }
    }
  }

  const getVariantGradient = () => {
    switch (variant) {
      case "teacher":
        return "from-blue-500 via-cyan-500 to-teal-600"
      case "admin":
        return "from-purple-500 via-violet-500 to-indigo-600"
      default:
        return "from-emerald-500 via-green-500 to-teal-600"
    }
  }

  const statusConfig = getStatusConfig()
  const variantGradient = getVariantGradient()

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Course Header */}
      <div
        className={`relative h-56 bg-gradient-to-br ${variantGradient} p-8 flex flex-col justify-between overflow-hidden`}
      >
        {/* Floating Elements */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

        <div className="relative flex items-start justify-between">
          <Badge className={cn("backdrop-blur-sm border border-white/30", statusConfig.badge)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <div className="flex items-center space-x-4 text-white/90">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{totalStudents}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current text-yellow-300" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight">{title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white/90">
              <Avatar className="h-8 w-8 mr-3 border-2 border-white/30">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="text-xs bg-white/20 text-white font-semibold">
                  {teacher.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium">{teacher}</span>
                <div className="flex items-center space-x-2 text-xs text-white/70">
                  <Clock className="h-3 w-3" />
                  <span>{duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="relative p-8">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">{description}</p>

        {/* Progress (for students) */}
        {variant === "student" && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Course Progress</span>
              <span className="font-bold text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Next Class */}
        {nextClass && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
            <Calendar className="h-5 w-5 mr-3 text-blue-500" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Next Class:</span>
              <span className="ml-2">{format(new Date(nextClass), "MMM d, h:mm a")}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between space-x-4">
          <Button variant="outline" size="lg" asChild className="flex-1 rounded-2xl border-2 hover:border-gray-300">
            <Link href={`/dashboard/${variant}/courses/${id}`}>
              <BookOpen className="h-5 w-5 mr-2" />
              View Details
            </Link>
          </Button>

          {nextClass && (
            <Button
              size="lg"
              className={cn(
                "flex-1 rounded-2xl bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-300",
                variantGradient,
              )}
            >
              <Play className="h-5 w-5 mr-2" />
              Join Class
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}
