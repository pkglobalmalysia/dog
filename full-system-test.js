// COMPREHENSIVE FEATURE TESTING - ALL SYSTEM CAPABILITIES
// Test all features discovered in the Learning Management System

class FullSystemTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.results = {};
        this.discoveredFeatures = [];
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (data) options.body = JSON.stringify(data);

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            let responseData;
            
            try {
                responseData = await response.json();
            } catch {
                responseData = await response.text();
            }

            return {
                success: response.ok,
                status: response.status,
                data: responseData,
                endpoint
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                endpoint
            };
        }
    }

    logTest(category, test, result) {
        if (!this.results[category]) this.results[category] = {};
        this.results[category][test] = result;
        
        const status = result.success ? '✅' : '❌';
        const details = result.error ? ` (${result.error})` : '';
        console.log(`${status} ${category}: ${test}${details}`);
        
        if (result.success && result.data) {
            this.discoveredFeatures.push({
                category,
                test,
                endpoint: result.endpoint,
                hasData: !!result.data
            });
        }
    }

    // TEST ALL COURSE FEATURES
    async testAllCourseFeatures() {
        console.log('\n📚 COMPREHENSIVE COURSE SYSTEM TESTING');
        console.log('=======================================');

        // Get all courses
        const courses = await this.makeRequest('/api/courses');
        this.logTest('Course System', 'List All Courses', courses);

        if (courses.success) {
            const courseData = courses.data.courses || courses.data;
            console.log(`   📊 Found ${courseData.length} courses`);
            
            // Analyze course structure
            if (courseData.length > 0) {
                const sampleCourse = courseData[0];
                console.log('   🔍 Course structure:', Object.keys(sampleCourse));
                
                // Test course creation with different configurations
                const testCourses = [
                    {
                        title: "API TEST - Basic Course",
                        description: "Testing basic course creation",
                        price: 100,
                        max_students: 20,
                        teacher_id: "03eef332-2c31-4b32-bae6-352f0c17c947",
                        scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        title: "API TEST - Advanced Course",
                        description: "Testing advanced course features",
                        price: 250,
                        max_students: 15,
                        teacher_id: "03eef332-2c31-4b32-bae6-352f0c17c947",
                        scheduled_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                        prerequisites: "Basic knowledge required",
                        materials: "Textbook included"
                    }
                ];

                for (let i = 0; i < testCourses.length; i++) {
                    const result = await this.makeRequest('/api/courses', 'POST', testCourses[i]);
                    this.logTest('Course System', `Create Course ${i + 1}`, result);
                }
            }
        }
    }

    // TEST ALL EVENT TYPES AND CALENDAR FEATURES  
    async testAllEventFeatures() {
        console.log('\n📅 COMPREHENSIVE EVENT SYSTEM TESTING');
        console.log('=====================================');

        // Get all events
        const events = await this.makeRequest('/api/events');
        this.logTest('Event System', 'List All Events', events);

        if (events.success) {
            const eventData = Array.isArray(events.data) ? events.data : events.data.events || [];
            console.log(`   📊 Found ${eventData.length} events`);

            // Analyze event types
            const eventTypes = {};
            eventData.forEach(event => {
                eventTypes[event.event_type] = (eventTypes[event.event_type] || 0) + 1;
            });
            console.log('   📈 Event type distribution:', eventTypes);

            // Test creating all event types
            const testEvents = [
                {
                    type: 'class',
                    title: "API TEST - Class Event",
                    description: "Should auto-create lecture",
                    teacher_id: "03eef332-2c31-4b32-bae6-352f0c17c947"
                },
                {
                    type: 'assignment',
                    title: "API TEST - Assignment Due",
                    description: "Assignment deadline event",
                    course_id: null
                },
                {
                    type: 'exam',
                    title: "API TEST - Final Exam",
                    description: "Comprehensive exam",
                    teacher_id: "03eef332-2c31-4b32-bae6-352f0c17c947"
                },
                {
                    type: 'payment',
                    title: "API TEST - Payment Due",
                    description: "Course fee payment",
                    payment_amount: 150
                },
                {
                    type: 'holiday',
                    title: "API TEST - Holiday",
                    description: "System holiday",
                    all_day: true
                },
                {
                    type: 'other',
                    title: "API TEST - Other Event",
                    description: "Custom event type"
                }
            ];

            for (const testEvent of testEvents) {
                const eventData = {
                    title: testEvent.title,
                    description: testEvent.description,
                    event_type: testEvent.type,
                    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                    teacher_id: testEvent.teacher_id || null,
                    course_id: testEvent.course_id || null,
                    payment_amount: testEvent.payment_amount || null,
                    all_day: testEvent.all_day || false
                };

                const result = await this.makeRequest('/api/events', 'POST', eventData);
                this.logTest('Event System', `Create ${testEvent.type} Event`, result);
            }

            // Test individual event operations
            if (eventData.length > 0) {
                const sampleEvent = eventData[0];
                
                // Test event retrieval
                const eventDetails = await this.makeRequest(`/api/events/${sampleEvent.id}`);
                this.logTest('Event System', 'Get Event Details', eventDetails);

                // Test event update
                const updateData = {
                    title: sampleEvent.title + " - UPDATED",
                    description: "Updated through API testing"
                };
                const eventUpdate = await this.makeRequest(`/api/events/${sampleEvent.id}`, 'PUT', updateData);
                this.logTest('Event System', 'Update Event', eventUpdate);
            }
        }
    }

    // TEST TEACHER FUNCTIONALITY
    async testTeacherFeatures() {
        console.log('\n👨‍🏫 COMPREHENSIVE TEACHER SYSTEM TESTING');
        console.log('==========================================');

        // Test mark complete functionality
        const events = await this.makeRequest('/api/events');
        if (events.success) {
            const eventData = Array.isArray(events.data) ? events.data : events.data.events || [];
            const classEvents = eventData.filter(e => e.event_type === 'class');
            
            if (classEvents.length > 0) {
                const testEvent = classEvents[0];
                
                const markCompleteData = {
                    calendar_event_id: testEvent.id,
                    completion_notes: "Completed through API testing",
                    attendance_count: 15
                };

                const markComplete = await this.makeRequest('/api/teacher/mark-complete', 'POST', markCompleteData);
                this.logTest('Teacher System', 'Mark Class Complete', markComplete);
            }
        }

        // Test other teacher endpoints
        const teacherEndpoints = [
            '/api/teacher/lectures',
            '/api/teacher/students', 
            '/api/teacher/attendance',
            '/api/teacher/salary'
        ];

        for (const endpoint of teacherEndpoints) {
            const result = await this.makeRequest(endpoint);
            this.logTest('Teacher System', `Access ${endpoint}`, result);
        }
    }

    // TEST STUDENT FUNCTIONALITY
    async testStudentFeatures() {
        console.log('\n🎓 COMPREHENSIVE STUDENT SYSTEM TESTING');
        console.log('=======================================');

        // Test assignment submission
        const submissionData = {
            assignment_title: "API Test Assignment",
            submission_text: "This is a comprehensive test submission through the API",
            student_name: "API Test Student",
            course_id: null,
            submission_date: new Date().toISOString()
        };

        const submission = await this.makeRequest('/api/submit-assignment', 'POST', submissionData);
        this.logTest('Student System', 'Submit Assignment', submission);

        // Test assignment retrieval
        const submissions = await this.makeRequest('/api/get-submissions');
        this.logTest('Student System', 'Get Submissions', submissions);

        // Test student enrollment
        const courses = await this.makeRequest('/api/courses');
        if (courses.success) {
            const courseData = courses.data.courses || courses.data;
            if (courseData.length > 0) {
                const enrollmentData = {
                    course_id: courseData[0].id,
                    student_email: "api-test-student@example.com"
                };

                const enrollment = await this.makeRequest('/api/enroll-student', 'POST', enrollmentData);
                this.logTest('Student System', 'Course Enrollment', enrollment);
            }
        }
    }

    // TEST ADMIN FUNCTIONALITY
    async testAdminFeatures() {
        console.log('\n🔧 COMPREHENSIVE ADMIN SYSTEM TESTING');
        console.log('=====================================');

        // Admin user check
        const adminCheck = await this.makeRequest('/api/check-admin');
        this.logTest('Admin System', 'Check Admin Users', adminCheck);

        // Database setup
        const dbSetup = await this.makeRequest('/api/setup-database', 'POST');
        this.logTest('Admin System', 'Database Setup', dbSetup);

        // Schema debugging
        const schemaDebug = await this.makeRequest('/api/debug-schema');
        this.logTest('Admin System', 'Debug Schema', schemaDebug);

        // Test database connection
        const dbTest = await this.makeRequest('/api/test-db');
        this.logTest('Admin System', 'Test Database', dbTest);

        // Admin approval endpoints
        const approvalEndpoints = [
            '/api/admin/approve-enrollment',
            '/api/admin/approve-class',
            '/api/admin/teacher-approvals',
            '/api/admin/salary-approvals'
        ];

        for (const endpoint of approvalEndpoints) {
            const result = await this.makeRequest(endpoint);
            this.logTest('Admin System', `Access ${endpoint}`, result);
        }
    }

    // DISCOVER ALL AVAILABLE FEATURES
    async discoverAllFeatures() {
        console.log('\n🔍 FEATURE DISCOVERY - FINDING ALL CAPABILITIES');
        console.log('===============================================');

        const potentialEndpoints = [
            // Authentication
            '/api/auth/signin', '/api/auth/signup', '/api/auth/signout', '/api/auth/callback',
            
            // Core Features
            '/api/courses', '/api/events', '/api/lectures', '/api/assignments',
            
            // User Management  
            '/api/users', '/api/profiles', '/api/teachers', '/api/students',
            
            // Academic
            '/api/enrollments', '/api/grades', '/api/attendance', '/api/submissions',
            
            // Administrative
            '/api/admin/dashboard', '/api/admin/reports', '/api/admin/settings',
            '/api/admin/users', '/api/admin/analytics',
            
            // Communication
            '/api/notifications', '/api/messages', '/api/announcements',
            
            // Financial
            '/api/payments', '/api/billing', '/api/invoices', '/api/salary',
            
            // System
            '/api/health', '/api/status', '/api/logs', '/api/backup'
        ];

        for (const endpoint of potentialEndpoints) {
            const result = await this.makeRequest(endpoint);
            
            if (result.status !== 404) {
                this.logTest('Feature Discovery', `Found: ${endpoint}`, {
                    success: true,
                    status: result.status,
                    requiresAuth: result.status === 401 || result.status === 403,
                    data: !!result.data
                });
            }
        }
    }

    // RUN ALL COMPREHENSIVE TESTS
    async runAllTests() {
        console.log('🚀 STARTING COMPREHENSIVE FULL SYSTEM TESTING');
        console.log('==============================================');

        const startTime = Date.now();

        try {
            await this.testAdminFeatures();
            await this.testAllCourseFeatures();
            await this.testAllEventFeatures();
            await this.testTeacherFeatures();
            await this.testStudentFeatures();
            await this.discoverAllFeatures();

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            console.log('\n🎯 COMPREHENSIVE TEST SUMMARY');
            console.log('==============================');
            console.log(`⏱️  Total time: ${duration} seconds`);

            // Calculate statistics
            let totalTests = 0;
            let passedTests = 0;
            
            Object.keys(this.results).forEach(category => {
                const categoryTests = Object.keys(this.results[category]);
                const categoryPassed = categoryTests.filter(test => this.results[category][test].success);
                
                console.log(`📊 ${category}: ${categoryPassed.length}/${categoryTests.length} passed`);
                
                totalTests += categoryTests.length;
                passedTests += categoryPassed.length;
            });

            console.log(`\n🎯 OVERALL: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);

            console.log('\n🔍 DISCOVERED FEATURES:');
            this.discoveredFeatures.forEach(feature => {
                console.log(`   ✅ ${feature.category}: ${feature.test}`);
            });

            console.log('\n📋 DETAILED RESULTS:');
            console.table(this.results);

            return {
                totalTests,
                passedTests,
                duration,
                results: this.results,
                features: this.discoveredFeatures
            };

        } catch (error) {
            console.error('❌ Comprehensive testing failed:', error);
            return { error: error.message };
        }
    }
}

// Usage
console.log('🧪 Full System Tester Loaded!');
console.log('Run: const tester = new FullSystemTester(); tester.runAllTests();');

// Auto-run in Node.js
if (typeof window === 'undefined' && require.main === module) {
    const tester = new FullSystemTester();
    tester.runAllTests().then(results => {
        console.log('✅ Full system testing complete!');
    }).catch(console.error);
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.FullSystemTester = FullSystemTester;
}
