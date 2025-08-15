import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ModernStatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  progress?: number
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
  iconClassName?: string
  gradient?: string
}

export function ModernStatCard({
  title,
  value,
  icon: Icon,
  progress,
  trend,
  trendValue,
  className,
  iconClassName,
  gradient = "from-blue-500 to-purple-600",
}: ModernStatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300",
        className,
      )}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 opacity-5 bg-gradient-to-br rounded-full -mr-16 -mt-16",
          gradient,
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>

            {trendValue && (
              <div className="flex items-center space-x-1">
                <span className={cn("text-sm font-medium", getTrendColor())}>
                  {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            )}
          </div>

          {Icon && (
            <div className={cn("p-3 rounded-xl bg-gradient-to-br", iconClassName || gradient)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {typeof progress === "number" && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-500", gradient)}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
