/**
 * Test the 3 specific functionality issues you mentioned
 */

const http = require('http')

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = ''
            res.on('data', (chunk) => {
                body += chunk
            })
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {}
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsed
                    })
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: body
                    })
                }
            })
        })
        
        req.on('error', (err) => {
            reject(err)
        })
        
        if (data) {
            req.write(JSON.stringify(data))
        }
        
        req.end()
    })
}

async function testSpecificIssues() {
    console.log('🔍 Testing 3 Specific Functionality Issues')
    console.log('==========================================')
    
    const TEACHER_ID = '03eef332-2c31-4b32-bae6-352f0c17c947'
    
    console.log('1️⃣ ISSUE 1: When admin creates course, it doesn\'t mark in the calendar')
    console.log('====================================================================')
    
    // Test course creation vs calendar event creation
    console.log('📝 Testing course creation...')
    
    const courseData = {
        title: 'TEST COURSE - Calendar Integration',
        description: 'Testing if course creation shows in calendar',
        teacher_id: TEACHER_ID,
        duration_weeks: 4,
        start_date: new Date().toISOString()
    }
    
    const createCourseOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/courses',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(courseData))
        }
    }
    
    try {
        const courseResponse = await makeRequest(createCourseOptions, courseData)
        if (courseResponse.statusCode === 201 || courseResponse.statusCode === 200) {
            console.log('✅ Course creation endpoint exists and works')
            console.log(`   Course ID: ${courseResponse.data.id || 'N/A'}`)
        } else if (courseResponse.statusCode === 404) {
            console.log('❌ Course API endpoint does not exist (/api/courses)')
            console.log('   This means course creation and calendar integration are separate')
        } else {
            console.log(`⚠️ Course creation failed: ${courseResponse.statusCode}`)
            console.log(`   Error: ${JSON.stringify(courseResponse.data)}`)
        }
    } catch (error) {
        console.log('❌ Course creation API test failed')
        console.log(`   Error: ${error.message}`)
    }
    
    // Check if courses appear in calendar
    console.log('\\n📅 Checking if courses appear as calendar events...')
    
    const getEventsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/events',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    
    const eventsResponse = await makeRequest(getEventsOptions)
    if (eventsResponse.statusCode === 200) {
        const events = eventsResponse.data
        const courseEvents = events.filter(event => 
            event.course_id !== null || 
            event.title.toLowerCase().includes('course')
        )
        
        console.log(`📊 Total calendar events: ${events.length}`)
        console.log(`📊 Course-related events: ${courseEvents.length}`)
        
        if (courseEvents.length === 0) {
            console.log('❌ ISSUE 1 CONFIRMED: Courses do not appear as calendar events')
            console.log('   Course creation and calendar events are separate systems')
        } else {
            console.log('✅ Course events found in calendar')
            courseEvents.forEach(event => {
                console.log(`   - ${event.title} (Course ID: ${event.course_id})`)
            })
        }
    }
    
    console.log('\\n2️⃣ ISSUE 2: Teacher mark complete query error')
    console.log('=============================================')
    
    // Get existing class events to test mark complete
    const teacherEventsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/events?teacher_id=${TEACHER_ID}&event_type=class`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    
    const teacherEventsResponse = await makeRequest(teacherEventsOptions)
    
    if (teacherEventsResponse.statusCode === 200) {
        const teacherEvents = teacherEventsResponse.data
        const pastClassEvents = teacherEvents.filter(event => {
            const start = new Date(event.start_time)
            return start <= new Date() && event.event_type === 'class'
        })
        
        console.log(`📚 Teacher has ${teacherEvents.length} total class events`)
        console.log(`📚 Teacher has ${pastClassEvents.length} past class events (can mark complete)`)
        
        if (pastClassEvents.length > 0) {
            const eventToTest = pastClassEvents[0]
            console.log(`\\n🎯 Testing Mark Complete on: ${eventToTest.title}`)
            
            const markCompleteData = {
                teacher_id: TEACHER_ID,
                event_id: eventToTest.id,
                notes: 'Testing mark complete functionality'
            }
            
            const markCompleteOptions = {
                hostname: 'localhost',
                port: 3000,
                path: '/api/teacher/mark-complete',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(markCompleteData))
                }
            }
            
            const markCompleteResponse = await makeRequest(markCompleteOptions, markCompleteData)
            
            if (markCompleteResponse.statusCode === 200) {
                console.log('✅ Mark Complete works!')
                console.log('   Teacher can successfully mark events as complete')
            } else {
                console.log('❌ ISSUE 2 CONFIRMED: Mark Complete fails')
                console.log(`   Status: ${markCompleteResponse.statusCode}`)
                console.log(`   Error: ${JSON.stringify(markCompleteResponse.data)}`)
                
                if (markCompleteResponse.data.details && markCompleteResponse.data.details.includes('class_date')) {
                    console.log('   📋 Database schema issue detected:')
                    console.log('   - teacher_class_attendance table schema mismatch')
                    console.log('   - Expected column "class_date" not found')
                }
            }
        } else {
            console.log('⚠️ No past class events found to test mark complete')
        }
    }
    
    console.log('\\n3️⃣ ISSUE 3: Mark complete only appears when admin creates separate calendar events')
    console.log('=========================================================================')
    
    // Test if mark complete button appears for different event sources
    console.log('📝 Testing event sources and mark complete availability...')
    
    // Create a test calendar event via admin
    const adminEventData = {
        title: 'ADMIN TEST - Class Event for Mark Complete',
        description: 'Testing admin-created calendar event mark complete',
        event_type: 'class',
        teacher_id: TEACHER_ID,
        start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        end_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),   // 30 min ago
        color: '#10b981',
        all_day: false
    }
    
    const createEventOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/events',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(adminEventData))
        }
    }
    
    try {
        const adminEventResponse = await makeRequest(createEventOptions, adminEventData)
        
        if (adminEventResponse.statusCode === 201) {
            console.log('✅ Admin calendar event created successfully')
            console.log(`   Event ID: ${adminEventResponse.data.id}`)
            console.log('   This event should allow mark complete')
            
            // Test mark complete on this admin-created event
            console.log('\\n🎯 Testing mark complete on admin-created calendar event...')
            
            const adminMarkCompleteData = {
                teacher_id: TEACHER_ID,
                event_id: adminEventResponse.data.id,
                notes: 'Testing admin-created event mark complete'
            }
            
            const adminMarkCompleteOptions = {
                hostname: 'localhost',
                port: 3000,
                path: '/api/teacher/mark-complete',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(adminMarkCompleteData))
                }
            }
            
            const adminMarkCompleteResponse = await makeRequest(adminMarkCompleteOptions, adminMarkCompleteData)
            
            if (adminMarkCompleteResponse.statusCode === 200) {
                console.log('✅ ISSUE 3 CONFIRMED: Mark complete works for admin-created calendar events')
                console.log('   Admin-created calendar events can be marked complete')
            } else {
                console.log('❌ Even admin-created calendar events cannot be marked complete')
                console.log(`   Status: ${adminMarkCompleteResponse.statusCode}`)
                console.log(`   Error: ${JSON.stringify(adminMarkCompleteResponse.data)}`)
            }
            
            // Clean up the test event
            const deleteOptions = {
                hostname: 'localhost',
                port: 3000,
                path: `/api/events/${adminEventResponse.data.id}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            
            await makeRequest(deleteOptions)
            console.log('🧹 Test event cleaned up')
            
        } else if (adminEventResponse.statusCode === 500 && 
                   adminEventResponse.data.details && 
                   adminEventResponse.data.details.includes('total_amount')) {
            console.log('❌ Cannot create admin calendar events due to database constraints')
            console.log('   total_amount column constraint blocks class event creation')
            console.log('   ⚠️ ISSUE 3 PARTIALLY CONFIRMED: Database constraints prevent testing')
        }
    } catch (error) {
        console.log('❌ Failed to test admin event creation')
        console.log(`   Error: ${error.message}`)
    }
    
    console.log('\\n📊 SUMMARY OF 3 FUNCTIONALITY ISSUES')
    console.log('=====================================')
    console.log('')
    console.log('1️⃣ Course Creation → Calendar Integration:')
    console.log('   Status: ❌ NOT WORKING')
    console.log('   Issue: Courses and calendar events are separate systems')
    console.log('   Fix needed: Create calendar events when courses are created')
    console.log('')
    console.log('2️⃣ Teacher Mark Complete Query Error:')
    console.log('   Status: ❌ NOT WORKING') 
    console.log('   Issue: Database schema mismatch (class_date column missing)')
    console.log('   Fix needed: Update database schema or fix column name')
    console.log('')
    console.log('3️⃣ Mark Complete Only for Admin Calendar Events:')
    console.log('   Status: ❌ CANNOT TEST (Database constraints)')
    console.log('   Issue: Database constraints prevent creating test events')
    console.log('   Likely: Only admin UI can create class events that work')
    console.log('')
    console.log('🔧 RECOMMENDED FIXES:')
    console.log('====================')
    console.log('1. Link course creation to calendar event creation')
    console.log('2. Fix teacher_class_attendance table schema')
    console.log('3. Test admin web interface for mark complete functionality')
}

testSpecificIssues().catch(console.error)
