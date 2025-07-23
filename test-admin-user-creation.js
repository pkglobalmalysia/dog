// Test script for admin user creation features
console.log('🧪 Testing Admin User Creation System...\n')

const BASE_URL = 'http://localhost:3002'

// Test data
const testStudent = {
  email: 'teststudent001@gmail.com',
  password: 'SecurePass123!',
  full_name: 'John Test Student',
  ic_number: '123456-12-1234',
  phone: '+60123456789',
  address: 'Test Address, Kuala Lumpur',
  date_of_birth: '1995-06-15',
  gender: 'male',
  emergency_contact: 'Parent: +60987654321',
  profile_image_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=student001',
  courses_to_enroll: ['1', '2'] // English Speaking Course, IELTS Prep
}

const testTeacher = {
  email: 'testteacher001@gmail.com',
  password: 'TeachPass123!',
  full_name: 'Jane Test Teacher',
  ic_number: '654321-21-4321',
  phone: '+60123456788',
  address: 'Teacher Address, Kuala Lumpur',
  date_of_birth: '1985-03-20',
  gender: 'female',
  emergency_contact: 'Spouse: +60987654322',
  profile_image_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=teacher001',
  qualifications: 'PhD in English Literature, TESOL Certificate, Cambridge CELTA',
  specializations: 'IELTS Preparation, Business English, Academic Writing',
  experience_years: '10',
  teaching_subjects: 'English Language, IELTS, Business Communication',
  salary_per_hour: '75.00',
  bank_account_name: 'Jane Test Teacher',
  bank_account_number: '1234567890123',
  bank_name: 'Maybank',
  courses_to_assign: ['1', '3'] // English Speaking Course, Business English
}

// Test functions
async function testCreateStudent() {
  console.log('🧑‍🎓 Testing Student Creation...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/create-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'sb-access-token=test; sb-refresh-token=test' // Mock auth
      },
      body: JSON.stringify(testStudent)
    })

    const result = await response.json()
    
    if (response.ok && result.success) {
      console.log('✅ Student Creation SUCCESS!')
      console.log(`   Student ID: ${result.student.id}`)
      console.log(`   Email: ${result.student.email}`)
      console.log(`   Name: ${result.student.full_name}`)
      console.log(`   Courses Enrolled: ${result.student.courses_enrolled}`)
      console.log(`   Can Login: ${result.student.can_login_immediately}`)
      
      if (result.enrollments && result.enrollments.length > 0) {
        console.log('   Course Enrollments:')
        result.enrollments.forEach(enrollment => {
          console.log(`     - ${enrollment.course_title}: ${enrollment.success ? '✅' : '❌'}`)
        })
      }
      
      return result.student
    } else {
      console.log('❌ Student Creation FAILED!')
      console.log('   Error:', result.error)
      console.log('   Response:', result)
      return null
    }
  } catch (error) {
    console.log('❌ Student Creation ERROR!')
    console.log('   Network Error:', error.message)
    return null
  }
}

async function testCreateTeacher() {
  console.log('\n👨‍🏫 Testing Teacher Creation...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/create-teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'sb-access-token=test; sb-refresh-token=test' // Mock auth
      },
      body: JSON.stringify(testTeacher)
    })

    const result = await response.json()
    
    if (response.ok && result.success) {
      console.log('✅ Teacher Creation SUCCESS!')
      console.log(`   Teacher ID: ${result.teacher.id}`)
      console.log(`   Email: ${result.teacher.email}`)
      console.log(`   Name: ${result.teacher.full_name}`)
      console.log(`   Qualifications: ${result.teacher.qualifications}`)
      console.log(`   Salary/Hour: RM${result.teacher.salary_per_hour}`)
      console.log(`   Courses Assigned: ${result.teacher.courses_assigned}`)
      console.log(`   Can Login: ${result.teacher.can_login_immediately}`)
      
      if (result.assignments && result.assignments.length > 0) {
        console.log('   Course Assignments:')
        result.assignments.forEach(assignment => {
          console.log(`     - ${assignment.course_title}: ${assignment.success ? '✅' : '❌'}`)
        })
      }
      
      return result.teacher
    } else {
      console.log('❌ Teacher Creation FAILED!')
      console.log('   Error:', result.error)
      console.log('   Response:', result)
      return null
    }
  } catch (error) {
    console.log('❌ Teacher Creation ERROR!')
    console.log('   Network Error:', error.message)
    return null
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️ Testing Database Schema Setup...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/setup-admin-schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    if (response.ok && result.success) {
      console.log('✅ Database Schema Setup SUCCESS!')
      console.log(`   Message: ${result.message}`)
      if (result.results) {
        console.log('   Tables Status:')
        Object.entries(result.results).forEach(([table, status]) => {
          console.log(`     - ${table}: ${status ? '✅' : '❌'}`)
        })
      }
      return true
    } else {
      console.log('❌ Database Schema Setup FAILED!')
      console.log('   Error:', result.error)
      return false
    }
  } catch (error) {
    console.log('❌ Database Schema Setup ERROR!')
    console.log('   Network Error:', error.message)
    return false
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Admin Feature Tests...')
  console.log('⏰ Timestamp:', new Date().toISOString())
  console.log('🔗 Testing URL:', BASE_URL)
  console.log('=' .repeat(50))
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Test database schema first
  const schemaReady = await testDatabaseSchema()
  
  if (!schemaReady) {
    console.log('❌ Database schema not ready, skipping user creation tests')
    return
  }
  
  // Test student creation
  const student = await testCreateStudent()
  
  // Test teacher creation
  const teacher = await testCreateTeacher()
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 FINAL RESULTS:')
  console.log(`   Database Schema: ${schemaReady ? '✅ READY' : '❌ FAILED'}`)
  console.log(`   Student Creation: ${student ? '✅ SUCCESS' : '❌ FAILED'}`)
  console.log(`   Teacher Creation: ${teacher ? '✅ SUCCESS' : '❌ FAILED'}`)
  
  if (student && teacher) {
    console.log('\n🎉 All admin user creation features are working!')
    console.log('\n📝 Next Steps:')
    console.log('   1. Test login with created accounts')
    console.log('   2. Implement payment approval system')
    console.log('   3. Add salary management features')
    console.log('   4. Create course/lecture management')
  }
  
  console.log('\n✅ Testing complete!')
}

// Run the tests
runTests().catch(console.error)
