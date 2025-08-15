"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  Video,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function AdminSidebar() {
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

  const adminLinks = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Teachers",
      href: "/admin/teachers",
      icon: Users,
    },
    {
      title: "Students",
      href: "/admin/students",
      icon: GraduationCap,
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

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-purple-600 to-purple-800 pt-5 overflow-y-auto">
          <div className="flex items-center justify-center h-14 px-4">
            <Link href="/" className="flex items-center text-white">
              <LayoutDashboard className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">LMS Dash</span>
            </Link>
          </div>

          <div className="mt-8 flex-1 flex flex-col px-4">
            <nav className="flex-1 space-y-2">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive(link.href)
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-purple-100 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <link.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive(link.href) ? "text-white" : "text-purple-200 group-hover:text-white",
                    )}
                  />
                  {link.title}
                </Link>
              ))}
            </nav>

            <div className="pb-4 pt-4 border-t border-purple-500/30">
              <Button
                variant="ghost"
                className="w-full justify-start text-purple-100 hover:bg-white/10 hover:text-white"
                onClick={signOut}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeMobileMenu}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-purple-600 to-purple-800 h-full">
            <div className="flex items-center justify-center h-14 px-4 border-b border-purple-500/30">
              <Link href="/" className="flex items-center text-white" onClick={closeMobileMenu}>
                <LayoutDashboard className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold">LMS Dash</span>
              </Link>
            </div>

            <div className="mt-5 flex-1 overflow-y-auto px-4">
              <nav className="space-y-2">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive(link.href)
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                        : "text-purple-100 hover:bg-white/10 hover:text-white",
                    )}
                    onClick={closeMobileMenu}
                  >
                    <link.icon
                      className={cn(
                        "mr-3 h-5 w-5 transition-colors",
                        isActive(link.href) ? "text-white" : "text-purple-200 group-hover:text-white",
                      )}
                    />
                    {link.title}
                  </Link>
                ))}
              </nav>

              <div className="pb-4 pt-4 border-t border-purple-500/30 mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-purple-100 hover:bg-white/10 hover:text-white"
                  onClick={signOut}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
