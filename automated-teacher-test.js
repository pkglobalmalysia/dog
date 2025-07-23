// AUTOMATED TEACHER TESTING SCRIPT
// Tests teacher login and functionality through browser automation

const puppeteer = require('puppeteer');

class AutomatedTeacherTester {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.credentials = {
            email: 'pkibs.office@gmail.com',
            password: 'teachersophie'
        };
        this.browser = null;
        this.page = null;
        this.results = {};
    }

    async init() {
        console.log('🚀 STARTING AUTOMATED TEACHER TESTING');
        console.log('=====================================');
        console.log('👨‍🏫 Teacher Account:', this.credentials.email);
        console.log('🌐 Base URL:', this.baseUrl);
        
        try {
            this.browser = await puppeteer.launch({ 
                headless: false, 
                defaultViewport: { width: 1200, height: 800 },
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.page = await this.browser.newPage();
            
            console.log('✅ Browser launched successfully');
            return true;
        } catch (error) {
            console.log('❌ Browser launch failed:', error.message);
            return false;
        }
    }

    async testTeacherLogin() {
        console.log('\n🔐 TESTING TEACHER LOGIN');
        console.log('========================');

        try {
            // Navigate to login page
            console.log('📍 Navigating to login page...');
            await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
            
            // Wait for form to load
            await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
            console.log('✅ Login form loaded');

            // Fill in credentials
            console.log('📝 Entering teacher credentials...');
            await this.page.type('input[type="email"]', this.credentials.email);
            await this.page.type('input[type="password"]', this.credentials.password);

            // Screenshot before login
            await this.page.screenshot({ path: 'teacher-login-form.png' });
            console.log('📸 Screenshot saved: teacher-login-form.png');

            // Click login button
            console.log('🔘 Clicking login button...');
            await this.page.click('button[type="submit"]');

            // Wait for redirect
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
            
            const currentUrl = this.page.url();
            console.log('🔗 Redirected to:', currentUrl);

            // Check if login was successful
            if (currentUrl.includes('/login')) {
                // Still on login page - check for errors
                const errorElement = await this.page.$('.alert, .error, [role="alert"]');
                if (errorElement) {
                    const errorText = await this.page.evaluate(el => el.textContent, errorElement);
                    console.log('❌ Login failed with error:', errorText);
                    this.results.login = { success: false, error: errorText, url: currentUrl };
                } else {
                    console.log('❌ Login failed - still on login page');
                    this.results.login = { success: false, error: 'Still on login page', url: currentUrl };
                }
            } else {
                console.log('✅ Login successful!');
                this.results.login = { success: true, redirectUrl: currentUrl };
                
                // Screenshot after successful login
                await this.page.screenshot({ path: 'teacher-dashboard.png' });
                console.log('📸 Screenshot saved: teacher-dashboard.png');
            }

            return this.results.login.success;

        } catch (error) {
            console.log('❌ Login test failed:', error.message);
            this.results.login = { success: false, error: error.message };
            return false;
        }
    }

    async testTeacherDashboard() {
        console.log('\n📊 TESTING TEACHER DASHBOARD');
        console.log('============================');

        try {
            // Check current page title and content
            const title = await this.page.title();
            console.log('📄 Page title:', title);

            // Look for teacher-specific elements
            const teacherElements = await this.page.evaluate(() => {
                const elements = [];
                
                // Look for navigation items
                const navItems = document.querySelectorAll('nav a, .nav-link, [role="navigation"] a');
                navItems.forEach(item => {
                    if (item.textContent.toLowerCase().includes('calendar') ||
                        item.textContent.toLowerCase().includes('course') ||
                        item.textContent.toLowerCase().includes('assignment') ||
                        item.textContent.toLowerCase().includes('student') ||
                        item.textContent.toLowerCase().includes('salary') ||
                        item.textContent.toLowerCase().includes('lecture')) {
                        elements.push({
                            type: 'navigation',
                            text: item.textContent.trim(),
                            href: item.href
                        });
                    }
                });

                // Look for dashboard cards/sections
                const sections = document.querySelectorAll('.card, .section, .panel, [class*="dashboard"]');
                sections.forEach(section => {
                    const text = section.textContent.substring(0, 100);
                    if (text.length > 0) {
                        elements.push({
                            type: 'section',
                            text: text.trim()
                        });
                    }
                });

                return elements;
            });

            console.log('🔍 Found dashboard elements:');
            teacherElements.forEach((element, index) => {
                console.log(`   ${index + 1}. [${element.type}] ${element.text}`);
                if (element.href) console.log(`      → ${element.href}`);
            });

            this.results.dashboard = { success: true, elements: teacherElements };
            return true;

        } catch (error) {
            console.log('❌ Dashboard test failed:', error.message);
            this.results.dashboard = { success: false, error: error.message };
            return false;
        }
    }

    async testTeacherCalendar() {
        console.log('\n📅 TESTING TEACHER CALENDAR (CRITICAL)');
        console.log('======================================');

        try {
            // Navigate to teacher calendar
            const calendarUrls = [
                '/dashboard/teacher/calendar',
                '/teacher/calendar',
                '/calendar'
            ];

            for (const url of calendarUrls) {
                try {
                    console.log(`📍 Trying calendar URL: ${url}`);
                    await this.page.goto(`${this.baseUrl}${url}`, { waitUntil: 'networkidle2', timeout: 10000 });
                    
                    const currentUrl = this.page.url();
                    if (!currentUrl.includes('/login')) {
                        console.log('✅ Calendar page loaded successfully');
                        break;
                    }
                } catch (error) {
                    console.log(`❌ Failed to load ${url}:`, error.message);
                }
            }

            // Wait for calendar to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Look for calendar events
            const calendarData = await this.page.evaluate(() => {
                const events = [];
                
                // Look for calendar events with various selectors
                const eventSelectors = [
                    '.calendar-event',
                    '.event',
                    '[class*="event"]',
                    '.fc-event', // FullCalendar
                    '[data-event]',
                    '.day-event'
                ];

                eventSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        events.push({
                            text: element.textContent.trim(),
                            className: element.className,
                            selector: selector
                        });
                    });
                });

                // Also check for mark complete buttons
                const markCompleteButtons = document.querySelectorAll('button, .btn, [role="button"]');
                const markCompleteFound = [];
                
                markCompleteButtons.forEach(button => {
                    const text = button.textContent.toLowerCase();
                    if (text.includes('mark') && text.includes('complete')) {
                        markCompleteFound.push({
                            text: button.textContent.trim(),
                            className: button.className
                        });
                    }
                });

                return {
                    events: events.slice(0, 10), // Limit to first 10 events
                    markCompleteButtons: markCompleteFound,
                    pageContent: document.body.textContent.substring(0, 500)
                };
            });

            console.log('📊 Calendar analysis:');
            console.log(`   📅 Found ${calendarData.events.length} potential events`);
            console.log(`   ✅ Found ${calendarData.markCompleteButtons.length} mark complete buttons`);

            if (calendarData.events.length > 0) {
                console.log('🗓️  Events found:');
                calendarData.events.forEach((event, index) => {
                    console.log(`   ${index + 1}. ${event.text}`);
                });
            }

            if (calendarData.markCompleteButtons.length > 0) {
                console.log('✅ Mark Complete buttons found:');
                calendarData.markCompleteButtons.forEach((button, index) => {
                    console.log(`   ${index + 1}. ${button.text}`);
                });
            }

            // Screenshot the calendar
            await this.page.screenshot({ path: 'teacher-calendar.png' });
            console.log('📸 Screenshot saved: teacher-calendar.png');

            this.results.calendar = { 
                success: true, 
                eventsFound: calendarData.events.length,
                markCompleteButtons: calendarData.markCompleteButtons.length,
                data: calendarData
            };

            return true;

        } catch (error) {
            console.log('❌ Calendar test failed:', error.message);
            this.results.calendar = { success: false, error: error.message };
            return false;
        }
    }

    async testMarkCompleteFeature() {
        console.log('\n✅ TESTING MARK COMPLETE FEATURE (CRITICAL)');
        console.log('===========================================');

        try {
            // Look for mark complete buttons using proper selector
            const markCompleteButtons = await this.page.$$('button, .btn, [role="button"]');
            
            let markCompleteFound = false;
            for (const button of markCompleteButtons) {
                const text = await button.evaluate(el => el.textContent.toLowerCase());
                if (text.includes('mark') && text.includes('complete')) {
                    console.log('🔘 Found Mark Complete button, attempting to click...');
                    
                    // Click the button
                    await button.click();
                    markCompleteFound = true;
                    break;
                }
            }
            
            if (markCompleteFound) {
                // Wait for response
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check for success/error messages
                const messages = await this.page.evaluate(() => {
                    const messageSelectors = ['.alert', '.notification', '.toast', '.message', '[role="alert"]'];
                    const messages = [];
                    
                    messageSelectors.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
                            messages.push({
                                text: element.textContent.trim(),
                                className: element.className
                            });
                        });
                    });
                    
                    return messages;
                });

                console.log('📧 Messages after mark complete:');
                messages.forEach((message, index) => {
                    console.log(`   ${index + 1}. ${message.text}`);
                });

                this.results.markComplete = { 
                    success: true, 
                    buttonFound: true,
                    messages: messages
                };

            } else {
                console.log('❌ No Mark Complete button found');
                this.results.markComplete = { 
                    success: false, 
                    buttonFound: false,
                    error: 'No mark complete button found'
                };
            }

        } catch (error) {
            console.log('❌ Mark Complete test failed:', error.message);
            this.results.markComplete = { success: false, error: error.message };
        }
    }

    async testAllTeacherRoutes() {
        console.log('\n🗺️  TESTING ALL TEACHER ROUTES');
        console.log('==============================');

        const teacherRoutes = [
            '/dashboard/teacher',
            '/dashboard/teacher/calendar',
            '/dashboard/teacher/lectures',
            '/dashboard/teacher/assignments',
            '/dashboard/teacher/attendance',
            '/dashboard/teacher/salary'
        ];

        for (const route of teacherRoutes) {
            try {
                console.log(`📍 Testing route: ${route}`);
                await this.page.goto(`${this.baseUrl}${route}`, { waitUntil: 'networkidle2', timeout: 10000 });
                
                const currentUrl = this.page.url();
                const title = await this.page.title();
                
                if (currentUrl.includes('/login')) {
                    console.log(`❌ ${route} - Redirected to login (no access)`);
                    this.results[`route_${route.replace(/\//g, '_')}`] = { 
                        success: false, 
                        error: 'Redirected to login' 
                    };
                } else {
                    console.log(`✅ ${route} - Loaded successfully`);
                    console.log(`   📄 Title: ${title}`);
                    
                    this.results[`route_${route.replace(/\//g, '_')}`] = { 
                        success: true, 
                        url: currentUrl,
                        title: title
                    };
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`❌ ${route} - Error:`, error.message);
                this.results[`route_${route.replace(/\//g, '_')}`] = { 
                    success: false, 
                    error: error.message 
                };
            }
        }
    }

    async runAllTests() {
        const startTime = Date.now();

        try {
            // Initialize browser
            const initSuccess = await this.init();
            if (!initSuccess) {
                return { error: 'Failed to initialize browser' };
            }

            // Run all tests
            await this.testTeacherLogin();
            
            if (this.results.login.success) {
                await this.testTeacherDashboard();
                await this.testTeacherCalendar();
                await this.testMarkCompleteFeature();
                await this.testAllTeacherRoutes();
            } else {
                console.log('⚠️  Skipping further tests due to login failure');
            }

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            // Generate summary
            console.log('\n🎯 AUTOMATED TEACHER TESTING SUMMARY');
            console.log('===================================');
            console.log(`⏱️  Total time: ${duration} seconds`);

            let totalTests = 0;
            let passedTests = 0;

            Object.keys(this.results).forEach(testName => {
                const result = this.results[testName];
                totalTests++;
                if (result.success) passedTests++;
                
                const status = result.success ? '✅' : '❌';
                console.log(`${status} ${testName}: ${result.success ? 'PASSED' : 'FAILED'}`);
                if (result.error) {
                    console.log(`     Error: ${result.error}`);
                }
            });

            console.log(`\n🎯 OVERALL: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);

            console.log('\n📋 CRITICAL ISSUES STATUS:');
            console.log(`   🔐 Login: ${this.results.login?.success ? '✅ WORKING' : '❌ FAILED'}`);
            console.log(`   📅 Calendar: ${this.results.calendar?.success ? '✅ WORKING' : '❌ FAILED'}`);
            console.log(`   ✅ Mark Complete: ${this.results.markComplete?.success ? '✅ WORKING' : '❌ FAILED'}`);

            return {
                totalTests,
                passedTests,
                duration,
                results: this.results
            };

        } catch (error) {
            console.error('❌ Testing failed:', error);
            return { error: error.message };
        } finally {
            if (this.browser) {
                await this.browser.close();
                console.log('🔒 Browser closed');
            }
        }
    }
}

// Check if we can run the test
console.log('🧪 Automated Teacher Tester Loaded!');
console.log('Note: This requires Puppeteer to be installed');
console.log('Run: npm install puppeteer');
console.log('Then: const tester = new AutomatedTeacherTester(); tester.runAllTests();');

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomatedTeacherTester;
}
