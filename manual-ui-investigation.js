// Manual UI Investigation for View Details Overflow Issues
// Run this script while the development server is running on localhost:3000

const puppeteer = require('puppeteer');
const fs = require('fs');

async function manualUIInvestigation() {
    console.log('🔍 MANUAL UI INVESTIGATION - VIEW DETAILS OVERFLOW');
    console.log('=================================================');
    console.log('📍 Target: /admin/user-management');
    console.log('🎯 Focus: View Details overflow in course assignment');
    console.log('');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized', '--no-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Wait 10 seconds for manual server start
        console.log('⏰ Waiting 10 seconds for development server...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Try to connect to localhost:3000
        console.log('🌐 Attempting to connect to localhost:3000...');
        try {
            await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
            console.log('✅ Successfully connected to development server');
        } catch (error) {
            console.log('❌ Cannot connect to localhost:3000');
            console.log('💡 Please manually start: npm run dev');
            console.log('💡 Then run this script again');
            return;
        }
        
        // Take initial screenshot
        await page.screenshot({ path: 'manual-homepage.png', fullPage: true });
        console.log('📸 Screenshot: manual-homepage.png');
        
        // Navigate to login
        console.log('🔐 Navigating to login page...');
        await page.goto('http://localhost:3000/login');
        await page.screenshot({ path: 'manual-login.png', fullPage: true });
        console.log('📸 Screenshot: manual-login.png');
        
        // Manual login instructions
        console.log('');
        console.log('👤 MANUAL LOGIN REQUIRED:');
        console.log('   Email: ceo@pkibs.com');
        console.log('   Password: PKibs@@11');
        console.log('');
        console.log('⏰ Waiting 30 seconds for manual login...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Check current URL after login
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('dashboard') || currentUrl.includes('admin')) {
            console.log('✅ Login successful');
        } else {
            console.log('⚠️  Login may not be complete');
        }
        
        // Navigate to user management
        console.log('👥 Navigating to user management...');
        await page.goto('http://localhost:3000/admin/user-management');
        await page.waitForTimeout(5000);
        
        // Take screenshot of user management page
        await page.screenshot({ path: 'manual-user-management.png', fullPage: true });
        console.log('📸 Screenshot: manual-user-management.png');
        
        // Analyze page structure
        const pageAnalysis = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                bodyText: document.body.textContent.substring(0, 200),
                buttons: document.querySelectorAll('button').length,
                links: document.querySelectorAll('a').length,
                tables: document.querySelectorAll('table').length,
                forms: document.querySelectorAll('form').length,
                hasOverflow: document.body.scrollWidth > window.innerWidth,
                pageWidth: document.body.scrollWidth,
                viewportWidth: window.innerWidth
            };
        });
        
        console.log('\n📊 PAGE ANALYSIS:');
        console.log(`   Title: ${pageAnalysis.title}`);
        console.log(`   URL: ${pageAnalysis.url}`);
        console.log(`   Buttons: ${pageAnalysis.buttons}`);
        console.log(`   Tables: ${pageAnalysis.tables}`);
        console.log(`   Has Overflow: ${pageAnalysis.hasOverflow}`);
        if (pageAnalysis.hasOverflow) {
            console.log(`   Page Width: ${pageAnalysis.pageWidth}px vs Viewport: ${pageAnalysis.viewportWidth}px`);
        }
        
        // Look for View Details buttons
        console.log('\n🔍 SEARCHING FOR VIEW DETAILS BUTTONS...');
        
        const viewDetailsButtons = await page.evaluate(() => {
            const allButtons = Array.from(document.querySelectorAll('button, a, .btn, [role="button"]'));
            return allButtons.map(btn => ({
                text: btn.textContent.trim(),
                className: btn.className,
                tagName: btn.tagName,
                onclick: btn.onclick ? btn.onclick.toString() : null
            })).filter(btn => 
                btn.text.toLowerCase().includes('view') || 
                btn.text.toLowerCase().includes('details') ||
                btn.className.toLowerCase().includes('view') ||
                btn.className.toLowerCase().includes('details')
            );
        });
        
        console.log(`Found ${viewDetailsButtons.length} potential View Details buttons:`);
        viewDetailsButtons.forEach((btn, index) => {
            console.log(`   ${index + 1}. ${btn.tagName}: "${btn.text}" (${btn.className})`);
        });
        
        // Manual interaction instructions
        console.log('\n🖱️  MANUAL INTERACTION REQUIRED:');
        console.log('   1. Look for View Details buttons in the user management table');
        console.log('   2. Click on any View Details button');
        console.log('   3. Check for modal or page with student details');
        console.log('   4. Look specifically for "Assign New Course" section');
        console.log('   5. Check for horizontal overflow or design issues');
        console.log('');
        console.log('⏰ Waiting 60 seconds for manual interaction...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
        // Take final screenshot
        await page.screenshot({ path: 'manual-after-interaction.png', fullPage: true });
        console.log('📸 Screenshot: manual-after-interaction.png');
        
        // Check for modals
        const modalAnalysis = await page.evaluate(() => {
            const modals = Array.from(document.querySelectorAll('.modal, .dialog, [role="dialog"]'));
            return {
                modalCount: modals.length,
                visibleModals: modals.filter(modal => {
                    const style = getComputedStyle(modal);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                }).length,
                modalContent: modals.length > 0 ? modals[0].textContent.substring(0, 300) : null
            };
        });
        
        console.log('\n📋 MODAL ANALYSIS:');
        console.log(`   Modals found: ${modalAnalysis.modalCount}`);
        console.log(`   Visible modals: ${modalAnalysis.visibleModals}`);
        if (modalAnalysis.modalContent) {
            console.log(`   Modal content preview: "${modalAnalysis.modalContent}..."`);
        }
        
        // Final page analysis for overflow
        const finalAnalysis = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            
            return {
                bodyScrollWidth: body.scrollWidth,
                bodyOffsetWidth: body.offsetWidth,
                htmlScrollWidth: html.scrollWidth,
                htmlOffsetWidth: html.offsetWidth,
                windowInnerWidth: window.innerWidth,
                hasHorizontalScroll: body.scrollWidth > window.innerWidth,
                overflowingElements: Array.from(document.querySelectorAll('*')).filter(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > window.innerWidth;
                }).length
            };
        });
        
        console.log('\n🚨 OVERFLOW ANALYSIS:');
        console.log(`   Body scroll width: ${finalAnalysis.bodyScrollWidth}px`);
        console.log(`   Window width: ${finalAnalysis.windowInnerWidth}px`);
        console.log(`   Has horizontal scroll: ${finalAnalysis.hasHorizontalScroll}`);
        console.log(`   Overflowing elements: ${finalAnalysis.overflowingElements}`);
        
        if (finalAnalysis.hasHorizontalScroll) {
            console.log('❌ OVERFLOW DETECTED! The page is wider than the viewport.');
            console.log('💡 This confirms the overflow issue you mentioned.');
        } else {
            console.log('✅ No horizontal overflow detected in current state.');
        }
        
        console.log('\n📄 INVESTIGATION COMPLETE');
        console.log('========================');
        console.log('Screenshots saved:');
        console.log('  - manual-homepage.png');
        console.log('  - manual-login.png');
        console.log('  - manual-user-management.png');
        console.log('  - manual-after-interaction.png');
        console.log('');
        console.log('🔍 Next steps:');
        console.log('  1. Review the screenshots for visual overflow issues');
        console.log('  2. Manually test the View Details functionality');
        console.log('  3. Check course assignment dropdown for overflow');
        console.log('  4. Report specific UI elements causing overflow');
        
    } catch (error) {
        console.error('❌ Investigation failed:', error.message);
    } finally {
        if (browser) {
            console.log('\n⏰ Browser will close in 10 seconds...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            await browser.close();
        }
    }
}

// Export for external use
module.exports = manualUIInvestigation;

// Run if called directly
if (require.main === module) {
    manualUIInvestigation().catch(console.error);
}
