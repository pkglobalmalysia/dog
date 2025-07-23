// Admin User Creation Test with Proper Authentication
import { createClient } from '@supabase/supabase-js'

console.log('🧪 Testing Admin User Creation with Authentication...\n')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Test creating a student using admin login
async function testAdminUserCreation() {
  console.log('🔐 Step 1: Admin Authentication Test...')
  
  try {
    // Try to sign in as admin (use existing admin credentials)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'pkibs.office@gmail.com', // Known working admin
      password: 'teachersophie'
    })

    if (authError) {
      console.log('❌ Admin authentication failed:', authError.message)
      return false
    }

    console.log('✅ Admin authenticated successfully!')
    console.log(`   User ID: ${authData.user.id}`)
    console.log(`   Email: ${authData.user.email}`)

    // Get the session for API calls
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log('❌ No active session found')
      return false
    }

    console.log('\n🧑‍🎓 Step 2: Creating test student...')

    const testStudent = {
      email: 'admin-created-student@example.com',
      password: 'StudentPass123!',
      full_name: 'Admin Created Student',
      ic_number: '123456-78-9012',
      phone: '+60123456789',
      address: 'Test Address, Kuala Lumpur',
      date_of_birth: '1995-06-15',
      gender: 'male',
      emergency_contact: 'Parent: +60987654321',
      courses_to_enroll: []
    }

    const response = await fetch('http://localhost:3002/api/admin/create-student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'Cookie': `sb-access-token=${session.access_token}; sb-refresh-token=${session.refresh_token}`
      },
      body: JSON.stringify(testStudent)
    })

    const result = await response.json()
    
    if (response.ok && result.success) {
      console.log('✅ Student Created Successfully!')
      console.log(`   Student ID: ${result.student.id}`)
      console.log(`   Email: ${result.student.email}`)
      console.log(`   Name: ${result.student.full_name}`)
      console.log(`   Can Login: ${result.student.can_login_immediately}`)
      
      // Test if the created student can login
      console.log('\n🔐 Step 3: Testing created student login...')
      
      const { data: studentAuth, error: studentAuthError } = await supabase.auth.signInWithPassword({
        email: testStudent.email,
        password: testStudent.password
      })

      if (studentAuthError) {
        console.log('❌ Student login failed:', studentAuthError.message)
        return false
      }

      console.log('✅ Student can login successfully!')
      console.log(`   Student authenticated as: ${studentAuth.user.email}`)
      
      // Sign back in as admin for cleanup
      await supabase.auth.signInWithPassword({
        email: 'pkibs.office@gmail.com',
        password: 'teachersophie'
      })

      return true
    } else {
      console.log('❌ Student Creation Failed!')
      console.log('   Error:', result.error || 'Unknown error')
      console.log('   Full Response:', result)
      return false
    }

  } catch (error) {
    console.error('❌ Test Error:', error)
    return false
  }
}

// Run the test
async function runTest() {
  console.log('🚀 Starting Admin User Creation Test...')
  console.log('⏰ Timestamp:', new Date().toISOString())
  console.log('=' .repeat(60))
  
  const success = await testAdminUserCreation()
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 FINAL RESULT:', success ? '✅ SUCCESS' : '❌ FAILED')
  
  if (success) {
    console.log('\n🎉 Admin user creation system is working!')
    console.log('✅ Admin can create students with authentication')
    console.log('✅ Created students can login immediately')
    console.log('\n📝 Phase 2 Complete - Ready for Phase 3!')
  } else {
    console.log('\n❌ Admin user creation needs debugging')
  }
}

runTest().catch(console.error)
