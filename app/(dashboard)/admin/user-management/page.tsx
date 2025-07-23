'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Eye, Plus, Search, DollarSign, Users, BookOpen, CheckCircle, XCircle } from 'lucide-react'


interface Student {
  id: string
  email: string
  full_name: string
  ic_number: string
  phone?: string
  address?: string
  date_of_birth?: string
  emergency_contact?: string
  created_at: string
  enrollments_count?: number
  active_enrollments?: number
  total_payments?: number
  pending_payments?: number
  approved: boolean
  profile_picture_url?: string
}

interface StudentPayment {
  id: string
  student_id: string
  amount: number
  payment_method: string
  payment_status: 'pending' | 'approved' | 'rejected'
  receipt_url?: string
  created_at: string
  admin_notes?: string
  approved_at?: string
  approved_by?: string
}

interface Course {
  id: string
  title: string
  price: number
  description?: string
  duration?: string
  status: string
}

interface StudentEnrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  enrollment_status: 'active' | 'completed' | 'suspended'
  admin_notes?: string
  courses_enhanced?: Course  // Updated to match API response
}

interface Teacher {
  id: string
  email: string
  full_name: string
  ic_number?: string
  phone?: string
  address?: string
  specializations?: string
  experience_years?: number
  courses_count?: number
  created_at: string
  approved: boolean
}

interface TeacherSalary {
  id: string
  teacher_id: string
  month: number
  year: number
  total_classes: number
  total_amount: number
  bonus_amount: number
  final_amount: number
  status: string
  payment_date?: string
  created_at: string
  updated_at: string
}

interface Payment {
  id: string
  student: {
    name: string
    email: string
  }
  course: {
    title: string
  }
  payment: {
    amount: number
    status: string
    payment_method: string
    created_at: string
    admin_notes?: string
    receipt_url?: string
  }
}

