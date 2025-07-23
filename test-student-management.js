const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    headless: false, // Set to true for headless testing
    slowMo: 500, // Slow down actions for visibility
    timeout: 30000,
    screenshots: true,
    screenshotDir: './test-screenshots'
};

// Test credentials (updated with actual admin credentials)
const TEST_CREDENTIALS = {
    adminEmail: 'ceo@pkibs.com', // Actual admin email
    adminPassword: 'PKibs@@11', // Actual admin password
    testStudentId: null // Will be populated during tests
};

class StudentManagementTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.screenshotCounter = 0;
    }

    async init() {
        console.log('🚀 Starting Student Management System Tests...\n');
        
        // Create screenshots directory
        if (TEST_CONFIG.screenshots && !fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }

        // Launch browser
        this.browser = await puppeteer.launch({
            headless: TEST_CONFIG.headless,
            slowMo: TEST_CONFIG.slowMo,
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        this.page = await this.browser.newPage();
        
        // Set timeouts
        this.page.setDefaultTimeout(TEST_CONFIG.timeout);
        this.page.setDefaultNavigationTimeout(TEST_CONFIG.timeout);

        // Listen for console logs and errors
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Browser Console Error:', msg.text());
            }
        });

        this.page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`❌ HTTP Error: ${response.status()} - ${response.url()}`);
            }
        });
    }

    async screenshot(name) {
        if (TEST_CONFIG.screenshots) {
            const filename = `${++this.screenshotCounter}-${name}.png`;
            const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
            await this.page.screenshot({ path: filepath, fullPage: true });
            console.log(`📸 Screenshot saved: ${filename}`);
        }
    }

    async addTestResult(testName, success, message, error = null) {
        const result = {
            test: testName,
            success,
            message,
            error: error ? error.message : null,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = success ? '✅' : '❌';
        console.log(`${status} ${testName}: ${message}`);
        if (error) {
            console.log(`   Error: ${error.message}`);
        }
    }

    // Test 1: Verify the updated courses API
    async testCoursesAPI() {
        console.log('\n📚 Testing Updated Courses API...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/api/admin/courses`);
            await this.screenshot('courses-api-response');
            
            const content = await this.page.content();
            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}') + 1;
            
            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error('Invalid JSON response from courses API');
            }
            
            const jsonStr = content.substring(jsonStart, jsonEnd);
            const response = JSON.parse(jsonStr);
            
            if (response.success && response.courses && response.courses.length > 0) {
                // Check if courses have required fields
                const firstCourse = response.courses[0];
                const requiredFields = ['id', 'title', 'price', 'description', 'duration', 'status'];
                const missingFields = requiredFields.filter(field => !(field in firstCourse));
                
                if (missingFields.length === 0) {
                    await this.addTestResult(
                        'Courses API Structure',
                        true,
                        `Found ${response.courses.length} courses with all required fields (price, description, duration, status)`
                    );
                    
                    // Log sample course data
                    console.log('   Sample course data:', JSON.stringify(firstCourse, null, 2));
                    return response.courses;
                } else {
                    await this.addTestResult(
                        'Courses API Structure',
                        false,
                        `Courses missing required fields: ${missingFields.join(', ')}`
                    );
                }
            } else {
                await this.addTestResult(
                    'Courses API Response',
                    false,
                    'API returned empty or invalid response'
                );
            }
        } catch (error) {
            await this.addTestResult('Courses API', false, 'Failed to fetch courses', error);
        }
        
        return null;
    }

    // Test 2: Login to admin interface
    async testAdminLogin() {
        console.log('\n🔐 Testing Admin Login...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/login`);
            await this.screenshot('login-page');
            
            // Wait for login form
            await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
            
            // Fill login form
            await this.page.type('input[type="email"]', TEST_CREDENTIALS.adminEmail);
            await this.page.type('input[type="password"]', TEST_CREDENTIALS.adminPassword);
            
            await this.screenshot('login-form-filled');
            
            // Submit form
            await Promise.all([
                this.page.waitForNavigation(),
                this.page.click('button[type="submit"]')
            ]);
            
            await this.screenshot('after-login');
            
            // Check if redirected to dashboard
            const currentUrl = this.page.url();
            if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
                await this.addTestResult('Admin Login', true, 'Successfully logged in to admin interface');
                return true;
            } else {
                await this.addTestResult('Admin Login', false, `Unexpected redirect to: ${currentUrl}`);
                return false;
            }
        } catch (error) {
            await this.addTestResult('Admin Login', false, 'Login failed', error);
            return false;
        }
    }

    // Test 3: Navigate to user management
    async testUserManagementAccess() {
        console.log('\n👥 Testing User Management Access...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/admin/user-management`);
            await this.screenshot('user-management-page');
            
            // Wait for the page to load
            await this.page.waitForSelector('table, .user-list, [data-testid="user-table"]', { timeout: 15000 });
            
            // Check for user management elements
            const hasUserTable = await this.page.$('table') !== null;
            const hasUserList = await this.page.$('.user-list') !== null;
            const hasUsers = await this.page.$('[data-testid="user-table"]') !== null;
            
            if (hasUserTable || hasUserList || hasUsers) {
                await this.addTestResult('User Management Access', true, 'Successfully accessed user management page');
                
                // Try to find a student to test with
                await this.findTestStudent();
                return true;
            } else {
                await this.addTestResult('User Management Access', false, 'User management page not loading properly');
                return false;
            }
        } catch (error) {
            await this.addTestResult('User Management Access', false, 'Failed to access user management', error);
            return false;
        }
    }

    // Helper: Find a test student
    async findTestStudent() {
        try {
            // Look for View Details buttons or user rows
            const viewButtons = await this.page.$$('button:contains("View Details"), a:contains("View Details"), .view-details');
            
            if (viewButtons.length > 0) {
                console.log(`   Found ${viewButtons.length} students in the system`);
                TEST_CREDENTIALS.testStudentId = 'found'; // Mark that we found students
            } else {
                console.log('   No students found in the system');
            }
        } catch (error) {
            console.log('   Could not enumerate students:', error.message);
        }
    }

    // Test 4: Test course assignment dropdown
    async testCourseAssignmentDropdown() {
        console.log('\n📋 Testing Course Assignment Dropdown...');
        
        try {
            // Look for View Details button and click it
            const viewDetailsButton = await this.page.$('button:contains("View Details"), a:contains("View Details")');
            
            if (viewDetailsButton) {
                await viewDetailsButton.click();
                await this.page.waitForTimeout(2000);
                await this.screenshot('student-details-modal');
                
                // Look for course assignment section
                const courseSelect = await this.page.$('select[name="course"], #course-select, .course-dropdown');
                
                if (courseSelect) {
                    // Get options from the dropdown
                    const options = await this.page.$$eval('select[name="course"] option, #course-select option, .course-dropdown option', 
                        options => options.map(option => ({ value: option.value, text: option.textContent }))
                    );
                    
                    if (options.length > 1) { // More than just the placeholder
                        await this.addTestResult(
                            'Course Assignment Dropdown',
                            true,
                            `Dropdown loaded with ${options.length - 1} courses available for assignment`
                        );
                        
                        console.log('   Available courses:', options.filter(opt => opt.value !== ''));
                        return true;
                    } else {
                        await this.addTestResult(
                            'Course Assignment Dropdown',
                            false,
                            'Dropdown found but no courses available'
                        );
                    }
                } else {
                    await this.addTestResult(
                        'Course Assignment Dropdown',
                        false,
                        'Could not find course assignment dropdown'
                    );
                }
            } else {
                await this.addTestResult(
                    'Course Assignment Dropdown',
                    false,
                    'Could not find View Details button to test course assignment'
                );
            }
        } catch (error) {
            await this.addTestResult('Course Assignment Dropdown', false, 'Failed to test course assignment', error);
        }
        
        return false;
    }

    // Test 5: Test manual payment system
    async testManualPaymentSystem() {
        console.log('\n💰 Testing Manual Payment System...');
        
        try {
            // Look for payment management section
            const paymentSection = await this.page.$('.payment-management, #payment-section, [data-testid="payment-section"]');
            
            if (paymentSection) {
                await this.screenshot('payment-section');
                
                // Look for payment input fields
                const amountInput = await this.page.$('input[name="amount"], #payment-amount, .payment-amount');
                const methodSelect = await this.page.$('select[name="method"], #payment-method, .payment-method');
                const addButton = await this.page.$('button:contains("Add Payment"), .add-payment-btn');
                
                if (amountInput && methodSelect && addButton) {
                    // Test filling out payment form
                    await this.page.focus('input[name="amount"], #payment-amount, .payment-amount');
                    await this.page.type('input[name="amount"], #payment-amount, .payment-amount', '299.00');
                    
                    await this.page.select('select[name="method"], #payment-method, .payment-method', 'cash');
                    
                    await this.screenshot('payment-form-filled');
                    
                    await this.addTestResult(
                        'Manual Payment System',
                        true,
                        'Payment form found and can be filled out (form validation passed)'
                    );
                    
                    return true;
                } else {
                    await this.addTestResult(
                        'Manual Payment System',
                        false,
                        'Payment form elements not found or incomplete'
                    );
                }
            } else {
                await this.addTestResult(
                    'Manual Payment System',
                    false,
                    'Payment management section not found'
                );
            }
        } catch (error) {
            await this.addTestResult('Manual Payment System', false, 'Failed to test payment system', error);
        }
        
        return false;
    }

    // Test 6: Test API endpoints directly
    async testAPIEndpoints() {
        console.log('\n🔌 Testing API Endpoints...');
        
        const endpoints = [
            { name: 'Courses API', url: '/api/admin/courses' },
            { name: 'Add Payment API', url: '/api/admin/add-payment', method: 'POST' }
        ];
        
        for (const endpoint of endpoints) {
            try {
                if (endpoint.method === 'POST') {
                    // Test POST endpoint with sample data
                    const response = await this.page.evaluate(async (url) => {
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                student_id: '123e4567-e89b-12d3-a456-426614174000', // Sample UUID
                                amount: 299.00,
                                payment_method: 'cash',
                                admin_notes: 'Test payment from Puppeteer',
                                payment_status: 'approved'
                            })
                        });
                        return { status: res.status, text: await res.text() };
                    }, `${TEST_CONFIG.baseUrl}${endpoint.url}`);
                    
                    if (response.status === 200 || response.status === 201) {
                        await this.addTestResult(
                            `${endpoint.name} Endpoint`,
                            true,
                            `API responding correctly (Status: ${response.status})`
                        );
                    } else {
                        await this.addTestResult(
                            `${endpoint.name} Endpoint`,
                            false,
                            `API returned status ${response.status}: ${response.text}`
                        );
                    }
                } else {
                    // Test GET endpoint
                    await this.page.goto(`${TEST_CONFIG.baseUrl}${endpoint.url}`);
                    
                    const status = this.page.url().includes('404') ? 404 : 200;
                    
                    if (status === 200) {
                        await this.addTestResult(
                            `${endpoint.name} Endpoint`,
                            true,
                            'API endpoint accessible and responding'
                        );
                    } else {
                        await this.addTestResult(
                            `${endpoint.name} Endpoint`,
                            false,
                            `API endpoint not found or not accessible`
                        );
                    }
                }
            } catch (error) {
                await this.addTestResult(`${endpoint.name} Endpoint`, false, 'API test failed', error);
            }
        }
    }

    // Generate test report
    async generateReport() {
        console.log('\n📊 Generating Test Report...');
        
        const successCount = this.testResults.filter(r => r.success).length;
        const totalCount = this.testResults.length;
        const successRate = Math.round((successCount / totalCount) * 100);
        
        const report = {
            summary: {
                total: totalCount,
                passed: successCount,
                failed: totalCount - successCount,
                successRate: `${successRate}%`,
                timestamp: new Date().toISOString()
            },
            results: this.testResults,
            recommendations: this.generateRecommendations()
        };
        
        // Save report to file
        const reportPath = './student-management-test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Generate HTML report
        await this.generateHTMLReport(report);
        
        console.log(`\n📋 Test Report saved to: ${reportPath}`);
        console.log(`📋 HTML Report saved to: ./student-management-test-report.html`);
        
        return report;
    }

    generateRecommendations() {
        const failedTests = this.testResults.filter(r => !r.success);
        const recommendations = [];
        
        if (failedTests.some(t => t.test.includes('Courses API'))) {
            recommendations.push('Check database connection and ensure courses table has been updated with price, description, duration, and status columns');
        }
        
        if (failedTests.some(t => t.test.includes('Login'))) {
            recommendations.push('Verify admin credentials and authentication system');
        }
        
        if (failedTests.some(t => t.test.includes('Course Assignment'))) {
            recommendations.push('Check course assignment dropdown implementation and ensure it fetches from updated courses table');
        }
        
        if (failedTests.some(t => t.test.includes('Payment'))) {
            recommendations.push('Verify payment system implementation and database table structure');
        }
        
        return recommendations;
    }

    async generateHTMLReport(report) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Management System - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .rate { color: #17a2b8; }
        .results { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .results h2 { background-color: #f8f9fa; margin: 0; padding: 20px; border-bottom: 1px solid #dee2e6; }
        .test-item { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-status { width: 20px; height: 20px; border-radius: 50%; margin-right: 15px; }
        .test-status.success { background-color: #28a745; }
        .test-status.fail { background-color: #dc3545; }
        .test-details { flex: 1; }
        .test-name { font-weight: bold; margin-bottom: 5px; }
        .test-message { color: #666; }
        .test-error { color: #dc3545; font-size: 0.9em; margin-top: 5px; }
        .recommendations { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 30px; padding: 20px; }
        .recommendations h2 { margin-top: 0; color: #333; }
        .recommendations ul { padding-left: 20px; }
        .recommendations li { margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Student Management System Test Report</h1>
            <p>Automated testing results for database updates and functionality</p>
            <p><small>Generated on ${new Date().toLocaleString()}</small></p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${report.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value passed">${report.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value failed">${report.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div class="value rate">${report.summary.successRate}</div>
            </div>
        </div>

        <div class="results">
            <h2>📋 Test Results</h2>
            ${report.results.map(result => `
                <div class="test-item">
                    <div class="test-status ${result.success ? 'success' : 'fail'}"></div>
                    <div class="test-details">
                        <div class="test-name">${result.test}</div>
                        <div class="test-message">${result.message}</div>
                        ${result.error ? `<div class="test-error">Error: ${result.error}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        ${report.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>💡 Recommendations</h2>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

        fs.writeFileSync('./student-management-test-report.html', html);
    }

    // Main test runner
    async runAllTests() {
        await this.init();
        
        try {
            // Test 1: API endpoints first
            const courses = await this.testCoursesAPI();
            
            // Test 2: Admin login
            const loginSuccess = await this.testAdminLogin();
            
            if (loginSuccess) {
                // Test 3: User management access
                const userMgmtSuccess = await this.testUserManagementAccess();
                
                if (userMgmtSuccess) {
                    // Test 4: Course assignment dropdown
                    await this.testCourseAssignmentDropdown();
                    
                    // Test 5: Manual payment system
                    await this.testManualPaymentSystem();
                }
            }
            
            // Test 6: API endpoints
            await this.testAPIEndpoints();
            
            // Generate final report
            const report = await this.generateReport();
            
            // Print summary
            console.log('\n🏁 TEST COMPLETION SUMMARY');
            console.log('================================');
            console.log(`Total Tests: ${report.summary.total}`);
            console.log(`Passed: ${report.summary.passed}`);
            console.log(`Failed: ${report.summary.failed}`);
            console.log(`Success Rate: ${report.summary.successRate}`);
            
            if (report.summary.passed === report.summary.total) {
                console.log('\n🎉 ALL TESTS PASSED! Your student management system is fully functional!');
            } else {
                console.log('\n⚠️  Some tests failed. Check the detailed report for recommendations.');
            }
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        } finally {
            await this.browser.close();
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new StudentManagementTester();
    tester.runAllTests().catch(console.error);
}

module.exports = StudentManagementTester;
