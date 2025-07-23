// FIXED AUTOMATED TEACHER TESTING SCRIPT
// Tests teacher login and functionality with corrected Puppeteer syntax

const puppeteer = require('puppeteer');

class FixedTeacherTester {
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
        console.log('🚀 STARTING FIXED TEACHER TESTING');
        console.log('=================================');
        console.log('👨‍🏫 Teacher Account:', this.credentials.email);
        console.log('🌐 Base URL:', this.baseUrl);
        
        try {
            this.browser = await puppeteer.launch({ 
                headless: false, 
                defaultViewport: { width: 1200, height: 800 },
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.page = await this.browser.newPage();
            
            // Enable console logging from the page
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log('🔍 Browser Console Error:', msg.text());
                }
            });
            
            console.log('✅ Browser launched successfully');
            return true;
        } catch (error) {
            console.log('❌ Browser launch failed:', error.message);
            return false;
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

            // Clear and fill in credentials
            console.log('📝 Entering teacher credentials...');
            await this.page.click('input[type="email"]', { clickCount: 3 });
            await this.page.type('input[type="email"]', this.credentials.email);
            
            await this.page.click('input[type="password"]', { clickCount: 3 });
            await this.page.type('input[type="password"]', this.credentials.password);

            // Screenshot before login
            await this.page.screenshot({ path: 'fixed-teacher-login-form.png' });
            console.log('📸 Screenshot saved: fixed-teacher-login-form.png');

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
                const errorElements = await this.page.$$('.alert, .error, [role="alert"]');
                if (errorElements.length > 0) {
                    const errorText = await errorElements[0].evaluate(el => el.textContent);
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
                await this.page.screenshot({ path: 'fixed-teacher-dashboard.png' });
                console.log('📸 Screenshot saved: fixed-teacher-dashboard.png');
            }

            return this.results.login.success;

        } catch (error) {
            console.log('❌ Login test failed:', error.message);
            this.results.login = { success: false, error: error.message };
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
                '/admin/calendar',
                '/calendar'
            ];

            let calendarLoaded = false;
            for (const url of calendarUrls) {
                try {
                    console.log(`📍 Trying calendar URL: ${url}`);
                    await this.page.goto(`${this.baseUrl}${url}`, { waitUntil: 'networkidle2', timeout: 10000 });
                    
                    const currentUrl = this.page.url();
                    if (!currentUrl.includes('/login')) {
                        console.log('✅ Calendar page loaded successfully');
                        calendarLoaded = true;
                        break;
                    }
                } catch (error) {
                    console.log(`❌ Failed to load ${url}:`, error.message);
                }
            }

            if (!calendarLoaded) {
                this.results.calendar = { success: false, error: 'Could not load any calendar page' };
                return false;
            }

            // Wait for calendar to load
            await this.delay(3000);

            // Take screenshot of calendar
            await this.page.screenshot({ path: 'fixed-teacher-calendar.png' });
            console.log('📸 Screenshot saved: fixed-teacher-calendar.png');

            // Look for calendar events and mark complete buttons
            const calendarData = await this.page.evaluate(() => {
                const events = [];
                const markCompleteButtons = [];
                
                // Look for calendar events
                const eventSelectors = [
                    '.calendar-event', '.event', '[class*="event"]', '.fc-event',
                    '[data-event]', '.day-event', '.calendar-item'
                ];

                eventSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        const text = element.textContent.trim();
                        if (text.length > 0) {
                            events.push({
                                text: text.substring(0, 100),
                                className: element.className,
                                selector: selector
                            });
                        }
                    });
                });

                // Look for mark complete buttons
                const buttons = document.querySelectorAll('button, .btn, [role="button"], input[type="button"]');
                buttons.forEach(button => {
                    const text = button.textContent.toLowerCase();
                    if (text.includes('mark') || text.includes('complete') || text.includes('done')) {
                        markCompleteButtons.push({
                            text: button.textContent.trim(),
                            className: button.className,
                            id: button.id
                        });
                    }
                });

                // Get page content preview
                const pageText = document.body.textContent.toLowerCase();
                const hasCalendarContent = pageText.includes('calendar') || 
                                         pageText.includes('event') || 
                                         pageText.includes('schedule');

                return {
                    events: events.slice(0, 10),
                    markCompleteButtons: markCompleteButtons,
                    hasCalendarContent: hasCalendarContent,
                    pageTitle: document.title,
                    bodyText: document.body.textContent.substring(0, 300)
                };
            });

            console.log('📊 Calendar analysis:');
            console.log(`   📄 Page title: ${calendarData.pageTitle}`);
            console.log(`   📅 Found ${calendarData.events.length} potential events`);
            console.log(`   ✅ Found ${calendarData.markCompleteButtons.length} action buttons`);
            console.log(`   📝 Has calendar content: ${calendarData.hasCalendarContent}`);

            if (calendarData.events.length > 0) {
                console.log('🗓️  Events found:');
                calendarData.events.forEach((event, index) => {
                    console.log(`   ${index + 1}. ${event.text}`);
                });
            }

            if (calendarData.markCompleteButtons.length > 0) {
                console.log('🔘 Action buttons found:');
                calendarData.markCompleteButtons.forEach((button, index) => {
                    console.log(`   ${index + 1}. "${button.text}"`);
                });
            }

            console.log('📝 Page content preview:');
            console.log(`   ${calendarData.bodyText}...`);

            this.results.calendar = { 
                success: true, 
                eventsFound: calendarData.events.length,
                buttonsFound: calendarData.markCompleteButtons.length,
                hasCalendarContent: calendarData.hasCalendarContent,
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
            // Look for any buttons that might be mark complete
            const allButtons = await this.page.$$('button, .btn, [role="button"], input[type="button"]');
            
            let markCompleteFound = false;
            let buttonText = '';
            
            for (const button of allButtons) {
                const text = await button.evaluate(el => el.textContent.toLowerCase());
                if (text.includes('mark') || text.includes('complete') || text.includes('done')) {
                    console.log(`🔘 Found potential mark complete button: "${text}"`);
                    buttonText = text;
                    
                    try {
                        // Try to click the button
                        await button.click();
                        markCompleteFound = true;
                        console.log('✅ Successfully clicked mark complete button');
                        
                        // Wait for any response
                        await this.delay(3000);
                        
                        // Check for success/error messages
                        const messages = await this.page.evaluate(() => {
                            const messageSelectors = [
                                '.alert', '.notification', '.toast', '.message', 
                                '[role="alert"]', '.success', '.error', '.warning'
                            ];
                            const messages = [];
                            
                            messageSelectors.forEach(selector => {
                                const elements = document.querySelectorAll(selector);
                                elements.forEach(element => {
                                    const text = element.textContent.trim();
                                    if (text.length > 0) {
                                        messages.push({
                                            text: text,
                                            className: element.className
                                        });
                                    }
                                });
                            });
                            
                            return messages;
                        });

                        console.log('📧 Messages after clicking:');
                        if (messages.length > 0) {
                            messages.forEach((message, index) => {
                                console.log(`   ${index + 1}. ${message.text}`);
                            });
                        } else {
                            console.log('   No messages found');
                        }

                        this.results.markComplete = { 
                            success: true, 
                            buttonFound: true,
                            buttonText: buttonText,
                            messages: messages
                        };
                        
                        break;
                        
                    } catch (clickError) {
                        console.log(`⚠️  Could not click button: ${clickError.message}`);
                    }
                }
            }
            
            if (!markCompleteFound) {
                console.log('❌ No mark complete buttons found or clickable');
                this.results.markComplete = { 
                    success: false, 
                    buttonFound: false,
                    error: 'No mark complete buttons found'
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
            { url: '/dashboard/teacher', name: 'Main Teacher Dashboard' },
            { url: '/dashboard/teacher/calendar', name: 'Teacher Calendar' },
            { url: '/dashboard/teacher/lectures', name: 'Teacher Lectures' },
            { url: '/dashboard/teacher/assignments', name: 'Teacher Assignments' },
            { url: '/dashboard/teacher/attendance', name: 'Teacher Attendance' },
            { url: '/dashboard/teacher/salary', name: 'Teacher Salary' },
            { url: '/admin', name: 'Admin Dashboard' },
            { url: '/admin/calendar', name: 'Admin Calendar' }
        ];

        for (const route of teacherRoutes) {
            try {
                console.log(`📍 Testing: ${route.name} (${route.url})`);
                await this.page.goto(`${this.baseUrl}${route.url}`, { 
                    waitUntil: 'networkidle2', 
                    timeout: 10000 
                });
                
                const currentUrl = this.page.url();
                const title = await this.page.title();
                
                if (currentUrl.includes('/login')) {
                    console.log(`❌ ${route.name} - Redirected to login (no access)`);
                    this.results[`route_${route.name.replace(/\s+/g, '_')}`] = { 
                        success: false, 
                        error: 'Redirected to login' 
                    };
                } else {
                    console.log(`✅ ${route.name} - Loaded successfully`);
                    console.log(`   📄 Title: ${title}`);
                    
                    // Get page content
                    const hasContent = await this.page.evaluate(() => {
                        const bodyText = document.body.textContent.toLowerCase();
                        return {
                            hasTeacherContent: bodyText.includes('teacher') || bodyText.includes('instructor'),
                            hasAdminContent: bodyText.includes('admin') || bodyText.includes('dashboard'),
                            hasCalendarContent: bodyText.includes('calendar') || bodyText.includes('event'),
                            contentPreview: document.body.textContent.substring(0, 200)
                        };
                    });
                    
                    this.results[`route_${route.name.replace(/\s+/g, '_')}`] = { 
                        success: true, 
                        url: currentUrl,
                        title: title,
                        content: hasContent
                    };
                    
                    console.log(`   📝 Content: Teacher=${hasContent.hasTeacherContent}, Admin=${hasContent.hasAdminContent}, Calendar=${hasContent.hasCalendarContent}`);
                }
                
                await this.delay(1000);
                
            } catch (error) {
                console.log(`❌ ${route.name} - Error:`, error.message);
                this.results[`route_${route.name.replace(/\s+/g, '_')}`] = { 
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
                await this.testTeacherCalendar();
                await this.testMarkCompleteFeature();
                await this.testAllTeacherRoutes();
            } else {
                console.log('⚠️  Skipping further tests due to login failure');
            }

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            // Generate summary
            console.log('\n🎯 FIXED TEACHER TESTING SUMMARY');
            console.log('=================================');
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

            console.log('\n📋 CRITICAL FEATURES STATUS:');
            console.log(`   🔐 Login: ${this.results.login?.success ? '✅ WORKING' : '❌ FAILED'}`);
            console.log(`   📅 Calendar: ${this.results.calendar?.success ? '✅ ACCESSIBLE' : '❌ FAILED'}`);
            console.log(`   ✅ Mark Complete: ${this.results.markComplete?.success ? '✅ FUNCTIONAL' : '❌ NOT FOUND'}`);

            if (this.results.calendar?.success) {
                console.log(`\n📊 CALENDAR DETAILS:`);
                console.log(`   Events found: ${this.results.calendar.eventsFound}`);
                console.log(`   Buttons found: ${this.results.calendar.buttonsFound}`);
                console.log(`   Has calendar content: ${this.results.calendar.hasCalendarContent}`);
            }

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

// Auto-run
if (typeof window === 'undefined' && require.main === module) {
    const tester = new FixedTeacherTester();
    tester.runAllTests().then(results => {
        console.log('✅ Fixed teacher testing complete!');
    }).catch(console.error);
}

module.exports = FixedTeacherTester;
