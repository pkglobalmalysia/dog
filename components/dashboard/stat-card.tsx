import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  progress?: number
  className?: string
  iconClassName?: string
}

export function StatCard({ title, value, icon: Icon, progress, className, iconClassName }: StatCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-full", iconClassName || "bg-primary/10")}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>

      {typeof progress === "number" && (
        <div className="mt-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
