// COMPREHENSIVE TEACHER TESTING SCRIPT
// Tests ALL teacher features with actual teacher authentication

class TeacherSystemTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.teacherCredentials = {
            email: 'pkibs.office@gmail.com',
            password: 'teachersophie'
        };
        this.sessionCookies = null;
        this.results = {};
        this.teacherId = null;
    }

    async authenticateTeacher() {
        console.log('🔐 AUTHENTICATING TEACHER...');
        console.log('Email:', this.teacherCredentials.email);
        
        try {
            // Test login endpoint
            const loginResponse = await fetch(`${this.baseUrl}/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.teacherCredentials),
                credentials: 'include'
            });

            const loginData = await loginResponse.json();
            console.log('🔍 Login Response:', {
                status: loginResponse.status,
                ok: loginResponse.ok,
                headers: Object.fromEntries(loginResponse.headers.entries()),
                data: loginData
            });

            if (loginResponse.ok) {
                // Extract session cookies
                const setCookieHeader = loginResponse.headers.get('set-cookie');
                if (setCookieHeader) {
                    this.sessionCookies = setCookieHeader;
                }
                
                this.teacherId = loginData.user?.id || loginData.teacher_id;
                console.log('✅ Teacher authentication successful!');
                console.log('👨‍🏫 Teacher ID:', this.teacherId);
                return true;
            } else {
                console.log('❌ Teacher authentication failed');
                return false;
            }
        } catch (error) {
            console.log('❌ Authentication error:', error.message);
            return false;
        }
    }

    async makeAuthenticatedRequest(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        };

        if (this.sessionCookies) {
            options.headers['Cookie'] = this.sessionCookies;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
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
        const statusCode = result.status ? `[${result.status}]` : '';
        const details = result.error ? ` (${result.error})` : '';
        
        console.log(`${status} ${statusCode} ${category}: ${test}${details}`);
        
        if (result.success && result.data) {
            console.log(`   📊 Data preview:`, typeof result.data === 'object' ? 
                Object.keys(result.data) : 
                result.data.toString().substring(0, 100));
        }
    }

    // TEST TEACHER DASHBOARD ACCESS
    async testTeacherDashboard() {
        console.log('\n📊 TESTING TEACHER DASHBOARD ACCESS');
        console.log('==================================');

        const dashboardEndpoints = [
            '/api/teacher/dashboard',
            '/api/teacher/profile',
            '/api/teacher/stats',
            '/api/teacher/overview'
        ];

        for (const endpoint of dashboardEndpoints) {
            const result = await this.makeAuthenticatedRequest(endpoint);
            this.logTest('Dashboard Access', `GET ${endpoint}`, result);
        }
    }

    // TEST COURSE MANAGEMENT
    async testCourseManagement() {
        console.log('\n📚 TESTING COURSE MANAGEMENT');
        console.log('============================');

        // Get teacher's assigned courses
        const courses = await this.makeAuthenticatedRequest('/api/teacher/courses');
        this.logTest('Course Management', 'Get Assigned Courses', courses);

        if (courses.success && courses.data) {
            const courseData = Array.isArray(courses.data) ? courses.data : courses.data.courses || [];
            console.log(`   📋 Found ${courseData.length} assigned courses`);

            if (courseData.length > 0) {
                const sampleCourse = courseData[0];
                console.log('   🔍 Course structure:', Object.keys(sampleCourse));

                // Test course details
                const courseDetails = await this.makeAuthenticatedRequest(`/api/courses/${sampleCourse.id}`);
                this.logTest('Course Management', 'Get Course Details', courseDetails);

                // Test course students
                const courseStudents = await this.makeAuthenticatedRequest(`/api/teacher/courses/${sampleCourse.id}/students`);
                this.logTest('Course Management', 'Get Course Students', courseStudents);
            }
        }
    }

    // TEST CALENDAR AND EVENTS
    async testCalendarAndEvents() {
        console.log('\n📅 TESTING CALENDAR & EVENTS (CRITICAL)');
        console.log('=======================================');

        // Get teacher's calendar events
        const events = await this.makeAuthenticatedRequest('/api/teacher/events');
        this.logTest('Calendar System', 'Get Teacher Events', events);

        // Get all events (should include admin-created ones)
        const allEvents = await this.makeAuthenticatedRequest('/api/events');
        this.logTest('Calendar System', 'Get All Events', allEvents);

        if (allEvents.success && allEvents.data) {
            const eventData = Array.isArray(allEvents.data) ? allEvents.data : allEvents.data.events || [];
            console.log(`   📊 Found ${eventData.length} total events`);

            // Filter events by type
            const eventTypes = {};
            const teacherEvents = [];
            
            eventData.forEach(event => {
                eventTypes[event.event_type] = (eventTypes[event.event_type] || 0) + 1;
                
                // Check if this is teacher's event or admin-created
                if (event.teacher_id === this.teacherId || !event.teacher_id) {
                    teacherEvents.push(event);
                }
            });

            console.log('   📈 Event type distribution:', eventTypes);
            console.log(`   👨‍🏫 Teacher-relevant events: ${teacherEvents.length}`);

            // Test mark complete on various event types
            await this.testMarkCompleteFeature(teacherEvents);
        }
    }

    // TEST MARK COMPLETE FUNCTIONALITY (CRITICAL)
    async testMarkCompleteFeature(events) {
        console.log('\n✅ TESTING MARK COMPLETE (CRITICAL FEATURE)');
        console.log('===========================================');

        const classEvents = events.filter(e => e.event_type === 'class');
        const assignmentEvents = events.filter(e => e.event_type === 'assignment');
        const examEvents = events.filter(e => e.event_type === 'exam');

        console.log(`   📋 Found: ${classEvents.length} classes, ${assignmentEvents.length} assignments, ${examEvents.length} exams`);

        // Test mark complete for different event types
        const testEvents = [
            { events: classEvents, type: 'Class' },
            { events: assignmentEvents, type: 'Assignment' },
            { events: examEvents, type: 'Exam' }
        ];

        for (const eventGroup of testEvents) {
            if (eventGroup.events.length > 0) {
                const testEvent = eventGroup.events[0];
                
                const markCompleteData = {
                    calendar_event_id: testEvent.id,
                    completion_notes: `${eventGroup.type} completed through teacher testing - ${new Date().toISOString()}`,
                    attendance_count: 12,
                    performance_rating: 4
                };

                const result = await this.makeAuthenticatedRequest('/api/teacher/mark-complete', 'POST', markCompleteData);
                this.logTest('Mark Complete', `Mark ${eventGroup.type} Complete`, result);

                // Also test the event completion endpoint
                const completeResult = await this.makeAuthenticatedRequest(`/api/events/${testEvent.id}/complete`, 'POST', markCompleteData);
                this.logTest('Mark Complete', `Complete ${eventGroup.type} Event`, completeResult);
            }
        }
    }

    // TEST ASSIGNMENT MANAGEMENT
    async testAssignmentManagement() {
        console.log('\n📝 TESTING ASSIGNMENT MANAGEMENT');
        console.log('================================');

        // Get assignments
        const assignments = await this.makeAuthenticatedRequest('/api/teacher/assignments');
        this.logTest('Assignment System', 'Get Teacher Assignments', assignments);

        // Create test assignment
        const assignmentData = {
            title: 'Teacher Testing Assignment',
            description: 'Created through comprehensive teacher testing',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            course_id: null,
            teacher_id: this.teacherId,
            max_points: 100,
            instructions: 'Complete this assignment for testing purposes'
        };

        const createAssignment = await this.makeAuthenticatedRequest('/api/teacher/assignments', 'POST', assignmentData);
        this.logTest('Assignment System', 'Create New Assignment', createAssignment);

        // Get assignment submissions
        const submissions = await this.makeAuthenticatedRequest('/api/teacher/submissions');
        this.logTest('Assignment System', 'Get Assignment Submissions', submissions);
    }

    // TEST STUDENT MANAGEMENT
    async testStudentManagement() {
        console.log('\n👥 TESTING STUDENT MANAGEMENT');
        console.log('=============================');

        // Get teacher's students
        const students = await this.makeAuthenticatedRequest('/api/teacher/students');
        this.logTest('Student Management', 'Get Teacher Students', students);

        // Get student progress
        const progress = await this.makeAuthenticatedRequest('/api/teacher/student-progress');
        this.logTest('Student Management', 'Get Student Progress', progress);

        // Test attendance management
        const attendance = await this.makeAuthenticatedRequest('/api/teacher/attendance');
        this.logTest('Student Management', 'Get Attendance Data', attendance);
    }

    // TEST GRADING SYSTEM
    async testGradingSystem() {
        console.log('\n📊 TESTING GRADING SYSTEM');
        console.log('=========================');

        // Get gradebook
        const grades = await this.makeAuthenticatedRequest('/api/teacher/grades');
        this.logTest('Grading System', 'Get Teacher Gradebook', grades);

        // Test grade submission
        const gradeData = {
            student_id: 'test-student-id',
            assignment_id: 'test-assignment-id',
            points_earned: 85,
            max_points: 100,
            feedback: 'Good work, comprehensive teacher testing feedback',
            graded_by: this.teacherId
        };

        const gradeSubmission = await this.makeAuthenticatedRequest('/api/teacher/grades', 'POST', gradeData);
        this.logTest('Grading System', 'Submit Grade', gradeSubmission);
    }

    // TEST SALARY AND PAYMENTS
    async testSalarySystem() {
        console.log('\n💰 TESTING SALARY SYSTEM');
        console.log('========================');

        // Get salary information
        const salary = await this.makeAuthenticatedRequest('/api/teacher/salary');
        this.logTest('Salary System', 'Get Salary Information', salary);

        // Get payment history
        const payments = await this.makeAuthenticatedRequest('/api/teacher/payments');
        this.logTest('Salary System', 'Get Payment History', payments);

        // Get completed classes (for salary calculation)
        const completed = await this.makeAuthenticatedRequest('/api/teacher/completed-classes');
        this.logTest('Salary System', 'Get Completed Classes', completed);
    }

    // TEST COMMUNICATION FEATURES
    async testCommunicationFeatures() {
        console.log('\n📞 TESTING COMMUNICATION FEATURES');
        console.log('=================================');

        // Get messages
        const messages = await this.makeAuthenticatedRequest('/api/teacher/messages');
        this.logTest('Communication', 'Get Teacher Messages', messages);

        // Get notifications
        const notifications = await this.makeAuthenticatedRequest('/api/teacher/notifications');
        this.logTest('Communication', 'Get Notifications', notifications);

        // Test sending announcement
        const announcementData = {
            title: 'Teacher Testing Announcement',
            message: 'This is a comprehensive test announcement from teacher testing',
            target_audience: 'students',
            course_id: null
        };

        const announcement = await this.makeAuthenticatedRequest('/api/teacher/announcements', 'POST', announcementData);
        this.logTest('Communication', 'Send Announcement', announcement);
    }

    // RUN ALL TEACHER TESTS
    async runAllTeacherTests() {
        console.log('🚀 STARTING COMPREHENSIVE TEACHER TESTING');
        console.log('==========================================');
        console.log('👨‍🏫 Teacher Account:', this.teacherCredentials.email);
        console.log('📅 Test Date:', new Date().toISOString());

        const startTime = Date.now();

        // Step 1: Authenticate
        const authSuccess = await this.authenticateTeacher();
        if (!authSuccess) {
            console.log('❌ Cannot proceed without authentication');
            return { error: 'Authentication failed' };
        }

        // Step 2: Run all tests
        try {
            await this.testTeacherDashboard();
            await this.testCourseManagement();
            await this.testCalendarAndEvents();
            await this.testAssignmentManagement();
            await this.testStudentManagement();
            await this.testGradingSystem();
            await this.testSalarySystem();
            await this.testCommunicationFeatures();

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            console.log('\n🎯 TEACHER TESTING SUMMARY');
            console.log('===========================');
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

            console.log('\n📋 CRITICAL FEATURES STATUS:');
            if (this.results['Calendar System']) {
                console.log('   📅 Calendar Integration:', this.results['Calendar System']['Get All Events']?.success ? '✅' : '❌');
            }
            if (this.results['Mark Complete']) {
                const markCompleteTests = Object.keys(this.results['Mark Complete']);
                const markCompletePassed = markCompleteTests.filter(test => this.results['Mark Complete'][test].success);
                console.log(`   ✅ Mark Complete System: ${markCompletePassed.length}/${markCompleteTests.length} working`);
            }

            return {
                totalTests,
                passedTests,
                duration,
                results: this.results,
                teacherId: this.teacherId
            };

        } catch (error) {
            console.error('❌ Teacher testing failed:', error);
            return { error: error.message };
        }
    }
}

// Usage and auto-execution
console.log('👨‍🏫 Teacher System Tester Loaded!');
console.log('Credentials: pkibs.office@gmail.com / teachersophie');
console.log('Run: const tester = new TeacherSystemTester(); tester.runAllTeacherTests();');

// Auto-run in Node.js
if (typeof window === 'undefined' && require.main === module) {
    const tester = new TeacherSystemTester();
    tester.runAllTeacherTests().then(results => {
        console.log('✅ Teacher testing complete!');
        console.log('📊 Results:', results);
    }).catch(console.error);
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.TeacherSystemTester = TeacherSystemTester;
}
