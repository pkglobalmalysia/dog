import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface CourseProgressRowProps {
  id: string
  title: string
  code: string
  progress: number
  totalAssignments?: number
  completedAssignments?: number
}

export function CourseProgressRow({
  id,
  title,
  code,
  progress,
  totalAssignments = 0,
  completedAssignments = 0,
}: CourseProgressRowProps) {
  return (
    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 py-3">
      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
        <span className="font-semibold text-primary">{code.substring(0, 1)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          {totalAssignments > 0 && (
            <span className="mr-3">
              {completedAssignments}/{totalAssignments} assignments
            </span>
          )}
        </div>
      </div>

      <div className="ml-4 flex items-center">
        <div className="w-24 mr-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">{progress}%</div>
        </div>

        <Link href={`/courses/${id}`}>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>
      </div>
    </div>
  )
}
