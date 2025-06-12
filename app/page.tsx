"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  GraduationCap,
  UserCheck,
  Shield,
} from "lucide-react"

export default function HomePage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && profile) {
      // Redirect authenticated users to their dashboard
      switch (profile.role) {
        case "admin":
          router.push("/admin")
          break
        case "teacher":
          router.push(profile.approved ? "/dashboard/teacher" : "/pending-approval")
          break
        case "student":
          router.push("/dashboard/student")
          break
        default:
          break
      }
    }
  }, [user, profile, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gradient">PKIBS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="gradient-bg">
                <Link href="/signup/student">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Transform Learning</span>
              <br />
              <span className="text-foreground">with Modern Education</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Experience the future of education with our comprehensive Learning Management System. Designed for
              students, teachers, and administrators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gradient-bg text-lg px-8 py-6">
                <Link href="/signup/student">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link href="/signup/teacher">Join as Teacher</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PKIBS?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to enhance the learning experience for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Interactive Courses</CardTitle>
                <CardDescription>
                  Engage with dynamic course content, assignments, and real-time lectures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Collaborative Learning</CardTitle>
                <CardDescription>
                  Connect with peers and instructors in a supportive learning environment
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your learning journey with detailed analytics and achievements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Flexible Schedule</CardTitle>
                <CardDescription>Learn at your own pace with 24/7 access to course materials</CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Certified Learning</CardTitle>
                <CardDescription>Earn certificates and credentials recognized by industry leaders</CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle>Expert Instructors</CardTitle>
                <CardDescription>Learn from industry professionals and experienced educators</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you are a student, teacher, or administrator, we have the perfect solution for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Students</CardTitle>
                <CardDescription className="text-base">
                  Access courses, submit assignments, and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Interactive course materials
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Assignment submissions
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Progress tracking
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Live class attendance
                  </li>
                </ul>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/signup/student">Sign Up as Student</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Teachers</CardTitle>
                <CardDescription className="text-base">
                  Create courses, manage students, and track performance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Course management
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Assignment grading
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Student analytics
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Salary management
                  </li>
                </ul>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/signup/teacher">Sign Up as Teacher</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl">Administrators</CardTitle>
                <CardDescription className="text-base">
                  Manage the entire platform with comprehensive admin tools
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    User management
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    System analytics
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Content oversight
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Platform configuration
                  </li>
                </ul>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/signup/admin">Admin Access</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">PKIBS</span>
              </div>
              <p className="text-gray-400">
                Empowering education through innovative technology and modern learning experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/courses" className="hover:text-white transition-colors">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup/student" className="hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PKIBS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}