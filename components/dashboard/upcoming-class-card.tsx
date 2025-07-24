"use client"

import { Button } from "@/components/ui/button"
import { Clock, Video } from "lucide-react"
import { format, formatDistanceToNow, isFuture } from "date-fns"

interface UpcomingClassCardProps {
  title: string
  subject: string
  teacher: string
  time: string
  joinUrl: string
}

export function UpcomingClassCard({ title, subject, teacher, time, joinUrl }: UpcomingClassCardProps) {
  const classTime = new Date(time)
  const isUpcoming = isFuture(classTime)

  if (!isUpcoming) {
    return null // Don't render past classes
  }

  const timeUntilClass = formatDistanceToNow(classTime, { addSuffix: false })

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg bg-white gap-3 sm:gap-0">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Video className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm truncate">{title}</h4>
          <p className="text-xs text-gray-500">{subject}</p>
          <p className="text-xs text-gray-400">by {teacher}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-3">
        <div className="text-left sm:text-right">
          <p className="text-xs text-gray-500">{format(classTime, "MMM d, yyyy • h:mm a")}</p>
          <div className="flex items-center text-xs text-orange-600">
            <Clock className="h-3 w-3 mr-1" />
            {timeUntilClass}
          </div>
        </div>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
          <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="text-white">
            Join
          </a>
        </Button>
      </div>
    </div>
  )
}