interface AdminStats {
  total_students: number
  total_teachers: number
  pending_payments: number
  total_revenue: number
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<AdminStats>({
    total_students: 0,
    total_teachers: 0,
    pending_payments: 0,
    total_revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Student details modal state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([])
  const [showStudentDetails, setShowStudentDetails] = useState(false)

  // Teacher details modal state
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [teacherSalaries, setTeacherSalaries] = useState<TeacherSalary[]>([])
  const [showTeacherDetails, setShowTeacherDetails] = useState(false)
  const [editingTeacherProfile, setEditingTeacherProfile] = useState(false)
  const [teacherProfileForm, setTeacherProfileForm] = useState({
    full_name: '',
    email: '',
    ic_number: '',
    phone: '',
    address: '',
    specializations: '',
    experience_years: 0
  })
  const [manualSalaryForm, setManualSalaryForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    total_classes: '',
    total_amount: '',
    bonus_amount: ''
  })

  // New user creation forms
  const [newStudentForm, setNewStudentForm] = useState({
    email: '',
    full_name: '',
    ic_number: '',
    phone: ''
  })

  const [newTeacherForm, setNewTeacherForm] = useState({
    email: '',
    full_name: '',
    ic_number: '',
    phone: ''
  })

  // Edit user state
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    ic_number: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true)
    try {
      const [studentsRes, teachersRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/students-new', { credentials: 'include' }),
        fetch('/api/admin/teachers-new', { credentials: 'include' }),
        fetch('/api/admin/payments-new', { credentials: 'include' })
      ])

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData.students || [])
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData.teachers || [])
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments || [])
      }

      // Calculate stats from loaded data
      setStats({
        total_students: students.length,
        total_teachers: teachers.length,
        pending_payments: payments.filter(p => p.payment.status === 'pending').length,
        total_revenue: payments
          .filter(p => p.payment.status === 'approved')
          .reduce((sum, p) => sum + p.payment.amount, 0)
      })
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/approve-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          payment_id: paymentId,
          action
        })
      })

      if (response.ok) {
        toast({
          title: `Payment ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `Payment has been ${action}d successfully`
        })
        loadData()
      } else {
        throw new Error(`Failed to ${action} payment`)
      }
    } catch (err) {
      console.error('Payment action error:', err)
      toast({
        title: 'Action Failed',
        description: `Failed to ${action} payment`,
        variant: 'destructive'
      })
    }
  }

  // Handle viewing payment receipts
  const handleViewReceipt = (receiptUrl?: string) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank')
    } else {
      toast({
        title: 'No Receipt',
        description: 'No receipt image available for this payment',
        variant: 'destructive'
      })
    }
  }

  // Handle student click to show details and payments
  const loadStudentPayments = async (student: Student) => {
    try {
      console.log('Loading payments for student:', student.id)
      const response = await fetch(`/api/admin/student-payments/${student.id}`, { 
        credentials: 'include' 
      })
      const data = await response.json()
      
      console.log('Student payments API response:', data)
      
      if (response.ok && data.success) {
        setStudentPayments(data.payments || [])
        console.log('Student payments loaded:', data.payments?.length || 0)
      } else {
        console.error('Failed to load student payments:', data.error || data.message)
        setStudentPayments([])
      }
    } catch (error) {
      console.error('Error loading student payments:', error)
      // Set empty array if failed to load
      setStudentPayments([])
    }
  }

  // Handle teacher click to show details and salary
  const loadTeacherSalaries = async (teacher: Teacher) => {
    try {
      console.log('Loading salaries for teacher:', teacher.id)
      const response = await fetch(`/api/admin/teacher-salaries/${teacher.id}`, { 
        credentials: 'include' 
      })
      const data = await response.json()
      
      console.log('Teacher salaries API response:', data)
      
      if (response.ok && data.success) {
        setTeacherSalaries(data.salaries || [])
        console.log('Teacher salaries loaded:', data.salaries?.length || 0)
      } else {
        console.error('Failed to load teacher salaries:', data.error || data.message)
        setTeacherSalaries([])
      }
    } catch (error) {
      console.error('Error loading teacher salaries:', error)
      // Set empty array if failed to load
      setTeacherSalaries([])
    }
  }

  const handleStudentClick = async (student: Student) => {
    await loadStudentDetails(student)
  }

  const handleTeacherClick = async (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setShowTeacherDetails(true)
    
    // Initialize teacher profile form with teacher data
    setTeacherProfileForm({
      full_name: teacher.full_name || '',
      email: teacher.email || '',
      ic_number: teacher.ic_number || '',
      phone: teacher.phone || '',
      address: teacher.address || '',
      specializations: teacher.specializations || '',
      experience_years: teacher.experience_years || 0
    })
    
    await loadTeacherSalaries(teacher)
  }

  const createStudentWithAuth = async () => {
    if (!newStudentForm.email || !newStudentForm.full_name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStudentForm,
          user_type: 'student'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message
        })
        setNewStudentForm({ email: '', full_name: '', ic_number: '', phone: '' })
        loadData() // Refresh the data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Student creation error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create student account',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createTeacherWithAuth = async () => {
    if (!newTeacherForm.email || !newTeacherForm.full_name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTeacherForm,
          user_type: 'teacher'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message
        })
        setNewTeacherForm({ email: '', full_name: '', ic_number: '', phone: '' })
        loadData() // Refresh the data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Teacher creation error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create teacher account',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Edit user functions
  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      ic_number: user.ic_number || '',
      phone: user.phone || '',
      address: user.address || ''
    })
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'User updated successfully'
        })
        setEditingUser(null)
        loadData() // Refresh the data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully'
        })
        loadData() // Refresh the data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user'
      })
    } finally {
      setLoading(false)
    }
  }

  // Enhanced state management for student details
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    ic_number: '',
    phone: '',
    address: '',
    date_of_birth: '',
    emergency_contact: ''
  })
  
  // Course assignment and payment management
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [manualPaymentForm, setManualPaymentForm] = useState({
    amount: '',
    method: 'cash',
    notes: ''
  })

  // Enhanced student data loading
  const loadStudentDetails = async (student: Student) => {
    setSelectedStudent(student)
    setShowStudentDetails(true)
    
    // Initialize profile form with student data
    setProfileForm({
      full_name: student.full_name || '',
      email: student.email || '',
      ic_number: student.ic_number || '',
      phone: student.phone || '',
      address: student.address || '',
      date_of_birth: student.date_of_birth || '',
      emergency_contact: student.emergency_contact || ''
    })
    
    // Load student enrollments
    await loadStudentEnrollments(student)
    // Load student payments
    await loadStudentPayments(student)
    // Load available courses
    await loadAvailableCourses()
  }

  const loadStudentEnrollments = async (student: Student) => {
    try {
      const response = await fetch(`/api/admin/student-enrollments/${student.id}`, { 
        credentials: 'include' 
      })
      if (response.ok) {
        const data = await response.json()
        setStudentEnrollments(data.enrollments || [])
      }
    } catch (error) {
      console.error('Error loading student enrollments:', error)
      setStudentEnrollments([])
    }
  }

  const handleUpdateProfile = async () => {
    if (!selectedStudent) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/update-student/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileForm)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Student profile updated successfully'
        })
        setEditingProfile(false)
        // Update local student data
        setSelectedStudent({
          ...selectedStudent,
          ...profileForm
        })
        loadData() // Refresh main data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/delete-enrollment/${enrollmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Enrollment removed successfully'
        })
        if (selectedStudent) {
          await loadStudentEnrollments(selectedStudent)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Delete enrollment error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove enrollment',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/delete-payment/${paymentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Payment deleted successfully'
        })
        if (selectedStudent) {
          await loadStudentPayments(selectedStudent)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Delete payment error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete payment',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableCourses = async () => {
    try {
      console.log('Loading available courses...')
      const response = await fetch('/api/admin/courses', { credentials: 'include' })
      const data = await response.json()
      
      console.log('Courses API response:', data)
      
      if (response.ok && data.success) {
        setAvailableCourses(data.courses || [])
        console.log('Available courses loaded:', data.courses?.length || 0)
      } else {
        console.error('Failed to load courses:', data.error || data.message)
        toast({
          title: 'Warning',
          description: data.message || 'Could not load courses',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load available courses',
        variant: 'destructive'
      })
    }
  }

  const handleCourseAssignment = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast({
        title: 'Error',
        description: 'Please select a course to assign',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/assign-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: selectedCourse,
          enrollment_status: 'active'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Course assigned successfully'
        })
        setSelectedCourse('')
        await loadStudentEnrollments(selectedStudent)
        await loadStudentPayments(selectedStudent)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Course assignment error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign course',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddManualPayment = async () => {
    if (!selectedStudent || !manualPaymentForm.amount) {
      toast({
        title: 'Error',
        description: 'Please enter payment amount',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/add-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          student_id: selectedStudent.id,
          amount: parseFloat(manualPaymentForm.amount),
          payment_method: manualPaymentForm.method,
          admin_notes: manualPaymentForm.notes,
          payment_status: 'approved' // Auto-approve manual payments
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Payment added successfully'
        })
        setManualPaymentForm({ amount: '', method: 'cash', notes: '' })
        await loadStudentPayments(selectedStudent)
        await loadStudentEnrollments(selectedStudent)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Add payment error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add payment',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureUpload = async (file: File) => {
    if (!selectedStudent) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('student_id', selectedStudent.id)

      const response = await fetch('/api/admin/upload-profile-picture', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Profile picture uploaded successfully'
        })
        // Update the selected student's profile picture URL
        setSelectedStudent({
          ...selectedStudent,
          profile_picture_url: result.profile_picture_url
        })
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Profile picture upload error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload profile picture',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Teacher management functions
  const handleUpdateTeacherProfile = async () => {
    if (!selectedTeacher) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/update-teacher/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(teacherProfileForm)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Teacher profile updated successfully'
        })
        setEditingTeacherProfile(false)
        // Update local teacher data
        setSelectedTeacher({
          ...selectedTeacher,
          ...teacherProfileForm
        })
        loadData() // Refresh main data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Teacher profile update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update teacher profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddManualSalary = async () => {
    if (!selectedTeacher || !manualSalaryForm.total_amount || !manualSalaryForm.total_classes) {
      toast({
        title: 'Error',
        description: 'Please enter required salary information',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      console.log('Creating salary record with data:', {
        teacher_id: selectedTeacher.id,
        month: manualSalaryForm.month,
        year: manualSalaryForm.year,
        total_classes: parseInt(manualSalaryForm.total_classes),
        total_amount: parseFloat(manualSalaryForm.total_amount),
        bonus_amount: parseFloat(manualSalaryForm.bonus_amount) || 0,
        status: 'pending'
      })

      const response = await fetch('/api/admin/add-teacher-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teacher_id: selectedTeacher.id,
          month: manualSalaryForm.month,
          year: manualSalaryForm.year,
          total_classes: parseInt(manualSalaryForm.total_classes),
          total_amount: parseFloat(manualSalaryForm.total_amount),
          bonus_amount: parseFloat(manualSalaryForm.bonus_amount) || 0,
          status: 'pending'
        })
      })

      const result = await response.json()
      console.log('API response:', result)

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Salary record added successfully'
        })
        setManualSalaryForm({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          total_classes: '',
          total_amount: '',
          bonus_amount: ''
        })
        await loadTeacherSalaries(selectedTeacher)
      } else {
        console.error('Salary creation failed:', result.error)
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Add salary error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add salary record',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSalary = async (salaryId: string) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/delete-salary/${salaryId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Salary record deleted successfully'
        })
        if (selectedTeacher) {
          await loadTeacherSalaries(selectedTeacher)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Delete salary error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete salary record',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSalaryStatus = async (salaryId: string, status: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/update-salary-status/${salaryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: `Salary ${status} successfully`
        })
        if (selectedTeacher) {
          await loadTeacherSalaries(selectedTeacher)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Update salary status error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update salary status',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => 
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTeachers = teachers.filter(teacher => 
    teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading admin data...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Management Dashboard</h1>
        <p className="text-muted-foreground">
          Manage students, teachers, and payments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="create-user">Create User</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_students}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_teachers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_payments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RM{stats.total_revenue?.toFixed(2) || '0.00'}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Students ({filteredStudents.length})</CardTitle>
                  <CardDescription>Manage student accounts and enrollments</CardDescription>
                </div>
                <Button 
                  onClick={() => router.push('/admin/create-student')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>IC Number</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.ic_number}</TableCell>
                      <TableCell>{student.active_enrollments}/{student.enrollments_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStudentClick(student)}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(student.id, student.full_name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
                  <CardDescription>Manage teacher accounts and specializations</CardDescription>
                </div>
                <Button 
                  onClick={() => router.push('/admin/create-teacher')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Teacher
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>IC Number</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.full_name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.ic_number}</TableCell>
                      <TableCell>{teacher.phone}</TableCell>
                      <TableCell>
                        <Badge variant={teacher.approved ? 'default' : 'secondary'}>
                          {teacher.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTeacherClick(teacher)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Review and approve student payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.student.name}</div>
                          <div className="text-sm text-muted-foreground">{payment.student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.course.title}</TableCell>
                      <TableCell>RM{payment.payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.payment.payment_method}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.payment.status === 'approved' 
                              ? 'default' 
                              : payment.payment.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {payment.payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.payment.receipt_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReceipt(payment.payment.receipt_url)}
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {payment.payment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handlePaymentAction(payment.id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePaymentAction(payment.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Create a new student or teacher account with Supabase authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Creation Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Create Student</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="student@example.com"
                        value={newStudentForm.email}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        placeholder="Full Name"
                        value={newStudentForm.full_name}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">IC Number</label>
                      <Input
                        placeholder="123456789012"
                        value={newStudentForm.ic_number}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, ic_number: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={createStudentWithAuth}
                      disabled={loading || !newStudentForm.email || !newStudentForm.full_name}
                      className="w-full"
                    >
                      {loading ? 'Creating...' : 'Create Student Account'}
                    </Button>
                  </div>
                </div>

                {/* Teacher Creation Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Create Teacher</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="teacher@example.com"
                        value={newTeacherForm.email}
                        onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        placeholder="Dr. Teacher Name"
                        value={newTeacherForm.full_name}
                        onChange={(e) => setNewTeacherForm({ ...newTeacherForm, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">IC Number</label>
                      <Input
                        placeholder="123456789012"
                        value={newTeacherForm.ic_number}
                        onChange={(e) => setNewTeacherForm({ ...newTeacherForm, ic_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input
                        placeholder="+60123456789"
                        value={newTeacherForm.phone}
                        onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={createTeacherWithAuth}
                      disabled={loading || !newTeacherForm.email || !newTeacherForm.full_name || !newTeacherForm.ic_number}
                      className="w-full"
                    >
                      {loading ? 'Creating...' : 'Create Teacher Account'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit {editingUser.role === 'student' ? 'Student' : 'Teacher'}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IC Number</label>
                <input
                  type="text"
                  value={editForm.ic_number}
                  onChange={(e) => setEditForm({...editForm, ic_number: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Student Management: {selectedStudent.full_name}</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowStudentDetails(false)
                  setEditingProfile(false)
                }}
              >
                <XCircle className="h-6 w-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Personal Information */}
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Personal Information
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProfile(!editingProfile)}
                    >
                      {editingProfile ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Picture */}
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                      {selectedStudent.profile_picture_url ? (
                        <img 
                          src={`${selectedStudent.profile_picture_url}?t=${Date.now()}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          key={selectedStudent.profile_picture_url}
                        />
                      ) : (
                        <Users className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleProfilePictureUpload(file)
                        }
                      }}
                      style={{ display: 'none' }}
                      id="profile-picture-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('profile-picture-upload')?.click()}
                      disabled={loading}
                    >
                      Upload Photo
                    </Button>
                  </div>
                  
                  {/* Editable Profile Fields */}
                  {editingProfile ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <Input
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm(prev => ({...prev, full_name: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <Input
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({...prev, email: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">IC Number</label>
                        <Input
                          value={profileForm.ic_number}
                          onChange={(e) => setProfileForm(prev => ({...prev, ic_number: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({...prev, phone: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Address</label>
                        <Input
                          value={profileForm.address}
                          onChange={(e) => setProfileForm(prev => ({...prev, address: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                        <Input
                          type="date"
                          value={profileForm.date_of_birth}
                          onChange={(e) => setProfileForm(prev => ({...prev, date_of_birth: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                        <Input
                          value={profileForm.emergency_contact}
                          onChange={(e) => setProfileForm(prev => ({...prev, emergency_contact: e.target.value}))}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleUpdateProfile} 
                          disabled={loading}
                          className="flex-1"
                        >
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingProfile(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-lg">{selectedStudent.full_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p>{selectedStudent.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">IC Number</label>
                        <p>{selectedStudent.ic_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p>{selectedStudent.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Address</label>
                        <p>{selectedStudent.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                        <p>{selectedStudent.date_of_birth || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                        <p>{selectedStudent.emergency_contact || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <Badge variant={selectedStudent.approved ? 'default' : 'secondary'}>
                          {selectedStudent.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Registration Date</label>
                        <p>{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Management */}
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Course Assignment */}
                    <div>
                      <h4 className="font-medium mb-2">Assign New Course</h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select 
                          className="flex-1 border rounded px-3 py-2 max-w-full truncate text-sm"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                          <option value="">Select Course to Assign</option>
                          {availableCourses.map((course) => (
                            <option key={course.id} value={course.id} title={`${course.title} - RM ${course.price}`}>
                              {course.title.length > 30 ? `${course.title.substring(0, 30)}...` : course.title} - RM {course.price}
                            </option>
                          ))}
                        </select>
                        <Button 
                          onClick={handleCourseAssignment}
                          disabled={!selectedCourse || loading}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                    
                    {/* Enrolled Courses */}
                    <div>
                      <h4 className="font-medium mb-2">Enrolled Courses ({studentEnrollments.length})</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {studentEnrollments.length > 0 ? (
                          studentEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate" title={enrollment.courses_enhanced?.title || 'Unknown Course'}>
                                  {enrollment.courses_enhanced?.title || 'Unknown Course'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Price: RM {enrollment.courses_enhanced?.price || 'N/A'}
                                </p>
                                {enrollment.admin_notes && (
                                  <p className="text-xs text-gray-500 truncate" title={enrollment.admin_notes}>
                                    Note: {enrollment.admin_notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge 
                                  variant={
                                    enrollment.enrollment_status === 'active' ? 'default' : 
                                    enrollment.enrollment_status === 'completed' ? 'secondary' : 'outline'
                                  }
                                >
                                  {enrollment.enrollment_status}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEnrollment(enrollment.id)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded">
                            No courses assigned yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Management */}
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add Manual Payment */}
                    <div>
                      <h4 className="font-medium mb-2">Add Manual Payment</h4>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input 
                            placeholder="Amount (RM)" 
                            type="number" 
                            className="flex-1"
                            value={manualPaymentForm.amount}
                            onChange={(e) => setManualPaymentForm(prev => ({
                              ...prev,
                              amount: e.target.value
                            }))}
                          />
                          <select 
                            className="border rounded px-3 py-2 sm:min-w-[140px]"
                            value={manualPaymentForm.method}
                            onChange={(e) => setManualPaymentForm(prev => ({
                              ...prev,
                              method: e.target.value
                            }))}
                          >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="online">Online Payment</option>
                          </select>
                        </div>
                        <Input 
                          placeholder="Admin notes (optional)"
                          value={manualPaymentForm.notes}
                          onChange={(e) => setManualPaymentForm(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                        />
                        <Button 
                          onClick={handleAddManualPayment}
                          disabled={!manualPaymentForm.amount || loading}
                          className="w-full"
                        >
                          Add Payment
                        </Button>
                      </div>
                    </div>

                    {/* Payment History */}
                    <div>
                      <h4 className="font-medium mb-2">Payment History ({studentPayments.length})</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {studentPayments.length > 0 ? (
                          studentPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex-1">
                                <p className="font-medium">RM {payment.amount}</p>
                                <p className="text-sm text-gray-600">{payment.payment_method}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(payment.created_at).toLocaleDateString()}
                                </p>
                                {payment.admin_notes && (
                                  <p className="text-xs text-gray-500">Note: {payment.admin_notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={
                                    payment.payment_status === 'approved' ? 'default' : 
                                    payment.payment_status === 'rejected' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {payment.payment_status}
                                </Badge>
                                <div className="flex gap-1">
                                  {payment.receipt_url && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleViewReceipt(payment.receipt_url)}
                                      disabled={loading}
                                      title="View Receipt"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {payment.payment_status === 'pending' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handlePaymentAction(payment.id, 'approve')}
                                        disabled={loading}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handlePaymentAction(payment.id, 'reject')}
                                        disabled={loading}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePayment(payment.id)}
                                    disabled={loading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded">
                            No payments found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowStudentDetails(false)
                  setEditingProfile(false)
                }}
              >
                Close
              </Button>
              <Button 
                onClick={() => loadStudentDetails(selectedStudent)}
                disabled={loading}
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Details Modal with Salary Management */}
      {showTeacherDetails && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Teacher Management: {selectedTeacher.full_name}</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTeacherDetails(false)
                  setEditingTeacherProfile(false)
                }}
              >
                <XCircle className="h-6 w-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Personal Information */}
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Personal Information
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTeacherProfile(!editingTeacherProfile)}
                    >
                      {editingTeacherProfile ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Editable Profile Fields */}
                  {editingTeacherProfile ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <Input
                          value={teacherProfileForm.full_name}
                          onChange={(e) => setTeacherProfileForm(prev => ({...prev, full_name: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <Input
                          value={teacherProfileForm.email}
                          onChange={(e) => setTeacherProfileForm(prev => ({...prev, email: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">IC Number</label>
                        <Input
                          value={teacherProfileForm.ic_number}
                          onChange={(e) => setTeacherProfileForm(prev => ({...prev, ic_number: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <Input
                          value={teacherProfileForm.phone}
                          onChange={(e) => setTeacherProfileForm(prev => ({...prev, phone: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Address</label>
                        <Input
                          value={teacherProfileForm.address}
                          onChange={(e) => setTeacherProfileForm(prev => ({...prev, address: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Specializations</label>
                        <Input
                          value={teacherProfileForm.specializations}
                          onChange={(e) => setTeacherProfileForm(prev => ({...prev, specializations: e.target.value}))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Experience (Years)</label>
                        <Input
                          type="number"
                          value={teacherProfileForm.experience_years}
                          onChange={(e) => setTeacherProfileForm(prev => ({...prev, experience_years: parseInt(e.target.value) || 0}))}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleUpdateTeacherProfile} 
                          disabled={loading}
                          className="flex-1"
                        >
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingTeacherProfile(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div><strong>Name:</strong> {selectedTeacher.full_name}</div>
                      <div><strong>Email:</strong> {selectedTeacher.email}</div>
                      <div><strong>IC Number:</strong> {selectedTeacher.ic_number || 'Not provided'}</div>
                      <div><strong>Phone:</strong> {selectedTeacher.phone || 'Not provided'}</div>
                      <div><strong>Address:</strong> {selectedTeacher.address || 'Not provided'}</div>
                      <div><strong>Specializations:</strong> {selectedTeacher.specializations || 'Not provided'}</div>
                      <div><strong>Experience:</strong> {selectedTeacher.experience_years || 0} years</div>
                      <div><strong>Courses:</strong> {selectedTeacher.courses_count || 0}</div>
                      <div className="flex items-center gap-2">
                        <strong>Status:</strong> 
                        <Badge variant={selectedTeacher.approved ? 'default' : 'secondary'}>
                          {selectedTeacher.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div><strong>Joined:</strong> {new Date(selectedTeacher.created_at).toLocaleDateString()}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Salary Management */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Salary Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Manual Salary Addition */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium mb-3 text-blue-800">Add Manual Salary Record</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Month</label>
                          <select 
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={manualSalaryForm.month}
                            onChange={(e) => setManualSalaryForm(prev => ({...prev, month: parseInt(e.target.value)}))}
                          >
                            {Array.from({length: 12}, (_, i) => (
                              <option key={i+1} value={i+1}>
                                {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Year</label>
                          <Input
                            type="number"
                            value={manualSalaryForm.year}
                            onChange={(e) => setManualSalaryForm(prev => ({...prev, year: parseInt(e.target.value)}))}
                            min="2020"
                            max="2030"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Total Classes</label>
                          <Input
                            type="number"
                            placeholder="Number of classes"
                            value={manualSalaryForm.total_classes}
                            onChange={(e) => setManualSalaryForm(prev => ({...prev, total_classes: e.target.value}))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Base Amount (RM)</label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Base salary amount"
                            value={manualSalaryForm.total_amount}
                            onChange={(e) => setManualSalaryForm(prev => ({...prev, total_amount: e.target.value}))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Bonus Amount (RM)</label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Bonus amount"
                            value={manualSalaryForm.bonus_amount}
                            onChange={(e) => setManualSalaryForm(prev => ({...prev, bonus_amount: e.target.value}))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          onClick={handleAddManualSalary}
                          disabled={loading || !manualSalaryForm.total_amount || !manualSalaryForm.total_classes}
                          size="sm"
                        >
                          Add Salary Record
                        </Button>
                        <p className="text-sm text-gray-600 flex items-center">
                          Total: RM {((parseFloat(manualSalaryForm.total_amount) || 0) + (parseFloat(manualSalaryForm.bonus_amount) || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Salary Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-700">
                          RM {teacherSalaries.reduce((sum, salary) => sum + salary.final_amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Current Month</p>
                        <p className="text-2xl font-bold text-blue-700">
                          RM {teacherSalaries
                            .filter(s => s.month === new Date().getMonth() + 1 && s.year === new Date().getFullYear())
                            .reduce((sum, salary) => sum + salary.final_amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">Total Classes</p>
                        <p className="text-2xl font-bold text-orange-700">
                          {teacherSalaries.reduce((sum, salary) => sum + salary.total_classes, 0)}
                        </p>
                      </div>
                    </div>

                    {/* Salary History with CRUD */}
                    <div>
                      <h4 className="font-medium mb-2">Salary History ({teacherSalaries.length})</h4>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {teacherSalaries.length > 0 ? (
                          teacherSalaries.map((salary) => (
                            <div key={salary.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                              <div className="flex-1">
                                <p className="font-medium">
                                  {new Date(2024, salary.month - 1, 1).toLocaleString('default', { month: 'long' })} {salary.year}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {salary.total_classes} classes • Base: RM {salary.total_amount.toFixed(2)}
                                  {salary.bonus_amount > 0 && ` • Bonus: RM ${salary.bonus_amount.toFixed(2)}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {salary.payment_date 
                                    ? `Paid on ${new Date(salary.payment_date).toLocaleDateString()}` 
                                    : 'Payment pending'
                                  }
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                  <p className="font-bold text-lg">RM {salary.final_amount.toFixed(2)}</p>
                                </div>
                                <Badge 
                                  variant={
                                    salary.status === 'paid' ? 'default' : 
                                    salary.status === 'pending' ? 'secondary' : 'outline'
                                  }
                                >
                                  {salary.status}
                                </Badge>
                                <div className="flex flex-col gap-1">
                                  {salary.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateSalaryStatus(salary.id, 'paid')}
                                      disabled={loading}
                                      className="text-xs h-6"
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteSalary(salary.id)}
                                    disabled={loading}
                                    className="text-xs h-6"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4 border border-dashed rounded">
                            No salary records found
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        onClick={() => window.open('/admin/salary-management', '_blank')}
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        Full Salary Management
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => loadTeacherSalaries(selectedTeacher)}
                        disabled={loading}
                      >
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTeacherDetails(false)
                  setEditingTeacherProfile(false)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
