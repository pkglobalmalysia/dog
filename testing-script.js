// COMPREHENSIVE TESTING SCRIPT
// Run this in the browser console to test functionality

console.log("🚀 Starting Comprehensive System Testing");

// Test Configuration
const TEST_CONFIG = {
    admin: {
        email: "ceo@pkibs.com",
        // Need to set password or use existing one
    },
    teacher: {
        email: "teacher@test.com", 
        name: "Test Teacher",
        password: "testpass123"
    },
    student: {
        email: "student@test.com",
        name: "Test Student", 
        password: "testpass123"
    },
    baseUrl: "http://localhost:3000"
};

// Test Results Storage
window.testResults = {
    admin: {},
    teacher: {},
    student: {},
    integration: {}
};

// Helper Functions
window.testHelper = {
    async apiCall(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (body) options.body = JSON.stringify(body);
            
            const response = await fetch(endpoint, options);
            const data = await response.json();
            
            return {
                success: response.ok,
                status: response.status,
                data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    logResult(phase, test, result) {
        console.log(`${result.success ? '✅' : '❌'} ${phase}: ${test}`, result);
        if (!window.testResults[phase]) window.testResults[phase] = {};
        window.testResults[phase][test] = result;
    },

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Phase 1: Admin Testing Functions
window.adminTests = {
    async testDatabaseSetup() {
        console.log("🗄️ Testing Database Setup");
        
        const result = await testHelper.apiCall('/api/setup-database', 'POST');
        testHelper.logResult('admin', 'database_setup', result);
        return result;
    },

    async testCourseCreation() {
        console.log("📚 Testing Course Creation");
        
        const courseData = {
            title: "Test Course Admin",
            description: "Course created by admin for testing",
            price: 100,
            teacher_id: null, // Will be assigned later
            scheduled_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        const result = await testHelper.apiCall('/api/courses', 'POST', courseData);
        testHelper.logResult('admin', 'course_creation', result);
        
        if (result.success) {
            window.testData = window.testData || {};
            window.testData.adminCourse = result.data;
        }
        
        return result;
    },

    async testEventCreation() {
        console.log("📅 Testing Event Creation");
        
        const eventData = {
            title: "Test Class Event",
            description: "Class event created by admin",
            event_type: "class",
            start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            teacher_id: null // Will be set when we have a teacher
        };
        
        const result = await testHelper.apiCall('/api/events', 'POST', eventData);
        testHelper.logResult('admin', 'event_creation', result);
        
        if (result.success) {
            window.testData = window.testData || {};
            window.testData.adminEvent = result.data;
        }
        
        return result;
    },

    async checkAdminAccess() {
        console.log("🔐 Testing Admin Access");
        
        const result = await testHelper.apiCall('/api/check-admin');
        testHelper.logResult('admin', 'admin_access', result);
        return result;
    },

    async runAllAdminTests() {
        console.log("👑 Starting Admin Tests");
        
        await this.checkAdminAccess();
        await testHelper.wait(500);
        
        await this.testDatabaseSetup();
        await testHelper.wait(500);
        
        await this.testCourseCreation();
        await testHelper.wait(500);
        
        await this.testEventCreation();
        await testHelper.wait(500);
        
        console.log("✅ Admin Tests Complete");
        return window.testResults.admin;
    }
};

// Phase 2: Teacher Testing Functions
window.teacherTests = {
    async testTeacherRegistration() {
        console.log("👨‍🏫 Testing Teacher Registration");
        
        // Teacher registration typically happens through signup
        // This would be tested through UI interaction
        testHelper.logResult('teacher', 'registration', { 
            success: true, 
            note: "Test through UI - /signup/teacher" 
        });
    },

    async testMarkComplete() {
        console.log("✅ Testing Mark Complete Function");
        
        if (!window.testData?.adminEvent) {
            testHelper.logResult('teacher', 'mark_complete', {
                success: false,
                error: "No admin event to mark complete"
            });
            return;
        }
        
        const result = await testHelper.apiCall('/api/teacher/mark-complete', 'POST', {
            calendar_event_id: window.testData.adminEvent.id
        });
        
        testHelper.logResult('teacher', 'mark_complete', result);
        return result;
    },

    async runAllTeacherTests() {
        console.log("👨‍🏫 Starting Teacher Tests");
        
        await this.testTeacherRegistration();
        await testHelper.wait(500);
        
        await this.testMarkComplete();
        await testHelper.wait(500);
        
        console.log("✅ Teacher Tests Complete");
        return window.testResults.teacher;
    }
};

// Phase 3: Student Testing Functions  
window.studentTests = {
    async testCourseEnrollment() {
        console.log("📝 Testing Course Enrollment");
        
        // This would typically require authentication
        // For now, just check if courses are visible
        const result = await testHelper.apiCall('/api/courses');
        testHelper.logResult('student', 'course_visibility', result);
        return result;
    },

    async testAssignmentSubmission() {
        console.log("📄 Testing Assignment Submission");
        
        const result = await testHelper.apiCall('/api/submit-assignment', 'POST', {
            assignment_title: "Test Assignment",
            submission_text: "Test submission content",
            student_name: "Test Student"
        });
        
        testHelper.logResult('student', 'assignment_submission', result);
        return result;
    },

    async runAllStudentTests() {
        console.log("👩‍🎓 Starting Student Tests");
        
        await this.testCourseEnrollment();
        await testHelper.wait(500);
        
        await this.testAssignmentSubmission();
        await testHelper.wait(500);
        
        console.log("✅ Student Tests Complete");
        return window.testResults.student;
    }
};

// Master Test Runner
window.runAllTests = async function() {
    console.log("🚀 STARTING COMPREHENSIVE TESTING");
    console.log("======================================");
    
    try {
        // Phase 1: Admin Tests
        console.log("\n📍 PHASE 1: ADMIN TESTING");
        await adminTests.runAllAdminTests();
        
        await testHelper.wait(1000);
        
        // Phase 2: Teacher Tests
        console.log("\n📍 PHASE 2: TEACHER TESTING");
        await teacherTests.runAllTeacherTests();
        
        await testHelper.wait(1000);
        
        // Phase 3: Student Tests
        console.log("\n📍 PHASE 3: STUDENT TESTING");
        await studentTests.runAllStudentTests();
        
        // Final Results
        console.log("\n🎯 FINAL TEST RESULTS:");
        console.log("=====================");
        console.table(window.testResults);
        
        return window.testResults;
        
    } catch (error) {
        console.error("❌ Testing failed:", error);
        return { error: error.message };
    }
};

console.log("✅ Testing script loaded!");
console.log("Run 'runAllTests()' to start comprehensive testing");
console.log("Or run individual phases:");
console.log("- adminTests.runAllAdminTests()");
console.log("- teacherTests.runAllTeacherTests()");  
console.log("- studentTests.runAllStudentTests()");
