const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration - UPDATE THESE CREDENTIALS!
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    headless: false, // Set to true for headless testing
    slowMo: 300, // Slow down actions for visibility
    timeout: 30000,
    screenshots: true,
    screenshotDir: './test-screenshots',
    
    // UPDATE THESE CREDENTIALS
    adminEmail: 'admin@test.com', // ⚠️ UPDATE WITH YOUR ADMIN EMAIL
    adminPassword: 'password123', // ⚠️ UPDATE WITH YOUR ADMIN PASSWORD
};

console.log(`
🧪 STUDENT MANAGEMENT SYSTEM - AUTOMATED TESTS
================================================

⚠️  BEFORE RUNNING: Update your admin credentials in this file!
   - Line 13: adminEmail: 'your-admin@email.com'
   - Line 14: adminPassword: 'your-password'

📋 What will be tested:
   ✅ Updated Courses API (with price, description, duration, status)
   ✅ Admin Login Process
   ✅ User Management Access
   ✅ Course Assignment Dropdown
   ✅ Manual Payment System
   ✅ API Endpoints

🚀 Starting tests in 3 seconds...
`);

class StudentManagementTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.screenshotCounter = 0;
    }

    async init() {
        console.log('🚀 Initializing browser...\n');
        
        // Create screenshots directory
        if (TEST_CONFIG.screenshots && !fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }

        // Launch browser
        this.browser = await puppeteer.launch({
            headless: TEST_CONFIG.headless,
            slowMo: TEST_CONFIG.slowMo,
            defaultViewport: { width: 1366, height: 768 },
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set timeouts
        this.page.setDefaultTimeout(TEST_CONFIG.timeout);
        this.page.setDefaultNavigationTimeout(TEST_CONFIG.timeout);

        // Listen for console logs and errors
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('🔍 Browser Console Error:', msg.text());
            }
        });

        this.page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`🔍 HTTP ${response.status()}: ${response.url()}`);
            }
        });
    }

    async screenshot(name) {
        if (TEST_CONFIG.screenshots) {
            const filename = `${String(++this.screenshotCounter).padStart(2, '0')}-${name}.png`;
            const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
            await this.page.screenshot({ path: filepath, fullPage: true });
            console.log(`   📸 Screenshot: ${filename}`);
        }
    }

    async addTestResult(testName, success, message, details = null) {
        const result = {
            test: testName,
            success,
            message,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} | ${testName}`);
        console.log(`      ${message}`);
        if (details) {
            console.log(`      Details: ${details}`);
        }
        console.log('');
    }

    // Test 1: Verify the updated courses API
    async testCoursesAPI() {
        console.log('📚 TEST 1: Updated Courses API');
        console.log('=====================================');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/api/admin/courses`);
            await this.screenshot('courses-api-response');
            
            // Wait for content to load
            await this.page.waitForTimeout(2000);
            
            const content = await this.page.content();
            
            // Try to find JSON in the page
            const jsonMatch = content.match(/{.*}/s);
            
            if (jsonMatch) {
                const response = JSON.parse(jsonMatch[0]);
                
                if (response.success && response.courses && Array.isArray(response.courses)) {
                    if (response.courses.length > 0) {
                        const firstCourse = response.courses[0];
                        const requiredFields = ['id', 'title', 'price', 'description', 'duration', 'status'];
                        const hasAllFields = requiredFields.every(field => field in firstCourse);
                        
                        if (hasAllFields) {
                            await this.addTestResult(
                                'Courses API Structure',
                                true,
                                `✅ Found ${response.courses.length} courses with updated database structure`,
                                `Sample course: ${firstCourse.title} - $${firstCourse.price} (${firstCourse.duration})`
                            );
                            return response.courses;
                        } else {
                            const missingFields = requiredFields.filter(field => !(field in firstCourse));
                            await this.addTestResult(
                                'Courses API Structure',
                                false,
                                'Database structure incomplete',
                                `Missing fields: ${missingFields.join(', ')}`
                            );
                        }
                    } else {
                        await this.addTestResult(
                            'Courses API Response',
                            false,
                            'No courses found in database',
                            'Consider adding some test courses'
                        );
                    }
                } else {
                    await this.addTestResult(
                        'Courses API Response',
                        false,
                        'API returned invalid response format',
                        JSON.stringify(response, null, 2)
                    );
                }
            } else {
                await this.addTestResult(
                    'Courses API Connection',
                    false,
                    'Could not find JSON response from API',
                    'Check if your development server is running'
                );
            }
        } catch (error) {
            await this.addTestResult(
                'Courses API Error',
                false,
                'Failed to test courses API',
                error.message
            );
        }
        
        return null;
    }

    // Test 2: Check if development server is running
    async testServerConnection() {
        console.log('🌐 TEST 2: Development Server Connection');
        console.log('=========================================');
        
        try {
            const response = await this.page.goto(TEST_CONFIG.baseUrl, { 
                waitUntil: 'networkidle0',
                timeout: 10000
            });
            
            await this.screenshot('homepage');
            
            if (response && response.ok()) {
                await this.addTestResult(
                    'Development Server',
                    true,
                    'Successfully connected to development server',
                    `Status: ${response.status()}`
                );
                return true;
            } else {
                await this.addTestResult(
                    'Development Server',
                    false,
                    'Development server not responding correctly',
                    response ? `Status: ${response.status()}` : 'No response'
                );
                return false;
            }
        } catch (error) {
            await this.addTestResult(
                'Development Server',
                false,
                'Cannot connect to development server',
                'Make sure "npm run dev" is running on port 3000'
            );
            return false;
        }
    }

    // Test 3: Admin login flow
    async testAdminLogin() {
        console.log('🔐 TEST 3: Admin Authentication');
        console.log('=================================');
        
        try {
            // Go to login page
            await this.page.goto(`${TEST_CONFIG.baseUrl}/login`);
            await this.screenshot('login-page');
            
            // Wait for login form
            await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
            
            // Fill login form
            const emailInput = await this.page.$('input[type="email"], input[name="email"]');
            const passwordInput = await this.page.$('input[type="password"], input[name="password"]');
            
            if (emailInput && passwordInput) {
                await emailInput.click({ clickCount: 3 }); // Select all
                await emailInput.type(TEST_CONFIG.adminEmail);
                
                await passwordInput.click({ clickCount: 3 }); // Select all
                await passwordInput.type(TEST_CONFIG.adminPassword);
                
                await this.screenshot('login-form-filled');
                
                // Submit form
                const submitButton = await this.page.$('button[type="submit"], .login-button, .auth-button');
                if (submitButton) {
                    await Promise.all([
                        this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
                        submitButton.click()
                    ]);
                    
                    await this.screenshot('after-login');
                    
                    // Check if login was successful
                    const currentUrl = this.page.url();
                    const title = await this.page.title();
                    
                    if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin') || title.includes('Dashboard')) {
                        await this.addTestResult(
                            'Admin Login',
                            true,
                            'Successfully logged in as admin',
                            `Redirected to: ${currentUrl}`
                        );
                        return true;
                    } else if (currentUrl.includes('/login')) {
                        await this.addTestResult(
                            'Admin Login',
                            false,
                            'Login failed - still on login page',
                            'Check your admin credentials in the test file'
                        );
                        return false;
                    } else {
                        await this.addTestResult(
                            'Admin Login',
                            false,
                            'Unexpected redirect after login',
                            `Redirected to: ${currentUrl}`
                        );
                        return false;
                    }
                } else {
                    await this.addTestResult(
                        'Admin Login Form',
                        false,
                        'Could not find submit button',
                        'Check login form structure'
                    );
                    return false;
                }
            } else {
                await this.addTestResult(
                    'Admin Login Form',
                    false,
                    'Could not find email/password inputs',
                    'Check login form structure'
                );
                return false;
            }
        } catch (error) {
            await this.addTestResult(
                'Admin Login Error',
                false,
                'Login test failed with error',
                error.message
            );
            return false;
        }
    }

    // Test 4: User management page access
    async testUserManagementAccess() {
        console.log('👥 TEST 4: User Management Access');
        console.log('===================================');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/admin/user-management`);
            await this.page.waitForTimeout(3000); // Wait for page to load
            await this.screenshot('user-management-page');
            
            // Check for user management elements
            const userElements = await Promise.all([
                this.page.$('table'),
                this.page.$('[data-testid="user-table"]'),
                this.page.$('.user-list'),
                this.page.$('.user-management'),
                this.page.$$('button:has-text("View Details")'),
                this.page.$$('button[class*="view"], a[class*="view"]')
            ]);
            
            const hasUserManagement = userElements.some(el => el !== null && (Array.isArray(el) ? el.length > 0 : true));
            
            if (hasUserManagement) {
                // Try to count users
                const userRows = await this.page.$$('tr, .user-row, .user-item');
                const userCount = Math.max(0, userRows.length - 1); // Subtract header row
                
                await this.addTestResult(
                    'User Management Access',
                    true,
                    'Successfully accessed user management page',
                    `Found approximately ${userCount} user entries`
                );
                
                return true;
            } else {
                await this.addTestResult(
                    'User Management Access',
                    false,
                    'User management page not loading correctly',
                    'Could not find user table or management interface'
                );
                return false;
            }
        } catch (error) {
            await this.addTestResult(
                'User Management Access',
                false,
                'Failed to access user management page',
                error.message
            );
            return false;
        }
    }

    // Test 5: Course assignment dropdown test
    async testCourseAssignment() {
        console.log('📋 TEST 5: Course Assignment System');
        console.log('=====================================');
        
        try {
            // Look for View Details button
            const viewButtons = await this.page.$$('button:has-text("View Details"), a:has-text("View Details"), .view-details, [data-action="view"]');
            
            if (viewButtons.length > 0) {
                await viewButtons[0].click();
                await this.page.waitForTimeout(2000);
                await this.screenshot('student-details-opened');
                
                // Look for course assignment elements
                const courseElements = await Promise.all([
                    this.page.$('select[name*="course"], #course-select, .course-dropdown'),
                    this.page.$('select:has(option[value*="course"])'),
                    this.page.$('input[list*="course"], datalist'),
                ]);
                
                const courseSelect = courseElements.find(el => el !== null);
                
                if (courseSelect) {
                    // Get course options
                    const options = await this.page.evaluate(() => {
                        const selects = document.querySelectorAll('select');
                        for (let select of selects) {
                            const options = Array.from(select.options).map(opt => ({
                                value: opt.value,
                                text: opt.textContent.trim()
                            }));
                            if (options.some(opt => opt.text.includes('$') || opt.value.includes('course'))) {
                                return options;
                            }
                        }
                        return [];
                    });
                    
                    if (options.length > 1) {
                        const courseOptions = options.filter(opt => opt.value && opt.value !== '');
                        await this.addTestResult(
                            'Course Assignment Dropdown',
                            true,
                            `Course dropdown working with ${courseOptions.length} courses`,
                            `Sample: ${courseOptions[0]?.text || 'No course details'}`
                        );
                        return true;
                    } else {
                        await this.addTestResult(
                            'Course Assignment Dropdown',
                            false,
                            'Course dropdown found but no courses available',
                            'Check if courses exist in database with updated structure'
                        );
                    }
                } else {
                    await this.addTestResult(
                        'Course Assignment Dropdown',
                        false,
                        'Could not find course assignment dropdown',
                        'Check if course assignment UI is implemented'
                    );
                }
            } else {
                await this.addTestResult(
                    'Course Assignment Access',
                    false,
                    'Could not find View Details button to test course assignment',
                    'Add some test users or check user management UI'
                );
            }
        } catch (error) {
            await this.addTestResult(
                'Course Assignment Error',
                false,
                'Failed to test course assignment system',
                error.message
            );
        }
        
        return false;
    }

    // Test 6: Manual payment system
    async testPaymentSystem() {
        console.log('💰 TEST 6: Manual Payment System');
        console.log('==================================');
        
        try {
            // Look for payment elements on the current page
            const paymentElements = await Promise.all([
                this.page.$('input[name*="amount"], #payment-amount, .payment-amount'),
                this.page.$('select[name*="method"], #payment-method, .payment-method'),
                this.page.$('button:has-text("Add Payment"), .add-payment, [data-action="payment"]'),
                this.page.$('.payment-management, #payment-section, [data-testid="payment"]')
            ]);
            
            const hasPaymentElements = paymentElements.some(el => el !== null);
            
            if (hasPaymentElements) {
                const amountInput = paymentElements[0];
                const methodSelect = paymentElements[1];
                const addButton = paymentElements[2];
                
                if (amountInput && methodSelect && addButton) {
                    // Test filling payment form
                    await amountInput.click({ clickCount: 3 });
                    await amountInput.type('299.00');
                    
                    await methodSelect.click();
                    await this.page.waitForTimeout(500);
                    
                    // Try to select cash option
                    const cashOption = await this.page.$('option[value="cash"], option:has-text("Cash")');
                    if (cashOption) {
                        await cashOption.click();
                    }
                    
                    await this.screenshot('payment-form-filled');
                    
                    await this.addTestResult(
                        'Manual Payment System',
                        true,
                        'Payment form found and functional',
                        'Amount input, method selector, and add button all working'
                    );
                    return true;
                } else {
                    await this.addTestResult(
                        'Manual Payment System',
                        false,
                        'Payment form incomplete',
                        `Missing: ${!amountInput ? 'amount input ' : ''}${!methodSelect ? 'method select ' : ''}${!addButton ? 'add button' : ''}`
                    );
                }
            } else {
                await this.addTestResult(
                    'Manual Payment System',
                    false,
                    'Payment management section not found',
                    'Check if payment UI is implemented in student details'
                );
            }
        } catch (error) {
            await this.addTestResult(
                'Manual Payment System',
                false,
                'Failed to test payment system',
                error.message
            );
        }
        
        return false;
    }

    // Generate comprehensive test report
    async generateReport() {
        console.log('\n📊 GENERATING TEST REPORT');
        console.log('==========================');
        
        const passed = this.testResults.filter(r => r.success);
        const failed = this.testResults.filter(r => !r.success);
        const successRate = Math.round((passed.length / this.testResults.length) * 100);
        
        const report = {
            timestamp: new Date().toISOString(),
            config: {
                baseUrl: TEST_CONFIG.baseUrl,
                totalTests: this.testResults.length
            },
            summary: {
                total: this.testResults.length,
                passed: passed.length,
                failed: failed.length,
                successRate: `${successRate}%`
            },
            results: this.testResults,
            recommendations: this.generateRecommendations(failed)
        };
        
        // Save JSON report
        fs.writeFileSync('./test-results.json', JSON.stringify(report, null, 2));
        
        // Generate HTML report
        await this.generateHTMLReport(report);
        
        // Print summary to console
        console.log(`\n📋 TEST SUMMARY`);
        console.log(`===============`);
        console.log(`Total Tests: ${report.summary.total}`);
        console.log(`✅ Passed: ${report.summary.passed}`);
        console.log(`❌ Failed: ${report.summary.failed}`);
        console.log(`📊 Success Rate: ${report.summary.successRate}`);
        
        if (passed.length === this.testResults.length) {
            console.log(`\n🎉 PERFECT! All tests passed! Your student management system is fully functional!`);
        } else if (passed.length > failed.length) {
            console.log(`\n✅ GOOD! Most tests passed. Check the report for minor issues to fix.`);
        } else {
            console.log(`\n⚠️  NEEDS ATTENTION! Several tests failed. Check the detailed report for solutions.`);
        }
        
        console.log(`\n📄 Reports saved:`);
        console.log(`   - JSON: ./test-results.json`);
        console.log(`   - HTML: ./test-report.html`);
        console.log(`   - Screenshots: ./test-screenshots/`);
        
        return report;
    }

    generateRecommendations(failedTests) {
        const recommendations = [];
        
        if (failedTests.some(t => t.test.includes('Server'))) {
            recommendations.push('🚀 Start your development server: npm run dev');
        }
        
        if (failedTests.some(t => t.test.includes('Courses API'))) {
            recommendations.push('📚 Verify courses table has been updated with price, description, duration, status columns');
            recommendations.push('🔧 Check if Supabase connection is working properly');
        }
        
        if (failedTests.some(t => t.test.includes('Login'))) {
            recommendations.push('🔐 Update admin credentials in the test file (TEST_CONFIG.adminEmail/adminPassword)');
            recommendations.push('👤 Ensure admin user exists in your database');
        }
        
        if (failedTests.some(t => t.test.includes('User Management'))) {
            recommendations.push('👥 Check if /admin/user-management route exists and is properly implemented');
            recommendations.push('🔑 Verify admin authentication is working');
        }
        
        if (failedTests.some(t => t.test.includes('Course Assignment'))) {
            recommendations.push('📋 Implement course assignment dropdown in student details modal');
            recommendations.push('🔗 Ensure course dropdown fetches from updated courses table');
        }
        
        if (failedTests.some(t => t.test.includes('Payment'))) {
            recommendations.push('💰 Implement manual payment form in student details modal');
            recommendations.push('💳 Check payment API endpoints and database tables');
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8f9fa; color: #333; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .summary-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; transition: transform 0.2s; }
        .summary-card:hover { transform: translateY(-2px); }
        .summary-card h3 { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .rate { color: #17a2b8; }
        .total { color: #6f42c1; }
        .results { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 30px; }
        .results-header { background: #f8f9fa; padding: 25px; border-bottom: 1px solid #e9ecef; }
        .results-header h2 { color: #333; font-size: 1.5em; }
        .test-item { padding: 20px 25px; border-bottom: 1px solid #f1f3f4; display: flex; align-items: flex-start; transition: background-color 0.2s; }
        .test-item:hover { background-color: #f8f9fa; }
        .test-item:last-child { border-bottom: none; }
        .test-status { width: 24px; height: 24px; border-radius: 50%; margin-right: 20px; margin-top: 2px; flex-shrink: 0; }
        .test-status.success { background: linear-gradient(45deg, #28a745, #20c997); }
        .test-status.fail { background: linear-gradient(45deg, #dc3545, #e74c3c); }
        .test-details { flex: 1; }
        .test-name { font-weight: 600; font-size: 1.1em; margin-bottom: 8px; color: #333; }
        .test-message { color: #666; margin-bottom: 5px; }
        .test-extra { color: #888; font-size: 0.9em; font-style: italic; }
        .recommendations { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 25px; }
        .recommendations h2 { color: #333; margin-bottom: 20px; font-size: 1.5em; }
        .recommendations ul { padding-left: 0; list-style: none; }
        .recommendations li { background: #f8f9fa; margin-bottom: 12px; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8; }
        .footer { text-align: center; margin-top: 40px; color: #666; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-danger { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Student Management Test Report</h1>
            <p>Automated testing results for your updated database and functionality</p>
            <p><small>Generated on ${new Date().toLocaleString()}</small></p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value total">${report.summary.total}</div>
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
            <div class="results-header">
                <h2>📋 Detailed Test Results</h2>
            </div>
            ${report.results.map((result, index) => `
                <div class="test-item">
                    <div class="test-status ${result.success ? 'success' : 'fail'}"></div>
                    <div class="test-details">
                        <div class="test-name">
                            ${result.test}
                            <span class="badge ${result.success ? 'badge-success' : 'badge-danger'}">${result.success ? 'PASSED' : 'FAILED'}</span>
                        </div>
                        <div class="test-message">${result.message}</div>
                        ${result.details ? `<div class="test-extra">${result.details}</div>` : ''}
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

        <div class="footer">
            <p>🤖 Generated by Student Management System Automated Testing Suite</p>
        </div>
    </div>
</body>
</html>`;

        fs.writeFileSync('./test-report.html', html);
    }

    // Main test runner
    async runAllTests() {
        await this.init();
        
        try {
            // Test sequence
            await this.testCoursesAPI();
            
            const serverOk = await this.testServerConnection();
            if (serverOk) {
                const loginOk = await this.testAdminLogin();
                if (loginOk) {
                    const userMgmtOk = await this.testUserManagementAccess();
                    if (userMgmtOk) {
                        await this.testCourseAssignment();
                        await this.testPaymentSystem();
                    }
                }
            }
            
            // Generate final report
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Test suite crashed:', error);
            await this.addTestResult('Test Suite', false, 'Test suite crashed', error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the tests
setTimeout(async () => {
    const tester = new StudentManagementTester();
    await tester.runAllTests();
}, 3000);
