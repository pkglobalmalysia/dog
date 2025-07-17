"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, Users, Calendar, Clock, Star, ArrowRight } from "lucide-react"
import { format } from "date-fns"

type Course = {
  id: string
  title: string
  description: string
  price: number
  duration: string
  level: string
  teacher_name: string
  scheduled_time: string
  student_count: number
  rating: number
  image_url?: string
}

export default function CoursesClient() {
  const { user, isLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual Supabase query
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'iCSE Alpha - Beginner English Speaking Course',
          description: 'Foundation level English speaking program designed to build confidence and overcome the fear of speaking English in professional settings.',
          price: 1200,
          duration: '3 months',
          level: 'beginner',
          teacher_name: 'Sarah Johnson',
          scheduled_time: '2025-02-01T09:00:00Z',
          student_count: 45,
          rating: 4.9,
          image_url: '/courses/alpha.jpg'
        },
        {
          id: '2',
          title: 'iCSE Beta - Intermediate English Speaking Course',
          description: 'Intermediate level program to enhance fluency and master speaking rhythms for professional communication in Malaysian workplaces.',
          price: 1800,
          duration: '4 months',
          level: 'intermediate',
          teacher_name: 'Michael Chen',
          scheduled_time: '2025-02-15T10:00:00Z',
          student_count: 38,
          rating: 4.8,
          image_url: '/courses/beta.jpg'
        },
        {
          id: '3',
          title: 'iCSE Gamma - Advanced Business English Course',
          description: 'Advanced level program to perfect professional communication skills and master meeting leadership for corporate success.',
          price: 2500,
          duration: '6 months',
          level: 'advanced',
          teacher_name: 'Dr. Priya Sharma',
          scheduled_time: '2025-03-01T14:00:00Z',
          student_count: 28,
          rating: 4.9,
          image_url: '/courses/gamma.jpg'
        }
      ]
      
      setCourses(mockCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const filteredCourses = courses.filter(course => 
    filter === 'all' || course.level === filter
  )

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-12 w-96 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-6 w-128 mx-auto mb-8 bg-white/20" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-32 bg-white/20" />
              <Skeleton className="h-12 w-32 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Course Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            English Courses in Malaysia
          </h1>
          <h2 className="text-xl md:text-2xl mb-6 text-blue-100">
            Master English Speaking with iCSE&apos;s Proven Programs
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
            Choose from our comprehensive range of English speaking courses designed specifically 
            for Malaysian professionals. Join 10,000+ successful graduates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
              <Link href="/signup/student">Enroll Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-4 py-2 rounded-md font-medium capitalize transition-all ${
                    filter === level
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {level === 'all' ? 'All Courses' : `${level} Level`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our English Speaking Courses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive English training programs with guaranteed results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={course.image_url || '/courses/default.jpg'}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getLevelBadgeColor(course.level)} font-medium`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">{course.rating}</span>
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{course.student_count} students</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Starts {format(new Date(course.scheduled_time), 'MMM dd')}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      RM {course.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Instructor: <span className="font-medium">{course.teacher_name}</span>
                  </div>

                  <div className="pt-2">
                    {user ? (
                      <Button asChild className="w-full">
                        <Link href={`/signup/student?course=${course.id}`}>
                          Enroll in Course
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/signup/student">
                          Sign Up to Enroll
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filter or check back later for new courses.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your English Learning Journey?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of professionals who have transformed their careers with our English courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/signup/student">Enroll Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More About iCSE</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
