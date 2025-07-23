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

export default function CreateTeacherPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [availableCourses] = useState([
    { id: '1', title: 'English Speaking Course' },
    { id: '2', title: 'IELTS Preparation' },
    { id: '3', title: 'Business English' }
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
    // Teacher specific
    qualifications: '',
    specializations: '',
    experience_years: '',
    teaching_subjects: '',
    salary_per_hour: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_name: '',
    courses_to_assign: [] as string[]
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      courses_to_assign: checked 
        ? [...prev.courses_to_assign, courseId]
        : prev.courses_to_assign.filter(id => id !== courseId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('👨‍🏫 Submitting teacher creation:', formData)

      const response = await fetch('/api/admin/create-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Teacher Created Successfully! ✅',
          description: `${result.teacher.full_name} can now login with ${result.teacher.email}`,
          variant: 'default'
        })

        console.log('✅ Teacher created:', result)
        
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
          qualifications: '',
          specializations: '',
          experience_years: '',
          teaching_subjects: '',
          salary_per_hour: '',
          bank_account_name: '',
          bank_account_number: '',
          bank_name: '',
          courses_to_assign: []
        })
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard?tab=teachers&created=true')
      } else {
        throw new Error(result.error || 'Failed to create teacher')
      }
    } catch (error) {
      console.error('❌ Teacher creation error:', error)
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
          <CardTitle className="text-2xl">Create New Teacher</CardTitle>
          <CardDescription>
            Create a new teacher account with authentication and course assignment
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
                  placeholder="teacher@example.com"
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
                  placeholder="Jane Smith"
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

            {/* Teaching Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Teaching Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="PhD in English Literature, TESOL Certificate..."
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange('qualifications', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations</Label>
                  <Textarea
                    id="specializations"
                    placeholder="IELTS Preparation, Business English, Conversational English..."
                    value={formData.specializations}
                    onChange={(e) => handleInputChange('specializations', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    placeholder="5"
                    value={formData.experience_years}
                    onChange={(e) => handleInputChange('experience_years', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teaching_subjects">Teaching Subjects</Label>
                  <Input
                    id="teaching_subjects"
                    placeholder="English, IELTS, Business Communication"
                    value={formData.teaching_subjects}
                    onChange={(e) => handleInputChange('teaching_subjects', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Salary Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_per_hour">Salary Per Hour (RM)</Label>
                  <Input
                    id="salary_per_hour"
                    type="number"
                    placeholder="50.00"
                    value={formData.salary_per_hour}
                    onChange={(e) => handleInputChange('salary_per_hour', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    placeholder="Maybank, CIMB, etc."
                    value={formData.bank_name}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_account_name">Account Holder Name</Label>
                  <Input
                    id="bank_account_name"
                    placeholder="Jane Smith"
                    value={formData.bank_account_name}
                    onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    placeholder="1234567890"
                    value={formData.bank_account_number}
                    onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Course Assignment */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Course Assignment</h3>
              <div className="grid grid-cols-1 gap-3">
                {availableCourses.map(course => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={formData.courses_to_assign.includes(course.id)}
                      onCheckedChange={(checked) => handleCourseToggle(course.id, checked as boolean)}
                    />
                    <Label htmlFor={`course-${course.id}`} className="flex-1">
                      {course.title}
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
                {isLoading ? 'Creating Teacher...' : 'Create Teacher'}
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
