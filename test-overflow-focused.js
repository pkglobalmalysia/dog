const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Comprehensive UI Test for Course Assignment Overflow Issues
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    headless: false,
    slowMo: 1000, // Slower for better observation
    timeout: 45000, // Longer timeout
    screenshots: true,
    screenshotDir: './overflow-test-screenshots',
    
    // Admin credentials
    adminEmail: 'ceo@pkibs.com',
    adminPassword: 'PKibs@@11'
};

class OverflowTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.issues = [];
        this.screenshotCounter = 0;
    }

    async init() {
        console.log('🔍 OVERFLOW ISSUE DETECTOR - User Management Interface');
        console.log('======================================================');
        console.log('🎯 Target: /admin/user-management "Assign New Course" overflow issues');
        console.log('👤 Admin: ceo@pkibs.com');
        console.log('');
        
        // Create screenshots directory
        if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }

        // Launch browser
        this.browser = await puppeteer.launch({
            headless: TEST_CONFIG.headless,
            slowMo: TEST_CONFIG.slowMo,
            defaultViewport: null, // Use full window
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security'
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setDefaultTimeout(TEST_CONFIG.timeout);
        
        // Enable console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('🔍 Browser Error:', msg.text());
            }
        });
    }

    async screenshot(name, description = '') {
        const filename = `${String(++this.screenshotCounter).padStart(2, '0')}-${name}.png`;
        const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
        
        await this.page.screenshot({ 
            path: filepath, 
            fullPage: true,
            quality: 90
        });
        
        console.log(`📸 ${filename}: ${description}`);
        return filename;
    }

    async checkServerConnection() {
        console.log('🌐 Checking server connection...');
        
        try {
            const response = await this.page.goto(TEST_CONFIG.baseUrl, { 
                waitUntil: 'networkidle0',
                timeout: 15000
            });
            
            if (response && response.ok()) {
                console.log('✅ Development server is running');
                await this.screenshot('00-homepage', 'Homepage loaded successfully');
                return true;
            } else {
                console.log('❌ Server not responding correctly');
                return false;
            }
        } catch (error) {
            console.log('❌ Cannot connect to development server');
            console.log('💡 Make sure "npm run dev" is running on port 3000');
            return false;
        }
    }

    async loginAsAdmin() {
        console.log('🔐 Logging in as admin...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/login`);
            await this.screenshot('01-login-page', 'Login page loaded');
            
            // Wait for login form
            await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
            
            // Clear and fill email
            await this.page.click('input[type="email"]', { clickCount: 3 });
            await this.page.type('input[type="email"]', TEST_CONFIG.adminEmail);
            
            // Clear and fill password
            await this.page.click('input[type="password"]', { clickCount: 3 });
            await this.page.type('input[type="password"]', TEST_CONFIG.adminPassword);
            
            await this.screenshot('02-login-filled', 'Login form filled with admin credentials');
            
            // Submit and wait for navigation
            await Promise.all([
                this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }),
                this.page.click('button[type="submit"]')
            ]);
            
            await this.screenshot('03-after-login', 'After login attempt');
            
            const currentUrl = this.page.url();
            console.log(`Current URL after login: ${currentUrl}`);
            
            if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
                console.log('✅ Successfully logged in as admin');
                return true;
            } else {
                console.log('❌ Login failed - check credentials or authentication system');
                return false;
            }
        } catch (error) {
            console.log('❌ Login error:', error.message);
            await this.screenshot('error-login', 'Login error occurred');
            return false;
        }
    }

    async navigateToUserManagement() {
        console.log('👥 Navigating to User Management...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/admin/user-management`);
            await this.page.waitForTimeout(5000); // Give page time to load
            
            await this.screenshot('04-user-management', 'User Management page loaded');
            
            // Check if page loaded correctly
            const title = await this.page.title();
            const url = this.page.url();
            
            console.log(`Page title: ${title}`);
            console.log(`Current URL: ${url}`);
            
            // Look for any indicators that this is the user management page
            const pageContent = await this.page.content();
            
            if (pageContent.includes('user') || pageContent.includes('student') || pageContent.includes('management')) {
                console.log('✅ User Management page appears to be loaded');
                return true;
            } else {
                console.log('⚠️  Page loaded but content unclear');
                return true; // Continue anyway
            }
        } catch (error) {
            console.log('❌ Error navigating to user management:', error.message);
            return false;
        }
    }

    async findAndAnalyzeUserInterface() {
        console.log('🔍 Analyzing User Management Interface...');
        
        try {
            // Take a full screenshot first
            await this.screenshot('05-full-interface', 'Complete user management interface');
            
            // Look for common UI patterns
            await this.analyzeOverallLayout();
            await this.findViewDetailsButtons();
            await this.testModalInteractions();
            await this.analyzeCourseAssignmentElements();
            
        } catch (error) {
            console.log('❌ Error analyzing interface:', error.message);
        }
    }

    async analyzeOverallLayout() {
        console.log('📐 Analyzing overall page layout...');
        
        const layoutInfo = await this.page.evaluate(() => {
            return {
                bodyWidth: document.body.scrollWidth,
                bodyHeight: document.body.scrollHeight,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
                hasVerticalScroll: document.body.scrollHeight > window.innerHeight
            };
        });
        
        console.log('Layout Analysis:', layoutInfo);
        
        if (layoutInfo.hasHorizontalScroll) {
            console.log('🚨 ISSUE: Page has horizontal scrollbar');
            console.log(`   Body width: ${layoutInfo.bodyWidth}px`);
            console.log(`   Viewport: ${layoutInfo.viewportWidth}px`);
            console.log('   💡 This indicates overflow issues');
        }
        
        return layoutInfo;
    }

    async findViewDetailsButtons() {
        console.log('🔍 Looking for View Details buttons...');
        
        // Multiple strategies to find clickable elements
        const selectors = [
            'button:contains("View Details")',
            'button:contains("View")',
            'button:contains("Details")',
            'a:contains("View Details")',
            'a:contains("View")',
            '.view-details',
            '[data-action="view"]',
            'button[class*="view"]',
            'a[class*="view"]'
        ];
        
        let foundButtons = [];
        
        for (let selector of selectors) {
            try {
                const elements = await this.page.$$(selector);
                if (elements.length > 0) {
                    foundButtons.push({ selector, count: elements.length });
                    console.log(`   Found ${elements.length} elements with selector: ${selector}`);
                }
            } catch (error) {
                // Selector might not be valid in this context
            }
        }
        
        // If no specific view buttons found, look for any buttons
        if (foundButtons.length === 0) {
            const allButtons = await this.page.$$('button, a[href], .btn, [role="button"]');
            console.log(`   Found ${allButtons.length} total clickable elements`);
            
            // Check text content of first few buttons
            for (let i = 0; i < Math.min(5, allButtons.length); i++) {
                const text = await allButtons[i].evaluate(el => el.textContent?.trim());
                console.log(`   Button ${i + 1}: "${text}"`);
            }
            
            return allButtons;
        }
        
        return foundButtons;
    }

    async testModalInteractions() {
        console.log('🎯 Testing modal/dialog interactions...');
        
        try {
            // Get all clickable elements
            const clickableElements = await this.page.$$('button, a, .btn, [role="button"], td[class*="cursor"], tr[class*="cursor"]');
            
            console.log(`   Testing ${Math.min(5, clickableElements.length)} clickable elements...`);
            
            for (let i = 0; i < Math.min(5, clickableElements.length); i++) {
                const element = clickableElements[i];
                
                try {
                    // Get element info
                    const elementInfo = await element.evaluate(el => ({
                        tagName: el.tagName,
                        className: el.className,
                        text: el.textContent?.trim().substring(0, 30) || '',
                        href: el.href || '',
                        role: el.getAttribute('role') || ''
                    }));
                    
                    console.log(`   Testing element ${i + 1}: ${elementInfo.tagName} - "${elementInfo.text}"`);
                    
                    // Click and see what happens
                    await element.click();
                    await this.page.waitForTimeout(2000);
                    
                    // Check if modal appeared
                    const modalSelectors = [
                        '.modal',
                        '.dialog',
                        '[role="dialog"]',
                        '.student-details',
                        '.user-details',
                        '[data-testid*="modal"]',
                        '[data-testid*="dialog"]'
                    ];
                    
                    let modalFound = false;
                    for (let modalSelector of modalSelectors) {
                        const modal = await this.page.$(modalSelector);
                        if (modal) {
                            modalFound = true;
                            console.log(`   ✅ Modal opened with selector: ${modalSelector}`);
                            await this.screenshot(`06-modal-${i + 1}`, `Modal opened from element ${i + 1}`);
                            
                            // Analyze the modal content
                            await this.analyzeModalContent(modal);
                            break;
                        }
                    }
                    
                    if (!modalFound) {
                        // Check if URL changed (navigation instead of modal)
                        const newUrl = this.page.url();
                        if (newUrl !== `${TEST_CONFIG.baseUrl}/admin/user-management`) {
                            console.log(`   Navigation occurred to: ${newUrl}`);
                            // Go back
                            await this.page.goBack();
                            await this.page.waitForTimeout(2000);
                        }
                    }
                    
                } catch (error) {
                    console.log(`   Error testing element ${i + 1}: ${error.message}`);
                }
                
                // Close any open modals
                await this.closeModals();
            }
            
        } catch (error) {
            console.log('❌ Error in modal testing:', error.message);
        }
    }

    async analyzeModalContent(modal) {
        console.log('   🔍 Analyzing modal content for course assignment...');
        
        try {
            // Get modal dimensions
            const modalInfo = await modal.evaluate(el => {
                const rect = el.getBoundingClientRect();
                const style = getComputedStyle(el);
                return {
                    width: rect.width,
                    height: rect.height,
                    x: rect.x,
                    y: rect.y,
                    overflow: style.overflow,
                    overflowX: style.overflowX,
                    overflowY: style.overflowY,
                    scrollWidth: el.scrollWidth,
                    scrollHeight: el.scrollHeight
                };
            });
            
            console.log('   Modal dimensions:', modalInfo);
            
            // Check for overflow
            if (modalInfo.scrollWidth > modalInfo.width) {
                console.log('   🚨 OVERFLOW DETECTED: Modal has horizontal overflow');
                console.log(`      Content width: ${modalInfo.scrollWidth}px`);
                console.log(`      Container width: ${modalInfo.width}px`);
            }
            
            if (modalInfo.scrollHeight > modalInfo.height) {
                console.log('   ⚠️  OVERFLOW: Modal has vertical overflow');
                console.log(`      Content height: ${modalInfo.scrollHeight}px`);
                console.log(`      Container height: ${modalInfo.height}px`);
            }
            
            // Look for course assignment elements within the modal
            await this.findCourseAssignmentInModal(modal);
            
        } catch (error) {
            console.log('   Error analyzing modal:', error.message);
        }
    }

    async findCourseAssignmentInModal(modal) {
        console.log('   🎯 Looking for course assignment elements...');
        
        try {
            // Look for course-related elements
            const courseElements = await modal.$$('select, .select, .dropdown, input[name*="course"], [class*="course"], [id*="course"]');
            
            console.log(`   Found ${courseElements.length} potential course elements`);
            
            for (let i = 0; i < courseElements.length; i++) {
                const element = courseElements[i];
                
                const elementInfo = await element.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    const style = getComputedStyle(el);
                    return {
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        width: rect.width,
                        height: rect.height,
                        x: rect.x,
                        y: rect.y,
                        overflow: style.overflow,
                        overflowX: style.overflowX,
                        overflowY: style.overflowY,
                        display: style.display,
                        position: style.position
                    };
                });
                
                console.log(`   Course Element ${i + 1}:`, elementInfo);
                
                // Check for specific overflow issues
                if (elementInfo.width > 500) {
                    console.log(`   ⚠️  Element ${i + 1} is very wide (${elementInfo.width}px)`);
                }
                
                if (elementInfo.x < 0 || elementInfo.y < 0) {
                    console.log(`   🚨 Element ${i + 1} positioned outside viewport`);
                }
                
                // Take screenshot of the problematic element
                await element.screenshot({ 
                    path: path.join(TEST_CONFIG.screenshotDir, `course-element-${i + 1}.png`)
                });
            }
            
            // Look for text mentioning "assign" and "course"
            const assignText = await modal.evaluate(el => {
                const text = el.textContent.toLowerCase();
                return {
                    hasAssign: text.includes('assign'),
                    hasCourse: text.includes('course'),
                    hasNew: text.includes('new'),
                    fullText: text.substring(0, 200)
                };
            });
            
            console.log('   Assignment text analysis:', assignText);
            
            if (assignText.hasAssign && assignText.hasCourse) {
                console.log('   ✅ Found "Assign Course" functionality');
                await this.screenshot('course-assignment-found', 'Course assignment section located');
            }
            
        } catch (error) {
            console.log('   Error finding course assignment:', error.message);
        }
    }

    async analyzeCourseAssignmentElements() {
        console.log('🎯 Direct search for course assignment elements...');
        
        try {
            // Search entire page for course assignment related text
            const pageText = await this.page.evaluate(() => {
                const text = document.body.textContent.toLowerCase();
                return {
                    hasAssignCourse: text.includes('assign') && text.includes('course'),
                    hasNewCourse: text.includes('new') && text.includes('course'),
                    hasCourseManagement: text.includes('course') && text.includes('management'),
                    fullText: text.substring(0, 500)
                };
            });
            
            console.log('Page text analysis:', pageText);
            
            // Look for all form elements that might be related
            const formElements = await this.page.$$('form, .form, input, select, textarea, button');
            console.log(`Found ${formElements.length} form elements on the page`);
            
            // Check each form element for course-related attributes
            for (let i = 0; i < Math.min(10, formElements.length); i++) {
                const element = formElements[i];
                
                const elementData = await element.evaluate(el => ({
                    tagName: el.tagName,
                    name: el.name || '',
                    id: el.id || '',
                    className: el.className || '',
                    placeholder: el.placeholder || '',
                    value: el.value || '',
                    text: el.textContent?.substring(0, 50) || ''
                }));
                
                if (elementData.name.includes('course') || 
                    elementData.id.includes('course') || 
                    elementData.className.includes('course') ||
                    elementData.placeholder.includes('course') ||
                    elementData.text.includes('course')) {
                    
                    console.log(`   Course-related element found:`, elementData);
                    
                    // Take screenshot of this element
                    await element.screenshot({ 
                        path: path.join(TEST_CONFIG.screenshotDir, `course-related-${i}.png`)
                    });
                }
            }
            
        } catch (error) {
            console.log('❌ Error in direct course assignment search:', error.message);
        }
    }

    async closeModals() {
        try {
            // Try various ways to close modals
            const closeSelectors = [
                '.modal .close',
                '.dialog .close',
                '[data-dismiss="modal"]',
                '.modal-close',
                '.dialog-close',
                'button:contains("Close")',
                'button:contains("Cancel")',
                '.modal-backdrop'
            ];
            
            for (let selector of closeSelectors) {
                try {
                    const closeButton = await this.page.$(selector);
                    if (closeButton) {
                        await closeButton.click();
                        await this.page.waitForTimeout(1000);
                        break;
                    }
                } catch (error) {
                    // Continue to next selector
                }
            }
            
            // Press Escape key as backup
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
            
        } catch (error) {
            // Ignore errors in closing modals
        }
    }

    async generateOverflowReport() {
        console.log('\n📊 GENERATING OVERFLOW ANALYSIS REPORT');
        console.log('======================================');
        
        const report = {
            timestamp: new Date().toISOString(),
            testTarget: '/admin/user-management',
            focus: 'Course Assignment Overflow Issues',
            findings: this.issues,
            screenshots: fs.readdirSync(TEST_CONFIG.screenshotDir).filter(f => f.endsWith('.png')),
            recommendations: [
                '🔍 Check modal/dialog CSS for max-width constraints',
                '📐 Ensure form elements have proper width limits',
                '🎯 Add overflow: hidden or auto to containers',
                '📱 Implement responsive design for smaller screens',
                '🔧 Test course dropdown with long course names'
            ]
        };
        
        // Save report
        fs.writeFileSync('./overflow-analysis-report.json', JSON.stringify(report, null, 2));
        
        console.log(`\n📄 Test completed!`);
        console.log(`📊 Screenshots taken: ${report.screenshots.length}`);
        console.log(`📁 Screenshots location: ${TEST_CONFIG.screenshotDir}`);
        console.log(`📋 Report saved: overflow-analysis-report.json`);
        
        if (report.screenshots.length > 0) {
            console.log('\n📸 Key screenshots to review:');
            report.screenshots.forEach(screenshot => {
                console.log(`   - ${screenshot}`);
            });
        }
        
        return report;
    }

    async run() {
        await this.init();
        
        try {
            // Step 1: Check server
            const serverOk = await this.checkServerConnection();
            if (!serverOk) {
                console.log('\n❌ Cannot proceed - development server not running');
                return;
            }
            
            // Step 2: Login
            const loginOk = await this.loginAsAdmin();
            if (!loginOk) {
                console.log('\n❌ Cannot proceed - admin login failed');
                return;
            }
            
            // Step 3: Navigate to user management
            const navOk = await this.navigateToUserManagement();
            if (!navOk) {
                console.log('\n❌ Cannot proceed - user management navigation failed');
                return;
            }
            
            // Step 4: Analyze interface
            await this.findAndAnalyzeUserInterface();
            
            // Step 5: Generate report
            await this.generateOverflowReport();
            
        } catch (error) {
            console.error('\n❌ Test failed:', error);
            await this.screenshot('error-final', 'Final error state');
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the overflow test
const tester = new OverflowTester();
tester.run().catch(console.error);
