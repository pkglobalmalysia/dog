import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkrrwzawpmhexzqqoxmv.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcnJ3emF3cG1oZXh6cXFveG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0OTA5MzIsImV4cCI6MjA1MDA2NjkzMn0.FO_WBQKGbftIK0CtKEBKVQMqDWNxgdHgmZVKTkLCSSE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCourses() {
  try {
    console.log('🔍 Checking courses in database...')
    
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching courses:', error)
      return
    }

    console.log(`✅ Found ${courses?.length || 0} courses in database`)
    courses?.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (Status: ${course.status || 'active'})`)
    })

    return courses
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return null
  }
}

checkCourses()
