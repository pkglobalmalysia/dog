import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities for consistent date handling across the application
export const dateUtils = {
  /**
   * Format a date string for datetime-local input
   * @param dateString ISO string or Date object
   * @returns formatted string for datetime-local input
   */
  formatForInput: (dateString: string | Date): string => {
    if (!dateString) return ""
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString)
      
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString)
        return ""
      }
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch (error) {
      console.error("Error formatting date for input:", error)
      return ""
    }
  },

  /**
   * Convert datetime-local input to ISO string for storage
   * @param localDateString datetime-local input value
   * @returns ISO string for database storage
   */
  formatForStorage: (localDateString: string): string => {
    if (!localDateString) return ""
    try {
      const localDate = new Date(localDateString)
      
      if (isNaN(localDate.getTime())) {
        console.warn("Invalid local date:", localDateString)
        return ""
      }
      
      return localDate.toISOString()
    } catch (error) {
      console.error("Error formatting date for storage:", error)
      return ""
    }
  },

  /**
   * Get current time rounded to next 15 minutes
   * @returns Date object rounded to next 15 minutes
   */
  getNextQuarterHour: (): Date => {
    const now = new Date()
    const minutes = Math.ceil(now.getMinutes() / 15) * 15
    now.setMinutes(minutes, 0, 0)
    return now
  },

  /**
   * Add duration to a date
   * @param date base date
   * @param hours hours to add
   * @returns new Date object
   */
  addHours: (date: Date | string, hours: number): Date => {
    const baseDate = date instanceof Date ? date : new Date(date)
    return new Date(baseDate.getTime() + (hours * 60 * 60 * 1000))
  },

  /**
   * Validate that end time is after start time
   * @param startTime start datetime string
   * @param endTime end datetime string
   * @returns true if valid order
   */
  validateTimeOrder: (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return true // Allow empty end time
    
    try {
      const start = new Date(startTime)
      const end = new Date(endTime)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false
      
      return end > start
    } catch {
      return false
    }
  }
}
