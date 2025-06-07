"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface SidebarProps {
  role: "student" | "teacher" | "admin"
}

export function Sidebar({ role }: SidebarProps) {
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
    {
      title: "Dashboard",
      href: "/dashboard/student",
      icon: LayoutDashboard,
    },
    {
      title: "My Courses",
      href: "/dashboard/student/my-courses",
      icon: GraduationCap,
    },
    {
      title: "Assignments",
      href: "/dashboard/student/assignments",
      icon: FileText,
    },
    {
      title: "Lectures",
      href: "/dashboard/student/lectures",
      icon: Video,
    },
    {
      title: "Calendar",
      href: "/dashboard/student/calendar",
      icon: Calendar,
    },
    {
      title: "Profile",
      href: "/dashboard/student/profile",
      icon: Users,
    },
  ]

  const teacherLinks = [
    {
      title: "Dashboard",
      href: "/dashboard/teacher",
      icon: LayoutDashboard,
    },
    {
      title: "Assignments",
      href: "/dashboard/teacher/assignments",
      icon: FileText,
    },
    {
      title: "Lectures",
      href: "/dashboard/teacher/lectures",
      icon: Video,
    },
    {
      title: "Attendance",
      href: "/dashboard/teacher/attendance",
      icon: Clock,
    },
    {
      title: "Calendar",
      href: "/dashboard/teacher/calendar",
      icon: Calendar,
    },
    {
      title: "Salary",
      href: "/dashboard/teacher/salary",
      icon: DollarSign,
    },
  ]

  const adminLinks = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Courses",
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      title: "Lectures",
      href: "/admin/lectures",
      icon: Video,
    },
    {
      title: "Calendar",
      href: "/admin/calendar",
      icon: Calendar,
    },
    {
      title: "Salary Management",
      href: "/admin/salary-management",
      icon: DollarSign,
    },
  ]

  const links = role === "student" ? studentLinks : role === "teacher" ? teacherLinks : adminLinks

  const getSidebarGradient = () => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800"
      case "teacher":
        return "bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800"
      case "student":
        return "bg-gradient-to-b from-green-600 via-green-700 to-green-800"
      default:
        return "bg-gradient-to-b from-gray-800 to-gray-900"
    }
  }

  const getRoleTitle = () => {
    switch (role) {
      case "admin":
        return "Admin Panel"
      case "teacher":
        return "Teacher Portal"
      case "student":
        return "Student Portal"
      default:
        return "EduLMS"
    }
  }

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "text-purple-200"
      case "teacher":
        return "text-blue-200"
      case "student":
        return "text-green-200"
      default:
        return "text-gray-200"
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="glass-effect border-white/20 hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40">
        <div className={cn("flex flex-col flex-grow overflow-y-auto shadow-2xl", getSidebarGradient())}>
          {/* Logo/Brand Section */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-white/10">
            <Link href="/" className="flex items-center text-white group">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <div className="text-xl font-bold">EduLMS</div>
                <div className={cn("text-xs font-medium", getRoleColor())}>{getRoleTitle()}</div>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name || "User"}</p>
                <p className={cn("text-xs capitalize", getRoleColor())}>{role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative",
                  isActive(link.href)
                    ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <link.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{link.title}</span>
                {isActive(link.href) && <ChevronRight className="h-4 w-4 opacity-60" />}
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              onClick={signOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu}></div>
          <div className={cn("relative flex-1 flex flex-col max-w-xs w-full h-full shadow-2xl", getSidebarGradient())}>
            {/* Logo/Brand Section */}
            <div className="flex items-center justify-center h-20 px-6 border-b border-white/10">
              <Link href="/" className="flex items-center text-white" onClick={closeMobileMenu}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <div className="text-xl font-bold">EduLMS</div>
                  <div className={cn("text-xs font-medium", getRoleColor())}>{getRoleTitle()}</div>
                </div>
              </Link>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white truncate">{profile?.full_name || "User"}</p>
                  <p className={cn("text-xs capitalize", getRoleColor())}>{role}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive(link.href)
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                  onClick={closeMobileMenu}
                >
                  <link.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{link.title}</span>
                  {isActive(link.href) && <ChevronRight className="h-4 w-4 opacity-60" />}
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
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
