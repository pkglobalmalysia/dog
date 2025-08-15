import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface UltraModernStatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  progress?: number
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
  variant?: "default" | "gradient" | "glass"
  color?: "blue" | "green" | "purple" | "orange" | "red" | "cyan"
}

export function UltraModernStatCard({
  title,
  value,
  icon: Icon,
  progress,
  trend,
  trendValue,
  className,
  variant = "glass",
  color = "blue",
}: UltraModernStatCardProps) {
  const getColorClasses = () => {
    const colors = {
      blue: {
        gradient: "from-blue-500 via-blue-600 to-cyan-600",
        icon: "from-blue-500 to-cyan-500",
        progress: "from-blue-400 to-cyan-400",
        accent: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
      },
      green: {
        gradient: "from-emerald-500 via-green-600 to-teal-600",
        icon: "from-emerald-500 to-teal-500",
        progress: "from-emerald-400 to-teal-400",
        accent: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
      },
      purple: {
        gradient: "from-purple-500 via-violet-600 to-indigo-600",
        icon: "from-purple-500 to-indigo-500",
        progress: "from-purple-400 to-indigo-400",
        accent: "text-purple-600",
        bg: "bg-purple-50 dark:bg-purple-950/30",
      },
      orange: {
        gradient: "from-orange-500 via-amber-600 to-yellow-600",
        icon: "from-orange-500 to-yellow-500",
        progress: "from-orange-400 to-yellow-400",
        accent: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-950/30",
      },
      red: {
        gradient: "from-red-500 via-rose-600 to-pink-600",
        icon: "from-red-500 to-pink-500",
        progress: "from-red-400 to-pink-400",
        accent: "text-red-600",
        bg: "bg-red-50 dark:bg-red-950/30",
      },
      cyan: {
        gradient: "from-cyan-500 via-teal-600 to-blue-600",
        icon: "from-cyan-500 to-blue-500",
        progress: "from-cyan-400 to-blue-400",
        accent: "text-cyan-600",
        bg: "bg-cyan-50 dark:bg-cyan-950/30",
      },
    }
    return colors[color]
  }

  const colorClasses = getColorClasses()

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-emerald-600 dark:text-emerald-400"
      case "down":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case "gradient":
        return `bg-gradient-to-br ${colorClasses.gradient} text-white border-0`
      case "glass":
        return "bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50"
      default:
        return "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1",
        getVariantClasses(),
        className,
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-white/5 to-white/10 rounded-full blur-xl" />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p
              className={cn(
                "text-sm font-medium mb-2",
                variant === "gradient" ? "text-white/80" : "text-gray-600 dark:text-gray-400",
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                "text-4xl font-bold mb-1",
                variant === "gradient" ? "text-white" : "text-gray-900 dark:text-white",
              )}
            >
              {value}
            </p>

            {trendValue && (
              <div className="flex items-center space-x-2">
                {getTrendIcon()}
                <span
                  className={cn("text-sm font-semibold", variant === "gradient" ? "text-white/90" : getTrendColor())}
                >
                  {trendValue}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    variant === "gradient" ? "text-white/70" : "text-gray-500 dark:text-gray-400",
                  )}
                >
                  vs last month
                </span>
              </div>
            )}
          </div>

          {Icon && (
            <div
              className={cn(
                "p-4 rounded-2xl shadow-lg",
                variant === "gradient"
                  ? "bg-white/20 backdrop-blur-sm border border-white/30"
                  : `bg-gradient-to-br ${colorClasses.icon}`,
              )}
            >
              <Icon className={cn("h-8 w-8", variant === "gradient" ? "text-white" : "text-white")} />
            </div>
          )}
        </div>

        {typeof progress === "number" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className={cn(variant === "gradient" ? "text-white/80" : "text-gray-600 dark:text-gray-400")}>
                Progress
              </span>
              <span
                className={cn("font-semibold", variant === "gradient" ? "text-white" : "text-gray-900 dark:text-white")}
              >
                {progress}%
              </span>
            </div>
            <div
              className={cn(
                "h-3 rounded-full overflow-hidden",
                variant === "gradient" ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700",
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  variant === "gradient" ? "bg-white/40 backdrop-blur-sm" : `bg-gradient-to-r ${colorClasses.progress}`,
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
