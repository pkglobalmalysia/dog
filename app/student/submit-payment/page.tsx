'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Upload, CreditCard, Building2 } from 'lucide-react'

interface Course {
  id: string
  title: string
  price: number
  description: string
}

export default function SubmitPaymentPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  const [formData, setFormData] = useState({
    course_id: '',
    payment_amount: '',
    payment_method: 'bank_transfer',
    receipt_image_url: '',
    bank_reference: '',
    notes: ''
  })

  useEffect(() => {
    // Load user's enrolled courses that need payment
    loadEnrolledCourses()
  }, [])

  const loadEnrolledCourses = async () => {
    try {
      // Mock data for now - in real app, fetch from API
      setAvailableCourses([
        { id: '1', title: 'English Speaking Course', price: 200, description: 'Basic English conversation' },
        { id: '2', title: 'IELTS Preparation', price: 350, description: 'IELTS exam preparation' },
        { id: '3', title: 'Business English', price: 400, description: 'Professional English communication' }
      ])
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  const handleCourseChange = (courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId)
    setSelectedCourse(course || null)
    setFormData(prev => ({
      ...prev,
      course_id: courseId,
      payment_amount: course?.price.toString() || ''
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('💰 Submitting payment:', formData)

      const response = await fetch('/api/student/submit-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Payment Submitted Successfully! ✅',
          description: 'Your payment is now pending admin approval',
          variant: 'default'
        })

        console.log('✅ Payment submitted:', result)
        
        // Reset form
        setFormData({
          course_id: '',
          payment_amount: '',
          payment_method: 'bank_transfer',
          receipt_image_url: '',
          bank_reference: '',
          notes: ''
        })
        setSelectedCourse(null)
        
        // Redirect to dashboard
        router.push('/dashboard?tab=payments&submitted=true')
      } else {
        throw new Error(result.error || 'Failed to submit payment')
      }
    } catch (error) {
      console.error('❌ Payment submission error:', error)
      toast({
        title: 'Submission Failed ❌',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <CreditCard className="w-6 h-6 mr-2" />
            Submit Course Payment
          </CardTitle>
          <CardDescription>
            Submit your course payment for admin approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="course">Select Course *</Label>
              <Select value={formData.course_id} onValueChange={handleCourseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course to pay for" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} - RM{course.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCourse && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedCourse.description}</p>
                  <p className="text-lg font-semibold mt-1">
                    Amount: RM{selectedCourse.price}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Amount */}
            <div className="space-y-2">
              <Label htmlFor="payment_amount">Payment Amount (RM) *</Label>
              <Input
                id="payment_amount"
                type="number"
                placeholder="0.00"
                value={formData.payment_amount}
                onChange={(e) => handleInputChange('payment_amount', e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => handleInputChange('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="online_banking">Online Banking</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash_deposit">Cash Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Reference */}
            <div className="space-y-2">
              <Label htmlFor="bank_reference">Bank Reference / Transaction ID</Label>
              <Input
                id="bank_reference"
                placeholder="Enter bank reference number"
                value={formData.bank_reference}
                onChange={(e) => handleInputChange('bank_reference', e.target.value)}
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label htmlFor="receipt_image_url">Receipt Image URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="receipt_image_url"
                  type="url"
                  placeholder="https://example.com/receipt.jpg"
                  value={formData.receipt_image_url}
                  onChange={(e) => handleInputChange('receipt_image_url', e.target.value)}
                />
                <Button type="button" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload your payment receipt for verification
              </p>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about your payment..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Bank Details Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Payment Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm space-y-1">
                  <p><strong>Bank:</strong> Maybank</p>
                  <p><strong>Account Name:</strong> PKIBS Malaysia Sdn Bhd</p>
                  <p><strong>Account Number:</strong> 1234567890123</p>
                  <p><strong>Reference:</strong> Your name + Course name</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isLoading || !formData.course_id || !formData.payment_amount}
                className="flex-1"
              >
                {isLoading ? 'Submitting Payment...' : 'Submit Payment'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/dashboard')}
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
