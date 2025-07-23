'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Trash2, Edit, Eye, Plus, Search, DollarSign, Users, BookOpen, Clock } from 'lucide-react'

interface Student {
  id: string
  email: string
  full_name: string
  ic_number: string
  phone: string
  created_at: string
  enrollments_count: number
  active_enrollments: number
  total_payments: number
  pending_payments: number
}

interface Teacher {
  id: string
  email: string
  full_name: string
  specializations: string
  experience_years: number
  courses_count: number
  hourly_rate: number
  has_salary_setup: boolean
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
  }
}

interface Timesheet {
  id: string
  teacher_id: string
  teacher_name: string
  date_worked: string
  start_time: string
  end_time: string
  hours: number
  description: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  hourly_rate: number
  total_amount: number
}

interface AdminStats {
  total_students: number
  total_teachers: number
  pending_payments: number
  pending_timesheets: number
  total_revenue: number
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [stats, setStats] = useState<AdminStats>({
    total_students: 0,
    total_teachers: 0,
    pending_payments: 0,
    pending_timesheets: 0,
    total_revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

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
    specializations: '',
    hourly_rate: ''
  })

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true)
    try {
      const [studentsRes, teachersRes, paymentsRes, timesheetsRes] = await Promise.all([
        fetch('/api/admin/students', { credentials: 'include' }),
        fetch('/api/admin/teachers', { credentials: 'include' }),
        fetch('/api/admin/payments', { credentials: 'include' }),
        fetch('/api/admin/timesheets', { credentials: 'include' })
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

      if (timesheetsRes.ok) {
        const timesheetsData = await timesheetsRes.json()
        setTimesheets(timesheetsData.timesheets || [])
      }

      // Calculate stats from loaded data
      setStats({
        total_students: students.length,
        total_teachers: teachers.length,
        pending_payments: payments.filter(p => p.payment.status === 'pending').length,
        pending_timesheets: timesheets.filter(t => t.status === 'pending').length,
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

  const handleTimesheetAction = async (timesheetId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/approve-timesheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          timesheet_id: timesheetId,
          action
        })
      })

      if (response.ok) {
        toast({
          title: `Timesheet ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `Timesheet has been ${action}d successfully`
        })
        loadData()
      } else {
        throw new Error(`Failed to ${action} timesheet`)
      }
    } catch (err) {
      console.error('Timesheet action error:', err)
      toast({
        title: 'Action Failed',
        description: `Failed to ${action} timesheet`,
        variant: 'destructive'
      })
    }
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
        setNewTeacherForm({ email: '', full_name: '', ic_number: '', specializations: '', hourly_rate: '' })
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
          Manage students, teachers, payments, and salaries
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="salaries">Teacher Hours</TabsTrigger>
          <TabsTrigger value="create-user">Create User</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <CardTitle className="text-sm font-medium">Pending Timesheets</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_timesheets}</div>
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
                    <TableHead>Phone</TableHead>
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
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.active_enrollments}/{student.enrollments_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
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
                    <TableHead>Specializations</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.full_name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.specializations}</TableCell>
                      <TableCell>{teacher.experience_years} years</TableCell>
                      <TableCell>RM{teacher.hourly_rate?.toFixed(2) || '0.00'}/hour</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
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
                        {payment.payment.status === 'pending' && (
                          <div className="flex items-center gap-2">
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
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Hours & Salary Management</CardTitle>
              <CardDescription>Review and approve teacher timesheets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheets.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      <TableCell className="font-medium">{timesheet.teacher_name}</TableCell>
                      <TableCell>{new Date(timesheet.date_worked).toLocaleDateString()}</TableCell>
                      <TableCell>{timesheet.hours} hours</TableCell>
                      <TableCell>{timesheet.description}</TableCell>
                      <TableCell>RM{timesheet.hourly_rate.toFixed(2)}/hour</TableCell>
                      <TableCell>RM{timesheet.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            timesheet.status === 'approved' 
                              ? 'default' 
                              : timesheet.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {timesheet.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {timesheet.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleTimesheetAction(timesheet.id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTimesheetAction(timesheet.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
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
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        placeholder="+60123456789"
                        value={newStudentForm.phone}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
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
                      <label className="text-sm font-medium">Specializations</label>
                      <Textarea
                        placeholder="English Language Teaching, IELTS Preparation"
                        value={newTeacherForm.specializations}
                        onChange={(e) => setNewTeacherForm({ ...newTeacherForm, specializations: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Hourly Rate (RM)</label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={newTeacherForm.hourly_rate}
                        onChange={(e) => setNewTeacherForm({ ...newTeacherForm, hourly_rate: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={createTeacherWithAuth}
                      disabled={loading || !newTeacherForm.email || !newTeacherForm.full_name}
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
    </div>
  )
}
