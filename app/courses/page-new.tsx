import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'
import CoursesClient from './courses-client'

export const metadata: Metadata = generateSEOMetadata({
  title: 'English Courses in Malaysia - Learn English Speaking | iCSE',
  description: 'Join Malaysia\'s top English speaking courses. Master conversational English, business communication, and professional skills with expert instructors. Enroll today!',
  keywords: [
    'english courses malaysia',
    'learn english malaysia',
    'english speaking course',
    'business english malaysia',
    'conversational english',
    'professional english training',
    'english classes kuala lumpur',
    'english language course'
  ]
})

export default function CoursesPage() {
  return <CoursesClient />
}
