"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Video,
  Clock,
  DollarSign,
  Settings,
  Bell,
  Search,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface ModernSidebarProps {
  role: "student" | "teacher" | "admin"
}

export function ModernSidebar({ role }: ModernSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { signOut, profile } = useAuth()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const studentLinks = [
    { title: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { title: "My Courses", href: "/dashboard/student/my-courses", icon: GraduationCap },
    { title: "Assignments", href: "/dashboard/student/assignments", icon: FileText },
    { title: "Lectures", href: "/dashboard/student/lectures", icon: Video },
    { title: "Calendar", href: "/dashboard/student/calendar", icon: Calendar },
    { title: "Profile", href: "/dashboard/student/profile", icon: Users },
  ]

  const teacherLinks = [
    { title: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    { title: "Assignments", href: "/dashboard/teacher/assignments", icon: FileText },
    { title: "Lectures", href: "/dashboard/teacher/lectures", icon: Video },
    { title: "Attendance", href: "/dashboard/teacher/attendance", icon: Clock },
    { title: "Calendar", href: "/dashboard/teacher/calendar", icon: Calendar },
    { title: "Salary", href: "/dashboard/teacher/salary", icon: DollarSign },
  ]

  const adminLinks = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Courses", href: "/admin/courses", icon: BookOpen },
    { title: "Lectures", href: "/admin/lectures", icon: Video },
    { title: "Calendar", href: "/admin/calendar", icon: Calendar },
    { title: "Salary Management", href: "/admin/salary-management", icon: DollarSign },
  ]

  const links = role === "student" ? studentLinks : role === "teacher" ? teacherLinks : adminLinks

  const getRoleConfig = () => {
    switch (role) {
      case "admin":
        return {
          gradient: "from-violet-600 via-purple-600 to-indigo-700",
          bgPattern: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
          accent: "bg-white/10 backdrop-blur-sm border border-white/20",
          activeAccent: "bg-white/20 backdrop-blur-md border border-white/30 shadow-lg",
          title: "Admin Portal",
          subtitle: "System Control",
        }
      case "teacher":
        return {
          gradient: "from-blue-600 via-cyan-600 to-teal-700",
          bgPattern: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
          accent: "bg-white/10 backdrop-blur-sm border border-white/20",
          activeAccent: "bg-white/20 backdrop-blur-md border border-white/30 shadow-lg",
          title: "Teacher Portal",
          subtitle: "Education Hub",
        }
      case "student":
        return {
          gradient: "from-emerald-600 via-green-600 to-teal-700",
          bgPattern: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
          accent: "bg-white/10 backdrop-blur-sm border border-white/20",
          activeAccent: "bg-white/20 backdrop-blur-md border border-white/30 shadow-lg",
          title: "Student Portal",
          subtitle: "Learning Journey",
        }
      default:
        return {
          gradient: "from-gray-800 to-gray-900",
          bgPattern: "bg-gradient-to-br",
          accent: "bg-white/10 backdrop-blur-sm border border-white/20",
          activeAccent: "bg-white/20 backdrop-blur-md border border-white/30 shadow-lg",
          title: "EduLMS",
          subtitle: "Learning Platform",
        }
    }
  }

  const config = getRoleConfig()

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-6 left-6 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="h-12 w-12 bg-white/90 backdrop-blur-md shadow-xl border-0 hover:bg-white"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        <div className={cn("flex flex-col h-full", config.bgPattern, config.gradient)}>
          {/* Header */}
          <div className="p-8 border-b border-white/10">
            <Link href="/" className="flex items-center text-white mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 border border-white/30">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <div className="text-2xl font-bold">EduLMS</div>
                <div className="text-sm opacity-80">{config.subtitle}</div>
              </div>
            </Link>

            {/* User Profile */}
            <div className={cn("flex items-center space-x-4 p-4 rounded-2xl", config.accent)}>
              <Avatar className="h-12 w-12 border-2 border-white/30">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.full_name || "User"}</p>
                <p className="text-xs text-white/70 capitalize">{role}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-300",
                  isActive(link.href) ? config.activeAccent : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <link.icon className="mr-4 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{link.title}</span>
                {isActive(link.href) && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                <Search className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 rounded-2xl py-3"
              onClick={signOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu}></div>
          <div
            className={cn("relative flex-1 flex flex-col max-w-sm w-full h-full", config.bgPattern, config.gradient)}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <Link href="/" className="flex items-center text-white mb-6" onClick={closeMobileMenu}>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 border border-white/30">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-2xl font-bold">EduLMS</div>
                  <div className="text-sm opacity-80">{config.subtitle}</div>
                </div>
              </Link>

              {/* User Profile */}
              <div className={cn("flex items-center space-x-4 p-4 rounded-2xl", config.accent)}>
                <Avatar className="h-12 w-12 border-2 border-white/30">
                  <AvatarImage src="/placeholder.svg?height=48&width=48" />
                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-white/70 capitalize">{role}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-300",
                    isActive(link.href) ? config.activeAccent : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                  onClick={closeMobileMenu}
                >
                  <link.icon className="mr-4 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{link.title}</span>
                  {isActive(link.href) && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <Button
                variant="ghost"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 rounded-2xl py-3"
                onClick={signOut}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
