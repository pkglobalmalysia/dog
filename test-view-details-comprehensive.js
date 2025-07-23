const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Specialized test for View Details student features
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    headless: false,
    slowMo: 1200, // Very slow for detailed observation
    timeout: 60000, // Longer timeout
    screenshots: true,
    screenshotDir: './view-details-test',
    
    // Admin credentials
    adminEmail: 'ceo@pkibs.com',
    adminPassword: 'PKibs@@11'
};

class ViewDetailsFeatureTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.findings = [];
        this.screenshotCounter = 0;
    }

    async init() {
        console.log('🎯 VIEW DETAILS STUDENT FEATURES - COMPREHENSIVE TEST');
        console.log('====================================================');
        console.log('🔍 Target: Testing all View Details functionalities');
        console.log('🎨 Focus: Course assignment overflow and design issues');
        console.log('👤 Admin: ceo@pkibs.com');
        console.log('');
        
        // Create screenshots directory
        if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }

        // Launch browser with settings for detailed testing
        this.browser = await puppeteer.launch({
            headless: TEST_CONFIG.headless,
            slowMo: TEST_CONFIG.slowMo,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setDefaultTimeout(TEST_CONFIG.timeout);
        
        // Monitor console for errors
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('🔍 Console Error:', msg.text());
                this.addFinding('Console Error', 'error', msg.text());
            }
        });

        // Monitor network for failed requests
        this.page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`🔍 HTTP ${response.status()}: ${response.url()}`);
                this.addFinding('Network Error', 'warning', `${response.status()} - ${response.url()}`);
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

    addFinding(category, type, description, details = null) {
        const finding = {
            category,
            type, // 'success', 'warning', 'error', 'info'
            description,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.findings.push(finding);
        
        const emoji = {
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'info': '💡'
        };
        
        console.log(`${emoji[type]} ${category}: ${description}`);
        if (details) {
            console.log(`   Details: ${details}`);
        }
    }

    async testServerConnection() {
        console.log('🌐 Step 1: Testing server connection...');
        
        try {
            const response = await this.page.goto(TEST_CONFIG.baseUrl, { 
                waitUntil: 'networkidle0',
                timeout: 15000
            });
            
            if (response && response.ok()) {
                this.addFinding('Server Connection', 'success', 'Development server is running correctly');
                await this.screenshot('01-homepage', 'Homepage loaded successfully');
                return true;
            } else {
                this.addFinding('Server Connection', 'error', 'Server not responding correctly');
                return false;
            }
        } catch (error) {
            this.addFinding('Server Connection', 'error', 'Cannot connect to development server', 'Make sure npm run dev is running');
            return false;
        }
    }

    async loginAsAdmin() {
        console.log('🔐 Step 2: Testing admin login...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/login`);
            await this.screenshot('02-login-page', 'Login page loaded');
            
            // Wait for login form
            await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
            
            // Fill login form
            await this.page.click('input[type="email"]', { clickCount: 3 });
            await this.page.type('input[type="email"]', TEST_CONFIG.adminEmail);
            
            await this.page.click('input[type="password"]', { clickCount: 3 });
            await this.page.type('input[type="password"]', TEST_CONFIG.adminPassword);
            
            await this.screenshot('03-login-filled', 'Admin credentials entered');
            
            // Submit and wait for navigation
            await Promise.all([
                this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }),
                this.page.click('button[type="submit"]')
            ]);
            
            await this.screenshot('04-after-login', 'After login attempt');
            
            const currentUrl = this.page.url();
            console.log(`Current URL: ${currentUrl}`);
            
            if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
                this.addFinding('Admin Login', 'success', 'Successfully logged in as admin');
                return true;
            } else {
                this.addFinding('Admin Login', 'error', 'Login failed - check credentials');
                return false;
            }
        } catch (error) {
            this.addFinding('Admin Login', 'error', 'Login process failed', error.message);
            return false;
        }
    }

    async navigateToUserManagement() {
        console.log('👥 Step 3: Navigating to User Management...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/admin/user-management`);
            await this.page.waitForTimeout(5000); // Give page time to load completely
            
            await this.screenshot('05-user-management', 'User Management page loaded');
            
            // Check page title and content
            const title = await this.page.title();
            const url = this.page.url();
            
            console.log(`Page title: "${title}"`);
            console.log(`Current URL: ${url}`);
            
            // Check if page contains user management elements
            const pageAnalysis = await this.page.evaluate(() => {
                const text = document.body.textContent.toLowerCase();
                return {
                    hasUsers: text.includes('user') || text.includes('student'),
                    hasManagement: text.includes('management'),
                    hasTable: document.querySelector('table') !== null,
                    hasButtons: document.querySelectorAll('button').length,
                    hasViewDetails: text.includes('view') && text.includes('details'),
                    bodyText: text.substring(0, 200)
                };
            });
            
            console.log('Page analysis:', pageAnalysis);
            
            if (pageAnalysis.hasUsers || pageAnalysis.hasTable) {
                this.addFinding('Navigation', 'success', 'User Management page loaded successfully');
                return true;
            } else {
                this.addFinding('Navigation', 'warning', 'Page loaded but content unclear');
                return true; // Continue anyway
            }
        } catch (error) {
            this.addFinding('Navigation', 'error', 'Failed to navigate to user management', error.message);
            return false;
        }
    }

    async analyzeUserInterface() {
        console.log('🔍 Step 4: Analyzing user interface...');
        
        try {
            // Take full page screenshot
            await this.screenshot('06-full-interface', 'Complete user management interface');
            
            // Analyze page structure
            const interfaceAnalysis = await this.page.evaluate(() => {
                return {
                    totalElements: document.querySelectorAll('*').length,
                    buttons: document.querySelectorAll('button').length,
                    links: document.querySelectorAll('a').length,
                    forms: document.querySelectorAll('form').length,
                    tables: document.querySelectorAll('table').length,
                    modals: document.querySelectorAll('.modal, .dialog, [role="dialog"]').length,
                    hasOverflow: document.body.scrollWidth > window.innerWidth
                };
            });
            
            console.log('Interface analysis:', interfaceAnalysis);
            
            if (interfaceAnalysis.hasOverflow) {
                this.addFinding('Layout', 'warning', 'Page has horizontal overflow detected');
            }
            
            this.addFinding('Interface Analysis', 'info', `Found ${interfaceAnalysis.buttons} buttons, ${interfaceAnalysis.tables} tables`);
            
            return interfaceAnalysis;
        } catch (error) {
            this.addFinding('Interface Analysis', 'error', 'Failed to analyze interface', error.message);
            return null;
        }
    }

    async findAndTestViewDetailsButtons() {
        console.log('🎯 Step 5: Finding and testing View Details buttons...');
        
        try {
            // Multiple strategies to find View Details buttons
            const searchStrategies = [
                'button:has-text("View Details")',
                'button:has-text("View")',
                'button:has-text("Details")',
                'a:has-text("View Details")',
                'a:has-text("View")',
                '.view-details',
                '[data-action="view"]',
                'button[class*="view"]',
                '.btn:has-text("View")'
            ];
            
            let viewDetailsButtons = [];
            
            // Try each strategy
            for (let strategy of searchStrategies) {
                try {
                    const buttons = await this.page.$$(strategy);
                    if (buttons.length > 0) {
                        viewDetailsButtons = buttons;
                        console.log(`✅ Found ${buttons.length} View Details buttons using: ${strategy}`);
                        break;
                    }
                } catch (error) {
                    // Strategy might not work, continue
                }
            }
            
            // If no specific buttons found, look for any clickable elements
            if (viewDetailsButtons.length === 0) {
                console.log('🔍 No specific View Details buttons found, searching all clickable elements...');
                
                const allClickable = await this.page.$$('button, a, .btn, [role="button"], td[class*="cursor"], tr[class*="hover"]');
                
                for (let element of allClickable) {
                    const text = await element.evaluate(el => el.textContent?.toLowerCase().trim() || '');
                    const className = await element.evaluate(el => el.className || '');
                    
                    if (text.includes('view') || text.includes('details') || 
                        className.includes('view') || className.includes('details')) {
                        viewDetailsButtons.push(element);
                    }
                }
                
                console.log(`Found ${viewDetailsButtons.length} potential View Details elements`);
            }
            
            if (viewDetailsButtons.length === 0) {
                this.addFinding('View Details Search', 'error', 'No View Details buttons found');
                
                // Log all buttons found for debugging
                const allButtons = await this.page.$$('button, a, .btn');
                console.log(`Found ${allButtons.length} total clickable elements`);
                
                for (let i = 0; i < Math.min(5, allButtons.length); i++) {
                    const text = await allButtons[i].evaluate(el => el.textContent?.trim() || '');
                    const tag = await allButtons[i].evaluate(el => el.tagName);
                    console.log(`   ${tag}: "${text}"`);
                }
                
                return false;
            }
            
            // Test clicking the View Details buttons
            return await this.testViewDetailsButtonClicks(viewDetailsButtons);
            
        } catch (error) {
            this.addFinding('View Details Search', 'error', 'Error searching for View Details buttons', error.message);
            return false;
        }
    }

    async testViewDetailsButtonClicks(viewDetailsButtons) {
        console.log(`🖱️ Step 6: Testing ${viewDetailsButtons.length} View Details button clicks...`);
        
        let successfulClicks = 0;
        
        for (let i = 0; i < Math.min(3, viewDetailsButtons.length); i++) {
            const button = viewDetailsButtons[i];
            
            try {
                // Get button info
                const buttonInfo = await button.evaluate(el => ({
                    text: el.textContent?.trim() || '',
                    className: el.className || '',
                    tagName: el.tagName,
                    href: el.href || ''
                }));
                
                console.log(`   Testing button ${i + 1}: ${buttonInfo.tagName} - "${buttonInfo.text}"`);
                
                // Take screenshot before clicking
                await this.screenshot(`07-before-click-${i + 1}`, `Before clicking button ${i + 1}`);
                
                // Click the button
                await button.click();
                await this.page.waitForTimeout(3000); // Wait for modal/navigation
                
                // Take screenshot after clicking
                await this.screenshot(`08-after-click-${i + 1}`, `After clicking button ${i + 1}`);
                
                // Check what happened after clicking
                const afterClickAnalysis = await this.analyzeAfterClick();
                
                if (afterClickAnalysis.modalOpened) {
                    this.addFinding('View Details Click', 'success', `Button ${i + 1} opened a modal successfully`);
                    
                    // Analyze the modal content
                    await this.analyzeStudentDetailsModal(afterClickAnalysis.modalElement);
                    
                    // Close the modal
                    await this.closeModal();
                    
                    successfulClicks++;
                } else if (afterClickAnalysis.navigationOccurred) {
                    this.addFinding('View Details Click', 'success', `Button ${i + 1} navigated to details page`);
                    
                    // Analyze the details page
                    await this.analyzeStudentDetailsPage();
                    
                    // Go back to user management
                    await this.page.goBack();
                    await this.page.waitForTimeout(2000);
                    
                    successfulClicks++;
                } else {
                    this.addFinding('View Details Click', 'warning', `Button ${i + 1} click did not produce expected result`);
                }
                
            } catch (error) {
                this.addFinding('View Details Click', 'error', `Error clicking button ${i + 1}`, error.message);
            }
        }
        
        return successfulClicks > 0;
    }

    async analyzeAfterClick() {
        // Check if modal appeared
        const modalSelectors = [
            '.modal',
            '.dialog',
            '[role="dialog"]',
            '.student-details',
            '.user-details',
            '[data-testid*="modal"]',
            '[data-testid*="dialog"]',
            '.popup',
            '.overlay'
        ];
        
        let modalElement = null;
        for (let selector of modalSelectors) {
            modalElement = await this.page.$(selector);
            if (modalElement) {
                const isVisible = await modalElement.evaluate(el => {
                    const style = getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                });
                
                if (isVisible) {
                    return { modalOpened: true, modalElement, navigationOccurred: false };
                }
            }
        }
        
        // Check if navigation occurred
        const currentUrl = this.page.url();
        const navigationOccurred = !currentUrl.endsWith('/admin/user-management');
        
        return { modalOpened: false, modalElement: null, navigationOccurred };
    }

    async analyzeStudentDetailsModal(modalElement) {
        console.log('📋 Step 7: Analyzing Student Details Modal...');
        
        try {
            // Take detailed screenshot of modal
            await modalElement.screenshot({ 
                path: path.join(TEST_CONFIG.screenshotDir, 'modal-details.png')
            });
            
            // Get modal dimensions and check for overflow
            const modalAnalysis = await modalElement.evaluate(el => {
                const rect = el.getBoundingClientRect();
                const style = getComputedStyle(el);
                
                return {
                    width: rect.width,
                    height: rect.height,
                    x: rect.x,
                    y: rect.y,
                    scrollWidth: el.scrollWidth,
                    scrollHeight: el.scrollHeight,
                    overflow: style.overflow,
                    overflowX: style.overflowX,
                    overflowY: style.overflowY,
                    hasHorizontalOverflow: el.scrollWidth > rect.width,
                    hasVerticalOverflow: el.scrollHeight > rect.height
                };
            });
            
            console.log('Modal analysis:', modalAnalysis);
            
            // Check for overflow issues
            if (modalAnalysis.hasHorizontalOverflow) {
                this.addFinding('Modal Overflow', 'error', 
                    `Modal has horizontal overflow: content ${modalAnalysis.scrollWidth}px > container ${modalAnalysis.width}px`,
                    'This is likely causing the design issues you mentioned'
                );
            }
            
            if (modalAnalysis.hasVerticalOverflow) {
                this.addFinding('Modal Overflow', 'warning', 
                    `Modal has vertical overflow: content ${modalAnalysis.scrollHeight}px > container ${modalAnalysis.height}px`
                );
            }
            
            // Look for course assignment section specifically
            await this.analyzeCourseAssignmentInModal(modalElement);
            
            // Look for other form elements that might cause overflow
            await this.analyzeFormElementsInModal(modalElement);
            
        } catch (error) {
            this.addFinding('Modal Analysis', 'error', 'Error analyzing modal', error.message);
        }
    }

    async analyzeCourseAssignmentInModal(modalElement) {
        console.log('🎯 Analyzing Course Assignment section in modal...');
        
        try {
            // Look for course assignment elements
            const courseElements = await modalElement.$$('select, .select, .dropdown, input[name*="course"], [class*="course"], [id*="course"]');
            
            console.log(`Found ${courseElements.length} course-related elements in modal`);
            
            for (let i = 0; i < courseElements.length; i++) {
                const element = courseElements[i];
                
                // Get element details
                const elementAnalysis = await element.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    const style = getComputedStyle(el);
                    
                    return {
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        name: el.name,
                        width: rect.width,
                        height: rect.height,
                        x: rect.x,
                        y: rect.y,
                        overflow: style.overflow,
                        overflowX: style.overflowX,
                        overflowY: style.overflowY,
                        display: style.display,
                        position: style.position,
                        zIndex: style.zIndex
                    };
                });
                
                console.log(`Course element ${i + 1}:`, elementAnalysis);
                
                // Take screenshot of the element
                await element.screenshot({ 
                    path: path.join(TEST_CONFIG.screenshotDir, `course-element-${i + 1}.png`)
                });
                
                // Check for specific issues
                if (elementAnalysis.width > 400) {
                    this.addFinding('Course Element Overflow', 'warning', 
                        `Course element ${i + 1} is very wide (${elementAnalysis.width}px)`,
                        'This might cause horizontal overflow in the modal'
                    );
                }
                
                if (elementAnalysis.x < 0 || elementAnalysis.y < 0) {
                    this.addFinding('Course Element Position', 'error', 
                        `Course element ${i + 1} positioned outside viewport`,
                        `Position: x=${elementAnalysis.x}, y=${elementAnalysis.y}`
                    );
                }
                
                // If it's a select element, analyze its options
                if (elementAnalysis.tagName === 'SELECT') {
                    await this.analyzeSelectDropdown(element);
                }
            }
            
            // Look for "Assign New Course" text specifically
            const hasAssignText = await modalElement.evaluate(el => {
                const text = el.textContent.toLowerCase();
                return {
                    hasAssign: text.includes('assign'),
                    hasCourse: text.includes('course'),
                    hasNew: text.includes('new'),
                    assignCourseText: text.includes('assign') && text.includes('course')
                };
            });
            
            if (hasAssignText.assignCourseText) {
                this.addFinding('Course Assignment Feature', 'success', 
                    'Found "Assign Course" functionality in modal'
                );
                await this.screenshot('course-assignment-found', 'Course assignment section located');
            } else {
                this.addFinding('Course Assignment Feature', 'warning', 
                    'Could not find "Assign Course" text in modal'
                );
            }
            
        } catch (error) {
            this.addFinding('Course Assignment Analysis', 'error', 'Error analyzing course assignment', error.message);
        }
    }

    async analyzeSelectDropdown(selectElement) {
        console.log('   📋 Analyzing select dropdown...');
        
        try {
            // Click to open dropdown
            await selectElement.click();
            await this.page.waitForTimeout(1000);
            
            // Take screenshot of opened dropdown
            await this.screenshot('dropdown-opened', 'Course dropdown opened');
            
            // Get options
            const options = await selectElement.$$eval('option', options => 
                options.map(opt => ({
                    value: opt.value,
                    text: opt.textContent.trim(),
                    disabled: opt.disabled
                }))
            );
            
            console.log(`   Found ${options.length} options in dropdown`);
            
            // Check for very long option text
            for (let option of options) {
                if (option.text.length > 50) {
                    this.addFinding('Dropdown Content', 'warning', 
                        `Very long dropdown option: "${option.text.substring(0, 50)}..." (${option.text.length} chars)`,
                        'Long text might cause overflow in dropdown'
                    );
                }
            }
            
            // Click elsewhere to close dropdown
            await this.page.click('body');
            await this.page.waitForTimeout(500);
            
        } catch (error) {
            console.log('   Error analyzing dropdown:', error.message);
        }
    }

    async analyzeFormElementsInModal(modalElement) {
        console.log('📝 Analyzing all form elements in modal...');
        
        try {
            const formElements = await modalElement.$$('input, select, textarea, button, .form-control');
            
            console.log(`Found ${formElements.length} form elements in modal`);
            
            for (let i = 0; i < Math.min(10, formElements.length); i++) {
                const element = formElements[i];
                
                const elementInfo = await element.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    const style = getComputedStyle(el);
                    
                    return {
                        tagName: el.tagName,
                        type: el.type || '',
                        name: el.name || '',
                        placeholder: el.placeholder || '',
                        className: el.className || '',
                        width: rect.width,
                        height: rect.height,
                        marginLeft: style.marginLeft,
                        marginRight: style.marginRight,
                        padding: style.padding
                    };
                });
                
                // Check for elements that might cause overflow
                if (elementInfo.width > 300) {
                    this.addFinding('Form Element Width', 'info', 
                        `${elementInfo.tagName} element is wide: ${elementInfo.width}px`
                    );
                }
            }
            
        } catch (error) {
            this.addFinding('Form Analysis', 'error', 'Error analyzing form elements', error.message);
        }
    }

    async analyzeStudentDetailsPage() {
        console.log('📄 Analyzing Student Details Page...');
        
        try {
            await this.screenshot('student-details-page', 'Student details page loaded');
            
            // Similar analysis as modal but for a full page
            const pageAnalysis = await this.page.evaluate(() => {
                return {
                    hasOverflow: document.body.scrollWidth > window.innerWidth,
                    pageWidth: document.body.scrollWidth,
                    viewportWidth: window.innerWidth,
                    hasCourseElements: document.querySelectorAll('[class*="course"], [id*="course"]').length,
                    hasAssignText: document.body.textContent.toLowerCase().includes('assign')
                };
            });
            
            console.log('Page analysis:', pageAnalysis);
            
            if (pageAnalysis.hasOverflow) {
                this.addFinding('Page Overflow', 'error', 
                    `Student details page has horizontal overflow: ${pageAnalysis.pageWidth}px > ${pageAnalysis.viewportWidth}px`
                );
            }
            
        } catch (error) {
            this.addFinding('Page Analysis', 'error', 'Error analyzing details page', error.message);
        }
    }

    async closeModal() {
        try {
            // Try multiple ways to close modal
            const closeSelectors = [
                '.modal .close',
                '.dialog .close',
                '[data-dismiss="modal"]',
                '.modal-close',
                '.dialog-close',
                'button:has-text("Close")',
                'button:has-text("Cancel")',
                '.modal-backdrop',
                '[aria-label="Close"]'
            ];
            
            for (let selector of closeSelectors) {
                try {
                    const closeButton = await this.page.$(selector);
                    if (closeButton) {
                        await closeButton.click();
                        await this.page.waitForTimeout(1000);
                        return;
                    }
                } catch (error) {
                    // Continue to next method
                }
            }
            
            // Press Escape key
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(1000);
            
        } catch (error) {
            // Ignore errors in closing
        }
    }

    async generateComprehensiveReport() {
        console.log('\n📊 GENERATING COMPREHENSIVE VIEW DETAILS TEST REPORT');
        console.log('====================================================');
        
        const successes = this.findings.filter(f => f.type === 'success');
        const warnings = this.findings.filter(f => f.type === 'warning');
        const errors = this.findings.filter(f => f.type === 'error');
        const infos = this.findings.filter(f => f.type === 'info');
        
        const report = {
            timestamp: new Date().toISOString(),
            testTarget: '/admin/user-management - View Details Features',
            adminCredentials: TEST_CONFIG.adminEmail,
            summary: {
                total: this.findings.length,
                successes: successes.length,
                warnings: warnings.length,
                errors: errors.length,
                infos: infos.length
            },
            findings: this.findings,
            screenshots: fs.readdirSync(TEST_CONFIG.screenshotDir).filter(f => f.endsWith('.png')),
            overflowIssues: this.findings.filter(f => f.category.includes('Overflow')),
            courseAssignmentIssues: this.findings.filter(f => f.category.includes('Course')),
            recommendations: this.generateRecommendations()
        };
        
        // Save comprehensive report
        fs.writeFileSync('./view-details-test-report.json', JSON.stringify(report, null, 2));
        
        // Generate HTML report
        await this.generateHTMLReport(report);
        
        // Print summary
        console.log(`\n📋 TEST SUMMARY`);
        console.log(`===============`);
        console.log(`✅ Successes: ${successes.length}`);
        console.log(`⚠️  Warnings: ${warnings.length}`);
        console.log(`❌ Errors: ${errors.length}`);
        console.log(`💡 Info: ${infos.length}`);
        console.log(`📊 Total: ${this.findings.length}`);
        
        if (errors.length > 0) {
            console.log(`\n❌ CRITICAL ISSUES FOUND:`);
            errors.forEach(error => {
                console.log(`   - ${error.description}`);
            });
        }
        
        if (report.overflowIssues.length > 0) {
            console.log(`\n🚨 OVERFLOW ISSUES DETECTED: ${report.overflowIssues.length}`);
            report.overflowIssues.forEach(issue => {
                console.log(`   - ${issue.description}`);
            });
        }
        
        console.log(`\n📄 Reports saved:`);
        console.log(`   - JSON: view-details-test-report.json`);
        console.log(`   - HTML: view-details-report.html`);
        console.log(`   - Screenshots: ${TEST_CONFIG.screenshotDir}/ (${report.screenshots.length} files)`);
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.findings.some(f => f.category.includes('Overflow'))) {
            recommendations.push('🔧 Fix modal/container overflow by adding CSS constraints: max-width, overflow: hidden/auto');
            recommendations.push('📐 Ensure form elements have proper width limits within modals');
        }
        
        if (this.findings.some(f => f.category.includes('Course'))) {
            recommendations.push('🎯 Optimize course assignment dropdown width and positioning');
            recommendations.push('📝 Consider truncating long course names or using tooltips');
        }
        
        if (this.findings.some(f => f.type === 'error' && f.category.includes('View Details'))) {
            recommendations.push('🔗 Fix View Details button functionality and modal opening');
        }
        
        if (this.findings.some(f => f.category.includes('Modal'))) {
            recommendations.push('📱 Implement responsive modal design for different screen sizes');
            recommendations.push('🎨 Review modal CSS for proper container constraints');
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
    <title>View Details Features Test Report</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 0.9em; text-transform: uppercase; color: #666; }
        .summary-card .value { font-size: 2.2em; font-weight: bold; margin: 10px 0; }
        .success { color: #27ae60; }
        .warning { color: #f39c12; }
        .error { color: #e74c3c; }
        .info { color: #3498db; }
        .total { color: #9b59b6; }
        .findings { background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 30px; }
        .findings-header { background: #f8f9fa; padding: 20px; border-bottom: 1px solid #e9ecef; }
        .finding-item { padding: 15px 20px; border-bottom: 1px solid #f1f3f4; }
        .finding-item:last-child { border-bottom: none; }
        .finding-header { display: flex; align-items: center; margin-bottom: 8px; }
        .type-badge { padding: 3px 10px; border-radius: 15px; font-size: 0.8em; font-weight: 600; margin-right: 12px; }
        .type-success { background: #d5f4e6; color: #27ae60; }
        .type-warning { background: #fef9e7; color: #f39c12; }
        .type-error { background: #fdf2f2; color: #e74c3c; }
        .type-info { background: #ebf8ff; color: #3498db; }
        .category { background: #f8f9fa; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; color: #666; }
        .finding-description { color: #333; margin: 8px 0; }
        .finding-details { background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 8px; font-size: 0.9em; color: #666; }
        .screenshots { background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 30px; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .screenshot-item { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .recommendations { background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding: 20px; }
        .recommendations ul { padding-left: 0; list-style: none; }
        .recommendations li { background: #f8f9fa; margin-bottom: 10px; padding: 12px; border-radius: 5px; border-left: 4px solid #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 View Details Features Test Report</h1>
            <p>Comprehensive analysis of View Details functionality and overflow issues</p>
            <p><small>Generated on ${new Date().toLocaleString()}</small></p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Findings</h3>
                <div class="value total">${report.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Successes</h3>
                <div class="value success">${report.summary.successes}</div>
            </div>
            <div class="summary-card">
                <h3>Warnings</h3>
                <div class="value warning">${report.summary.warnings}</div>
            </div>
            <div class="summary-card">
                <h3>Errors</h3>
                <div class="value error">${report.summary.errors}</div>
            </div>
            <div class="summary-card">
                <h3>Info</h3>
                <div class="value info">${report.summary.infos}</div>
            </div>
        </div>

        <div class="findings">
            <div class="findings-header">
                <h2>🔍 Detailed Findings</h2>
            </div>
            ${report.findings.map(finding => `
                <div class="finding-item">
                    <div class="finding-header">
                        <span class="type-badge type-${finding.type}">${finding.type.toUpperCase()}</span>
                        <span class="category">${finding.category}</span>
                    </div>
                    <div class="finding-description">${finding.description}</div>
                    ${finding.details ? `<div class="finding-details">${finding.details}</div>` : ''}
                </div>
            `).join('')}
        </div>

        <div class="screenshots">
            <h2>📸 Test Screenshots (${report.screenshots.length})</h2>
            <div class="screenshot-grid">
                ${report.screenshots.map(screenshot => `
                    <div class="screenshot-item">
                        <strong>${screenshot}</strong>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="recommendations">
            <h2>💡 Recommendations</h2>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;

        fs.writeFileSync('./view-details-report.html', html);
    }

    async run() {
        await this.init();
        
        try {
            // Step-by-step testing
            const serverOk = await this.testServerConnection();
            if (!serverOk) return;
            
            const loginOk = await this.loginAsAdmin();
            if (!loginOk) return;
            
            const navOk = await this.navigateToUserManagement();
            if (!navOk) return;
            
            await this.analyzeUserInterface();
            await this.findAndTestViewDetailsButtons();
            
            // Generate comprehensive report
            await this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('\n❌ Test failed:', error);
            this.addFinding('Test Execution', 'error', 'Test suite crashed', error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the comprehensive View Details test
const tester = new ViewDetailsFeatureTester();
tester.run().catch(console.error);
