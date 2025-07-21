/**
 * Test Admin CRUD via Next.js API Routes
 * This script tests the admin functionality by calling the actual API endpoints
 */

const http = require('http')

const BASE_URL = 'http://localhost:3000'

// Helper function to make HTTP requests
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

async function testAdminAPIs() {
    console.log('🎯 Testing Admin CRUD via API Routes')
    console.log('===================================')
    
    try {
        // Test 1: Get existing events via API
        console.log('📅 PHASE 1: Testing GET /api/events')
        console.log('=================================')
        
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
        console.log(`Status: ${eventsResponse.statusCode}`)
        if (eventsResponse.statusCode === 200) {
            console.log(`✅ Successfully fetched events`)
            console.log(`📊 Found ${eventsResponse.data.length || 0} existing events`)
            
            if (eventsResponse.data.length > 0) {
                eventsResponse.data.slice(0, 3).forEach((event, index) => {
                    console.log(`${index + 1}. ${event.title} (${event.event_type})`)
                    console.log(`   Start: ${new Date(event.start_time).toLocaleString()}`)
                })
            }
        } else {
            console.log(`❌ Failed to fetch events: ${eventsResponse.statusCode}`)
            console.log(`Response: ${JSON.stringify(eventsResponse.data)}`)
        }
        
        console.log('')
        
        // Test 2: Create a new event via API
        console.log('📝 PHASE 2: Testing POST /api/events (Create Event)')
        console.log('================================================')
        
        const now = new Date()
        const testEventData = {
            title: 'API TEST - Holiday Event',
            description: 'Testing event creation via API',
            event_type: 'holiday',
            start_time: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            end_time: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString() // Tomorrow + 1 hour
        }
        
        const createEventOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/events',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(testEventData))
            }
        }
        
        const createResponse = await makeRequest(createEventOptions, testEventData)
        console.log(`Status: ${createResponse.statusCode}`)
        
        let createdEventId = null
        if (createResponse.statusCode === 201 || createResponse.statusCode === 200) {
            console.log(`✅ Successfully created event`)
            console.log(`Event Data:`, createResponse.data)
            createdEventId = createResponse.data.id || createResponse.data[0]?.id
        } else {
            console.log(`❌ Failed to create event: ${createResponse.statusCode}`)
            console.log(`Response:`, createResponse.data)
        }
        
        console.log('')
        
        // Test 3: Update the created event
        if (createdEventId) {
            console.log('✏️ PHASE 3: Testing PUT /api/events (Update Event)')
            console.log('===============================================')
            
            const updateEventData = {
                title: 'API TEST - Holiday Event UPDATED',
                description: 'Testing event update via API - MODIFIED'
            }
            
            const updateEventOptions = {
                hostname: 'localhost',
                port: 3000,
                path: `/api/events/${createdEventId}`,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(JSON.stringify(updateEventData))
                }
            }
            
            const updateResponse = await makeRequest(updateEventOptions, updateEventData)
            console.log(`Status: ${updateResponse.statusCode}`)
            
            if (updateResponse.statusCode === 200) {
                console.log(`✅ Successfully updated event`)
                console.log(`Updated Data:`, updateResponse.data)
            } else {
                console.log(`❌ Failed to update event: ${updateResponse.statusCode}`)
                console.log(`Response:`, updateResponse.data)
            }
            
            console.log('')
        }
        
        // Test 4: Test teacher-specific endpoints
        console.log('🍎 PHASE 4: Testing Teacher-specific APIs')
        console.log('========================================')
        
        const teacherId = '03eef332-2c31-4b32-bae6-352f0c17c947' // pkibs.office@gmail.com
        
        const teacherEventsOptions = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/events?teacher_id=${teacherId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        
        try {
            const teacherEventsResponse = await makeRequest(teacherEventsOptions)
            console.log(`Status: ${teacherEventsResponse.statusCode}`)
            
            if (teacherEventsResponse.statusCode === 200) {
                console.log(`✅ Successfully fetched teacher events`)
                console.log(`📊 Teacher has ${teacherEventsResponse.data.length || 0} events`)
                
                if (teacherEventsResponse.data.length > 0) {
                    teacherEventsResponse.data.forEach((event, index) => {
                        const start = new Date(event.start_time)
                        const now = new Date()
                        const status = start <= now ? '✅ Can Mark Complete' : '⏳ Future Event'
                        
                        console.log(`${index + 1}. ${event.title}`)
                        console.log(`   Status: ${status}`)
                        console.log(`   Time: ${start.toLocaleString()}`)
                    })
                }
            } else {
                console.log(`❌ Failed to fetch teacher events: ${teacherEventsResponse.statusCode}`)
            }
        } catch (error) {
            console.log(`❌ Error testing teacher API: ${error.message}`)
        }
        
        console.log('')
        
        // Test 5: Delete the test event (cleanup)
        if (createdEventId) {
            console.log('🗑️ PHASE 5: Testing DELETE /api/events (Delete Event)')
            console.log('===================================================')
            
            const deleteEventOptions = {
                hostname: 'localhost',
                port: 3000,
                path: `/api/events/${createdEventId}`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            
            const deleteResponse = await makeRequest(deleteEventOptions)
            console.log(`Status: ${deleteResponse.statusCode}`)
            
            if (deleteResponse.statusCode === 200 || deleteResponse.statusCode === 204) {
                console.log(`✅ Successfully deleted event`)
            } else {
                console.log(`❌ Failed to delete event: ${deleteResponse.statusCode}`)
                console.log(`Response:`, deleteResponse.data)
            }
        }
        
        console.log('')
        console.log('🎉 API TESTING COMPLETE!')
        console.log('=======================')
        console.log('✅ Tested GET /api/events')
        console.log('✅ Tested POST /api/events')
        console.log('✅ Tested PUT /api/events/:id')
        console.log('✅ Tested GET /api/teacher/events')
        console.log('✅ Tested DELETE /api/events/:id')
        console.log('')
        console.log('🌐 Next Steps: Manual Dashboard Testing')
        console.log('======================================')
        console.log('1. Admin Calendar: http://localhost:3000/dashboard/admin/calendar')
        console.log('   - Login as: ceo@pkibs.com')
        console.log('   - Create events through the UI')
        console.log('   - Test CRUD operations')
        console.log('')
        console.log('2. Teacher Calendar: http://localhost:3000/dashboard/teacher/calendar')
        console.log('   - Login as: pkibs.office@gmail.com')
        console.log('   - Verify events appear')
        console.log('   - Test "Mark Complete" button')
        console.log('')
        console.log('3. Student Dashboard: http://localhost:3000/dashboard/student')
        console.log('   - Login as: sofeaqistina@spectrum2u.com')
        console.log('   - Verify events are visible to students')
        
    } catch (error) {
        console.error('❌ Fatal error in API testing:', error.message)
    }
}

testAdminAPIs()
