const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration for UI design issues
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    headless: false, // Keep visible to see design issues
    slowMo: 800, // Slower for better observation
    timeout: 30000,
    screenshots: true,
    screenshotDir: './ui-test-screenshots',
    
    // Admin credentials
    adminEmail: 'ceo@pkibs.com',
    adminPassword: 'PKibs@@11'
};

class UIDesignTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.issues = [];
        this.screenshotCounter = 0;
    }

    async init() {
        console.log('🎨 Starting UI Design Test for User Management...\n');
        console.log('🔍 Focus: Design & Overflow Issues in "Assign New Course" Section\n');
        
        // Create screenshots directory
        if (TEST_CONFIG.screenshots && !fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }

        // Launch browser with specific settings for UI testing
        this.browser = await puppeteer.launch({
            headless: TEST_CONFIG.headless,
            slowMo: TEST_CONFIG.slowMo,
            defaultViewport: { width: 1920, height: 1080 },
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--start-maximized'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set timeouts
        this.page.setDefaultTimeout(TEST_CONFIG.timeout);
        this.page.setDefaultNavigationTimeout(TEST_CONFIG.timeout);

        // Listen for console errors
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('🔍 Browser Console Error:', msg.text());
            }
        });
    }

    async screenshot(name, element = null) {
        if (TEST_CONFIG.screenshots) {
            const filename = `${String(++this.screenshotCounter).padStart(2, '0')}-${name}.png`;
            const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
            
            if (element) {
                await element.screenshot({ path: filepath });
            } else {
                await this.page.screenshot({ path: filepath, fullPage: true });
            }
            console.log(`   📸 Screenshot: ${filename}`);
        }
    }

    async addIssue(category, severity, description, element = null, suggestion = null) {
        const issue = {
            category,
            severity, // 'critical', 'major', 'minor'
            description,
            suggestion,
            timestamp: new Date().toISOString(),
            screenshot: element ? `issue-${this.issues.length + 1}.png` : null
        };
        
        this.issues.push(issue);
        
        const severityEmoji = {
            'critical': '🚨',
            'major': '⚠️',
            'minor': '💡'
        };
        
        console.log(`${severityEmoji[severity]} ${severity.toUpperCase()} | ${category}`);
        console.log(`   ${description}`);
        if (suggestion) {
            console.log(`   💡 Suggestion: ${suggestion}`);
        }
        
        // Take specific screenshot of the problematic element
        if (element) {
            const issueScreenshot = path.join(TEST_CONFIG.screenshotDir, issue.screenshot);
            await element.screenshot({ path: issueScreenshot });
            console.log(`   📸 Issue screenshot: ${issue.screenshot}`);
        }
        console.log('');
    }

    // Login to admin interface
    async loginAsAdmin() {
        console.log('🔐 Logging in as admin...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/login`);
            await this.screenshot('01-login-page');
            
            // Wait for and fill login form
            await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
            await this.page.type('input[type="email"]', TEST_CONFIG.adminEmail);
            await this.page.type('input[type="password"]', TEST_CONFIG.adminPassword);
            
            await this.screenshot('02-login-filled');
            
            // Submit form
            await Promise.all([
                this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
                this.page.click('button[type="submit"]')
            ]);
            
            await this.screenshot('03-after-login');
            
            const currentUrl = this.page.url();
            if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
                console.log('✅ Successfully logged in as admin\n');
                return true;
            } else {
                console.log('❌ Login failed - check credentials\n');
                return false;
            }
        } catch (error) {
            console.log('❌ Login error:', error.message);
            return false;
        }
    }

    // Navigate to user management and analyze the interface
    async analyzeUserManagement() {
        console.log('👥 Analyzing User Management Interface...');
        
        try {
            await this.page.goto(`${TEST_CONFIG.baseUrl}/admin/user-management`);
            await this.page.waitForTimeout(3000); // Let page fully load
            await this.screenshot('04-user-management-page');
            
            // Check overall page layout
            await this.checkPageLayout();
            
            // Find and analyze View Details buttons
            await this.analyzeViewDetailsButtons();
            
            // Test opening student details modal
            await this.testStudentDetailsModal();
            
        } catch (error) {
            console.log('❌ Error analyzing user management:', error.message);
        }
    }

    async checkPageLayout() {
        console.log('📐 Checking overall page layout...');
        
        // Check for horizontal scrollbars
        const hasHorizontalScroll = await this.page.evaluate(() => {
            return document.body.scrollWidth > document.body.clientWidth;
        });
        
        if (hasHorizontalScroll) {
            await this.addIssue(
                'Layout',
                'major',
                'Page has horizontal scrollbar indicating overflow issues',
                null,
                'Check container widths and ensure responsive design'
            );
        }
        
        // Check viewport width usage
        const pageWidth = await this.page.evaluate(() => document.body.scrollWidth);
        console.log(`   Page width: ${pageWidth}px`);
    }

    async analyzeViewDetailsButtons() {
        console.log('🔍 Analyzing View Details buttons...');
        
        // Find all View Details buttons
        const viewButtons = await this.page.$$('button:has-text("View Details"), button[class*="view"], a[href*="view"]');
        
        if (viewButtons.length === 0) {
            // Try different selectors
            const alternativeButtons = await this.page.$$('button, .btn, [role="button"]');
            const viewDetailsButtons = [];
            
            for (let button of alternativeButtons) {
                const text = await button.evaluate(el => el.textContent || el.innerHTML);
                if (text.toLowerCase().includes('view') || text.toLowerCase().includes('details')) {
                    viewDetailsButtons.push(button);
                }
            }
            
            console.log(`   Found ${viewDetailsButtons.length} potential View Details buttons`);
            return viewDetailsButtons;
        }
        
        console.log(`   Found ${viewButtons.length} View Details buttons`);
        return viewButtons;
    }

    async testStudentDetailsModal() {
        console.log('🎯 Testing Student Details Modal (Focus: Course Assignment)...');
        
        try {
            // Look for any clickable element that might open student details
            const clickableElements = await this.page.$$('button, .btn, [role="button"], td[class*="cursor"], tr[class*="cursor"]');
            
            let modalOpened = false;
            
            for (let element of clickableElements.slice(0, 5)) { // Test first 5 elements
                const text = await element.evaluate(el => el.textContent?.toLowerCase() || '');
                const classes = await element.evaluate(el => el.className || '');
                
                if (text.includes('view') || text.includes('details') || classes.includes('view')) {
                    console.log(`   Trying to click element with text: "${text.substring(0, 50)}..."`);
                    
                    try {
                        await element.click();
                        await this.page.waitForTimeout(2000);
                        
                        // Check if modal or new content appeared
                        const modalElements = await this.page.$$('.modal, .dialog, [role="dialog"], .student-details, .user-details');
                        
                        if (modalElements.length > 0) {
                            modalOpened = true;
                            await this.screenshot('05-student-details-opened');
                            await this.analyzeCourseAssignmentSection();
                            break;
                        }
                    } catch (error) {
                        console.log(`     Failed to click: ${error.message}`);
                    }
                }
            }
            
            if (!modalOpened) {
                await this.addIssue(
                    'Navigation',
                    'major',
                    'Could not open student details modal - View Details functionality may be broken',
                    null,
                    'Check if View Details buttons are properly implemented and working'
                );
            }
            
        } catch (error) {
            console.log('❌ Error testing student details modal:', error.message);
        }
    }

    async analyzeCourseAssignmentSection() {
        console.log('📚 Analyzing Course Assignment Section...');
        
        try {
            // Look for course assignment elements
            const courseElements = await this.page.$$('select, .select, .dropdown, [class*="course"], [id*="course"]');
            
            for (let i = 0; i < courseElements.length; i++) {
                const element = courseElements[i];
                await this.screenshot(`06-course-element-${i + 1}`, element);
                
                // Check element dimensions and positioning
                const elementInfo = await element.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    
                    return {
                        width: rect.width,
                        height: rect.height,
                        x: rect.x,
                        y: rect.y,
                        overflow: computedStyle.overflow,
                        overflowX: computedStyle.overflowX,
                        overflowY: computedStyle.overflowY,
                        position: computedStyle.position,
                        zIndex: computedStyle.zIndex,
                        display: computedStyle.display,
                        className: el.className,
                        id: el.id,
                        tagName: el.tagName
                    };
                });
                
                console.log(`   Element ${i + 1} info:`, elementInfo);
                
                // Check for overflow issues
                await this.checkElementOverflow(element, elementInfo, `Course Element ${i + 1}`);
                
                // If it's a select element, check its options
                if (elementInfo.tagName === 'SELECT') {
                    await this.analyzeSelectOptions(element);
                }
            }
            
            // Look for the specific "Assign New Course" section
            await this.findAssignNewCourseSection();
            
        } catch (error) {
            console.log('❌ Error analyzing course assignment:', error.message);
        }
    }

    async checkElementOverflow(element, elementInfo, elementName) {
        // Check if element is too wide for its container
        if (elementInfo.width > 1920) { // Wider than viewport
            await this.addIssue(
                'Overflow',
                'major',
                `${elementName} is too wide (${elementInfo.width}px) causing horizontal overflow`,
                element,
                'Add max-width and overflow handling to the element'
            );
        }
        
        // Check if element is positioned off-screen
        if (elementInfo.x < 0 || elementInfo.y < 0) {
            await this.addIssue(
                'Positioning',
                'major',
                `${elementName} is positioned outside viewport (x:${elementInfo.x}, y:${elementInfo.y})`,
                element,
                'Check CSS positioning and ensure element stays within bounds'
            );
        }
        
        // Check overflow styles
        if (elementInfo.overflow === 'visible' && (elementInfo.width > 500 || elementInfo.height > 200)) {
            await this.addIssue(
                'CSS',
                'minor',
                `${elementName} has overflow:visible which might cause layout issues`,
                element,
                'Consider using overflow:hidden or overflow:auto for better control'
            );
        }
    }

    async analyzeSelectOptions(selectElement) {
        console.log('   📋 Analyzing select dropdown options...');
        
        try {
            // Click to open dropdown
            await selectElement.click();
            await this.page.waitForTimeout(1000);
            await this.screenshot('07-dropdown-opened', selectElement);
            
            // Get options
            const options = await selectElement.$$eval('option', options => 
                options.map(opt => ({
                    value: opt.value,
                    text: opt.textContent.trim(),
                    disabled: opt.disabled
                }))
            );
            
            console.log(`     Found ${options.length} options in dropdown`);
            
            // Check for very long option text that might cause overflow
            for (let option of options) {
                if (option.text.length > 50) {
                    await this.addIssue(
                        'Content',
                        'minor',
                        `Dropdown option text is very long: "${option.text.substring(0, 50)}..." (${option.text.length} chars)`,
                        selectElement,
                        'Consider truncating long option text or use tooltips'
                    );
                }
            }
            
            // Click elsewhere to close dropdown
            await this.page.click('body');
            await this.page.waitForTimeout(500);
            
        } catch (error) {
            console.log('     Error analyzing dropdown options:', error.message);
        }
    }

    async findAssignNewCourseSection() {
        console.log('🎯 Looking for "Assign New Course" section...');
        
        try {
            // Search for text containing "assign" and "course"
            const assignElements = await this.page.$$('*');
            let foundAssignSection = false;
            
            for (let element of assignElements) {
                const text = await element.evaluate(el => el.textContent?.toLowerCase() || '');
                
                if (text.includes('assign') && text.includes('course')) {
                    foundAssignSection = true;
                    console.log('   ✅ Found "Assign New Course" section');
                    
                    await this.screenshot('08-assign-course-section', element);
                    
                    // Get the container element info
                    const containerInfo = await element.evaluate(el => {
                        const rect = el.getBoundingClientRect();
                        const computedStyle = window.getComputedStyle(el);
                        
                        return {
                            width: rect.width,
                            height: rect.height,
                            x: rect.x,
                            y: rect.y,
                            scrollWidth: el.scrollWidth,
                            scrollHeight: el.scrollHeight,
                            className: el.className,
                            id: el.id,
                            tagName: el.tagName,
                            overflow: computedStyle.overflow,
                            overflowX: computedStyle.overflowX,
                            overflowY: computedStyle.overflowY
                        };
                    });
                    
                    console.log('   📐 Container info:', containerInfo);
                    
                    // Check for overflow in the assign course section
                    if (containerInfo.scrollWidth > containerInfo.width) {
                        await this.addIssue(
                            'Overflow',
                            'critical',
                            `"Assign New Course" section has horizontal overflow (content: ${containerInfo.scrollWidth}px, container: ${containerInfo.width}px)`,
                            element,
                            'Add proper CSS to handle overflow: overflow-x: auto or hidden, max-width constraints'
                        );
                    }
                    
                    if (containerInfo.scrollHeight > containerInfo.height) {
                        await this.addIssue(
                            'Overflow',
                            'major',
                            `"Assign New Course" section has vertical overflow (content: ${containerInfo.scrollHeight}px, container: ${containerInfo.height}px)`,
                            element,
                            'Add proper CSS to handle overflow: overflow-y: auto or scroll'
                        );
                    }
                    
                    // Analyze child elements within the assign section
                    await this.analyzeAssignSectionChildren(element);
                    
                    break;
                }
            }
            
            if (!foundAssignSection) {
                await this.addIssue(
                    'Missing Feature',
                    'major',
                    'Could not find "Assign New Course" section in the interface',
                    null,
                    'Ensure the course assignment feature is properly implemented and visible'
                );
            }
            
        } catch (error) {
            console.log('❌ Error finding assign course section:', error.message);
        }
    }

    async analyzeAssignSectionChildren(assignSection) {
        console.log('   🔍 Analyzing child elements in assign section...');
        
        try {
            const childElements = await assignSection.$$('*');
            
            for (let i = 0; i < Math.min(childElements.length, 10); i++) { // Limit to first 10 children
                const child = childElements[i];
                
                const childInfo = await child.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    
                    return {
                        tagName: el.tagName,
                        className: el.className,
                        width: rect.width,
                        height: rect.height,
                        x: rect.x,
                        y: rect.y,
                        display: computedStyle.display,
                        position: computedStyle.position,
                        overflow: computedStyle.overflow,
                        textContent: el.textContent?.substring(0, 50) || ''
                    };
                });
                
                // Check for elements positioned outside their container
                const parentInfo = await assignSection.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
                });
                
                if (childInfo.x < parentInfo.x || 
                    childInfo.x + childInfo.width > parentInfo.x + parentInfo.width) {
                    await this.addIssue(
                        'Child Overflow',
                        'major',
                        `Child element (${childInfo.tagName}) overflows horizontally outside assign section`,
                        child,
                        'Adjust child element width or parent container constraints'
                    );
                }
                
                if (childInfo.y < parentInfo.y || 
                    childInfo.y + childInfo.height > parentInfo.y + parentInfo.height) {
                    await this.addIssue(
                        'Child Overflow',
                        'minor',
                        `Child element (${childInfo.tagName}) overflows vertically outside assign section`,
                        child,
                        'Adjust child element height or parent container constraints'
                    );
                }
            }
            
        } catch (error) {
            console.log('     Error analyzing child elements:', error.message);
        }
    }

    // Test different viewport sizes to check responsiveness
    async testResponsiveDesign() {
        console.log('📱 Testing responsive design at different screen sizes...');
        
        const viewports = [
            { width: 1920, height: 1080, name: 'Desktop Large' },
            { width: 1366, height: 768, name: 'Desktop Medium' },
            { width: 1024, height: 768, name: 'Tablet Landscape' },
            { width: 768, height: 1024, name: 'Tablet Portrait' },
            { width: 375, height: 667, name: 'Mobile' }
        ];
        
        for (let viewport of viewports) {
            console.log(`   📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
            
            await this.page.setViewport({ width: viewport.width, height: viewport.height });
            await this.page.waitForTimeout(1000);
            
            await this.screenshot(`09-responsive-${viewport.name.toLowerCase().replace(' ', '-')}`);
            
            // Check for horizontal overflow at this viewport size
            const hasOverflow = await this.page.evaluate(() => {
                return document.body.scrollWidth > window.innerWidth;
            });
            
            if (hasOverflow) {
                await this.addIssue(
                    'Responsive',
                    'major',
                    `Layout breaks at ${viewport.name} size - horizontal overflow detected`,
                    null,
                    `Add responsive CSS breakpoints for ${viewport.width}px width`
                );
            }
        }
        
        // Reset to original viewport
        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    // Generate comprehensive UI issue report
    async generateUIReport() {
        console.log('\n📊 Generating UI Issue Report...');
        
        const critical = this.issues.filter(i => i.severity === 'critical');
        const major = this.issues.filter(i => i.severity === 'major');
        const minor = this.issues.filter(i => i.severity === 'minor');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.issues.length,
                critical: critical.length,
                major: major.length,
                minor: minor.length
            },
            issues: this.issues,
            recommendations: this.generateUIRecommendations()
        };
        
        // Save JSON report
        fs.writeFileSync('./ui-issues-report.json', JSON.stringify(report, null, 2));
        
        // Generate HTML report
        await this.generateUIHTMLReport(report);
        
        // Print summary
        console.log('\n🎨 UI DESIGN ISSUE SUMMARY');
        console.log('============================');
        console.log(`🚨 Critical Issues: ${critical.length}`);
        console.log(`⚠️  Major Issues: ${major.length}`);
        console.log(`💡 Minor Issues: ${minor.length}`);
        console.log(`📊 Total Issues: ${this.issues.length}`);
        
        if (critical.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES FOUND:');
            critical.forEach(issue => {
                console.log(`   - ${issue.description}`);
            });
        }
        
        console.log('\n📄 Reports saved:');
        console.log('   - JSON: ./ui-issues-report.json');
        console.log('   - HTML: ./ui-issues-report.html');
        console.log('   - Screenshots: ./ui-test-screenshots/');
        
        return report;
    }

    generateUIRecommendations() {
        const recommendations = [];
        
        if (this.issues.some(i => i.category === 'Overflow')) {
            recommendations.push('🔧 Fix overflow issues by adding proper CSS constraints (max-width, overflow handling)');
        }
        
        if (this.issues.some(i => i.category === 'Responsive')) {
            recommendations.push('📱 Implement responsive design breakpoints for different screen sizes');
        }
        
        if (this.issues.some(i => i.category === 'Positioning')) {
            recommendations.push('📐 Review CSS positioning to ensure elements stay within viewport bounds');
        }
        
        if (this.issues.some(i => i.category === 'Content')) {
            recommendations.push('📝 Handle long content text with truncation or proper wrapping');
        }
        
        if (this.issues.some(i => i.category === 'Navigation')) {
            recommendations.push('🔗 Fix navigation issues to ensure all interactive elements work properly');
        }
        
        return recommendations;
    }

    async generateUIHTMLReport(report) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI Design Issues Report - User Management</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .summary-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #666; font-size: 0.9em; text-transform: uppercase; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .critical { color: #e74c3c; }
        .major { color: #f39c12; }
        .minor { color: #3498db; }
        .total { color: #9b59b6; }
        .issues { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 30px; }
        .issues-header { background: #f8f9fa; padding: 25px; border-bottom: 1px solid #e9ecef; }
        .issue-item { padding: 20px 25px; border-bottom: 1px solid #f1f3f4; }
        .issue-item:last-child { border-bottom: none; }
        .issue-header { display: flex; align-items: center; margin-bottom: 10px; }
        .severity-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 600; text-transform: uppercase; margin-right: 15px; }
        .severity-critical { background: #fee; color: #e74c3c; border: 1px solid #e74c3c; }
        .severity-major { background: #fff8e1; color: #f39c12; border: 1px solid #f39c12; }
        .severity-minor { background: #e3f2fd; color: #3498db; border: 1px solid #3498db; }
        .issue-category { background: #f8f9fa; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; color: #666; }
        .issue-description { color: #333; margin: 10px 0; font-size: 1.1em; }
        .issue-suggestion { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; margin-top: 10px; }
        .recommendations { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 25px; }
        .recommendations h2 { margin-top: 0; color: #333; }
        .recommendations ul { padding-left: 0; list-style: none; }
        .recommendations li { background: #f8f9fa; margin-bottom: 12px; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 UI Design Issues Report</h1>
            <p>User Management Interface - Course Assignment Focus</p>
            <p><small>Generated on ${new Date().toLocaleString()}</small></p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Issues</h3>
                <div class="value total">${report.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Critical</h3>
                <div class="value critical">${report.summary.critical}</div>
            </div>
            <div class="summary-card">
                <h3>Major</h3>
                <div class="value major">${report.summary.major}</div>
            </div>
            <div class="summary-card">
                <h3>Minor</h3>
                <div class="value minor">${report.summary.minor}</div>
            </div>
        </div>

        <div class="issues">
            <div class="issues-header">
                <h2>🐛 Detected Issues</h2>
            </div>
            ${report.issues.map((issue, index) => `
                <div class="issue-item">
                    <div class="issue-header">
                        <span class="severity-badge severity-${issue.severity}">${issue.severity}</span>
                        <span class="issue-category">${issue.category}</span>
                    </div>
                    <div class="issue-description">${issue.description}</div>
                    ${issue.suggestion ? `
                        <div class="issue-suggestion">
                            <strong>💡 Suggestion:</strong> ${issue.suggestion}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        ${report.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>🛠️ Fix Recommendations</h2>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

        fs.writeFileSync('./ui-issues-report.html', html);
    }

    // Main test runner
    async runUITests() {
        await this.init();
        
        try {
            // Login first
            const loginSuccess = await this.loginAsAdmin();
            
            if (loginSuccess) {
                // Analyze user management interface
                await this.analyzeUserManagement();
                
                // Test responsive design
                await this.testResponsiveDesign();
            }
            
            // Generate comprehensive report
            await this.generateUIReport();
            
        } catch (error) {
            console.error('❌ UI test suite failed:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the UI tests
const uiTester = new UIDesignTester();
uiTester.runUITests().catch(console.error);

module.exports = UIDesignTester;
