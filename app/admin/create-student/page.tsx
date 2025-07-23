'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function CreateStudentPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [availableCourses] = useState([
    { id: '1', title: 'English Speaking Course', price: 200 },
    { id: '2', title: 'IELTS Preparation', price: 350 },
    { id: '3', title: 'Business English', price: 400 }
  ])
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    ic_number: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    profile_image_url: '',
    courses_to_enroll: [] as string[]
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      courses_to_enroll: checked 
        ? [...prev.courses_to_enroll, courseId]
        : prev.courses_to_enroll.filter(id => id !== courseId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('🧑‍🎓 Submitting student creation:', formData)

      const response = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Student Created Successfully! ✅',
          description: `${result.student.full_name} can now login with ${result.student.email}`,
          variant: 'default'
        })

        console.log('✅ Student created:', result)
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          full_name: '',
          ic_number: '',
          phone: '',
          address: '',
          date_of_birth: '',
          gender: '',
          emergency_contact: '',
          profile_image_url: '',
          courses_to_enroll: []
        })
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard?tab=students&created=true')
      } else {
        throw new Error(result.error || 'Failed to create student')
      }
    } catch (error) {
      console.error('❌ Student creation error:', error)
      toast({
        title: 'Creation Failed ❌',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Student</CardTitle>
          <CardDescription>
            Create a new student account with authentication and course enrollment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ic_number">IC Number</Label>
                <Input
                  id="ic_number"
                  placeholder="123456-12-1234"
                  value={formData.ic_number}
                  onChange={(e) => handleInputChange('ic_number', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+60123456789"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                placeholder="Emergency contact person and phone"
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_image_url">Profile Image URL</Label>
              <Input
                id="profile_image_url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.profile_image_url}
                onChange={(e) => handleInputChange('profile_image_url', e.target.value)}
              />
            </div>

            {/* Course Enrollment */}
            <div className="space-y-4">
              <Label>Enroll in Courses</Label>
              <div className="grid grid-cols-1 gap-3">
                {availableCourses.map(course => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={formData.courses_to_enroll.includes(course.id)}
                      onCheckedChange={(checked) => handleCourseToggle(course.id, checked as boolean)}
                    />
                    <Label htmlFor={`course-${course.id}`} className="flex-1">
                      {course.title} - RM{course.price}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating Student...' : 'Create Student'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
