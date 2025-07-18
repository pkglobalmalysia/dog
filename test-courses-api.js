// Quick test to check if courses exist in the database
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkrrwzawpmhexzqqoxmv.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcnJ3emF3cG1oZXh6cXFveG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0OTA5MzIsImV4cCI6MjA1MDA2NjkzMn0.FO_WBQKGbftIK0CtKEBKVQMqDWNxgdHgmZVKTkLCSSE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCourses() {
  try {
    console.log('🔍 Checking courses in database...')
    
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        scheduled_time,
        teacher_id,
        status,
        profiles(full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching courses:', error)
      return
    }

    console.log(`✅ Found ${courses?.length || 0} courses:`)
    courses?.forEach((course, index) => {
      const teacherName = Array.isArray(course.profiles) ? course.profiles[0]?.full_name : course.profiles?.full_name
      console.log(`${index + 1}. ${course.title}`)
      console.log(`   Teacher: ${teacherName || 'No teacher assigned'}`)
      console.log(`   Status: ${course.status || 'active'}`)
      console.log(`   Scheduled: ${course.scheduled_time ? new Date(course.scheduled_time).toLocaleDateString() : 'TBA'}`)
      console.log('')
    })

    if (!courses || courses.length === 0) {
      console.log('ℹ️  No courses found. You may need to create some courses as admin first.')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testCourses()
