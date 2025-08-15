export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: "student" | "teacher" | "admin"
          approved: boolean
          created_at: string
          updated_at: string
          avatar_url?: string
          bio?: string
          phone?: string
          address?: string
          education?: string
          experience?: string
          specialization?: string
          hourly_rate?: number
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: "student" | "teacher" | "admin"
          approved?: boolean
          created_at?: string
          updated_at?: string
          avatar_url?: string
          bio?: string
          phone?: string
          address?: string
          education?: string
          experience?: string
          specialization?: string
          hourly_rate?: number
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: "student" | "teacher" | "admin"
          approved?: boolean
          created_at?: string
          updated_at?: string
          avatar_url?: string
          bio?: string
          phone?: string
          address?: string
          education?: string
          experience?: string
          specialization?: string
          hourly_rate?: number
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          teacher_id: string
          created_at: string
          updated_at: string
          approved: boolean
          image_url?: string
          price?: number
          duration?: number
          category?: string
          level?: string
          prerequisites?: string[]
          syllabus?: Json
        }
        Insert: {
          id?: string
          title: string
          description: string
          teacher_id: string
          created_at?: string
          updated_at?: string
          approved?: boolean
          image_url?: string
          price?: number
          duration?: number
          category?: string
          level?: string
          prerequisites?: string[]
          syllabus?: Json
        }
        Update: {
          id?: string
          title?: string
          description?: string
          teacher_id?: string
          created_at?: string
          updated_at?: string
          approved?: boolean
          image_url?: string
          price?: number
          duration?: number
          category?: string
          level?: string
          prerequisites?: string[]
          syllabus?: Json
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          created_at: string
          updated_at: string
          approved: boolean
          progress: number
          completed: boolean
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          created_at?: string
          updated_at?: string
          approved?: boolean
          progress?: number
          completed?: boolean
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          created_at?: string
          updated_at?: string
          approved?: boolean
          progress?: number
          completed?: boolean
        }
      }
      lectures: {
        Row: {
          id: string
          title: string
          description: string
          course_id: string
          created_at: string
          updated_at: string
          scheduled_time: string
          duration: number
          video_url?: string
          materials_url?: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          course_id: string
          created_at?: string
          updated_at?: string
          scheduled_time: string
          duration: number
          video_url?: string
          materials_url?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          course_id?: string
          created_at?: string
          updated_at?: string
          scheduled_time?: string
          duration?: number
          video_url?: string
          materials_url?: string
        }
      }
      lecture_attendance: {
        Row: {
          id: string
          lecture_id: string
          teacher_id: string
          status: "pending" | "completed" | "approved" | "rejected"
          created_at: string
          updated_at: string
          amount: number
          bonus: number
          admin_notes: string
        }
        Insert: {
          id?: string
          lecture_id: string
          teacher_id: string
          status?: "pending" | "completed" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
          amount?: number
          bonus?: number
          admin_notes?: string
        }
        Update: {
          id?: string
          lecture_id?: string
          teacher_id?: string
          status?: "pending" | "completed" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
          amount?: number
          bonus?: number
          admin_notes?: string
        }
      }
      recorded_lectures: {
        Row: {
          id: string
          lecture_id: string
          teacher_id: string
          video_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lecture_id: string
          teacher_id: string
          video_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lecture_id?: string
          teacher_id?: string
          video_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
          user_id: string
          event_type: "lecture" | "assignment" | "exam" | "holiday" | "other"
          course_id?: string
          lecture_id?: string
          location?: string
          color?: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
          user_id: string
          event_type: "lecture" | "assignment" | "exam" | "holiday" | "other"
          course_id?: string
          lecture_id?: string
          location?: string
          color?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          event_type?: "lecture" | "assignment" | "exam" | "holiday" | "other"
          course_id?: string
          lecture_id?: string
          location?: string
          color?: string
        }
      }
      assignments: {
        Row: {
          id: string
          title: string
          description: string
          course_id: string
          due_date: string
          created_at: string
          updated_at: string
          max_score: number
          teacher_id: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          course_id: string
          due_date: string
          created_at?: string
          updated_at?: string
          max_score: number
          teacher_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          course_id?: string
          due_date?: string
          created_at?: string
          updated_at?: string
          max_score?: number
          teacher_id?: string
        }
      }
      student_assignments: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          submission_url: string
          score: number
          feedback: string
          submitted_at: string
          graded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          submission_url?: string
          score?: number
          feedback?: string
          submitted_at?: string
          graded_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          submission_url?: string
          score?: number
          feedback?: string
          submitted_at?: string
          graded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      salary_payments: {
        Row: {
          id: string
          teacher_id: string
          amount: number
          payment_date: string
          created_at: string
          updated_at: string
          month: number
          year: number
          status: "pending" | "approved" | "paid"
          bonus: number
          deductions: number
          final_amount: number
          notes: string
        }
        Insert: {
          id?: string
          teacher_id: string
          amount: number
          payment_date: string
          created_at?: string
          updated_at?: string
          month: number
          year: number
          status?: "pending" | "approved" | "paid"
          bonus?: number
          deductions?: number
          final_amount?: number
          notes?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          amount?: number
          payment_date?: string
          created_at?: string
          updated_at?: string
          month?: number
          year?: number
          status?: "pending" | "approved" | "paid"
          bonus?: number
          deductions?: number
          final_amount?: number
          notes?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
