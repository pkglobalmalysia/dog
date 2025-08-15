export type Profile = {
  id: string
  full_name: string
  email: string
  role: "student" | "teacher" | "admin"
  approved: boolean
  created_at?: string
  updated_at?: string
}

export type Course = {
  id: string
  title: string
  description: string
  teacher_id?: string
  live_class_url?: string
  scheduled_time?: string
  max_students?: number
  status?: string
  created_at?: string
  updated_at?: string
}

export type Assignment = {
  id: string
  course_id: string
  teacher_id: string
  title: string
  description: string
  due_date?: string
  max_points?: number
  created_at?: string
  updated_at?: string
}

export type TeacherClassAttendance = {
  id: string
  teacher_id: string
  calendar_event_id: string
  status: "scheduled" | "completed" | "approved" | "rejected"
  completed_at?: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  base_amount?: number
  bonus_amount?: number
  total_amount?: number
  payment_date?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export type SalaryPayment = {
  id: string
  teacher_id: string
  month: number
  year: number
  total_classes?: number
  total_amount?: number
  bonus_amount?: number
  final_amount?: number
  status: "pending" | "paid"
  payment_date?: string
  payment_method?: string
  payment_reference?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export type CalendarEvent = {
  id: string
  title: string
  description?: string
  event_type: "class" | "holiday" | "payment" | "other"
  start_time: string
  end_time?: string
  all_day?: boolean
  course_id?: string
  teacher_id?: string
  payment_amount?: number
  color?: string
  created_by?: string
  lecture_id?: string
  created_at?: string
}

export type EnrollmentRequest = {
  id: string
  student_id: string
  course_id: string
  status: "pending" | "approved" | "rejected"
  requested_at?: string
  processed_at?: string
  processed_by?: string
  created_at?: string
  updated_at?: string
}
