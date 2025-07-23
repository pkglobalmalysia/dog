#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log(`
🧪 STUDENT MANAGEMENT SYSTEM - AUTOMATED TESTING
=================================================

This will test your updated student management system to verify:
✅ Database updates (courses table with price, description, duration, status)
✅ API endpoints functionality  
✅ Admin interface access
✅ Course assignment dropdown
✅ Manual payment system

📋 BEFORE RUNNING:
1. Make sure your development server is running: npm run dev
2. Update admin credentials in test-student-management-simple.js (lines 13-14)

🔍 Checking if development server is running...
`);

// Check if development server is running
function checkServer() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000', (res) => {
            console.log('✅ Development server is running on port 3000');
            resolve(true);
        });
        
        req.on('error', () => {
            console.log('❌ Development server is NOT running');
            console.log('💡 Please run: npm run dev');
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('⏱️  Development server check timed out');
            resolve(false);
        });
    });
}

async function runTests() {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log(`
❌ CANNOT RUN TESTS
Development server is not running on port 3000.

🚀 To start your server:
   npm run dev

📝 Then run tests again:
   npm run test:student-mgmt
        `);
        process.exit(1);
    }
    
    console.log(`
🚀 Starting Puppeteer tests in 3 seconds...
   - Browser will open automatically
   - Screenshots will be saved to ./test-screenshots/
   - Reports will be generated in ./test-results.json and ./test-report.html
    `);
    
    setTimeout(() => {
        console.log('🤖 Launching automated tests...\n');
        
        const testProcess = spawn('node', ['test-student-management-simple.js'], {
            stdio: 'inherit',
            shell: true
        });
        
        testProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`
🎉 TESTS COMPLETED!

📊 Check your results:
   - HTML Report: test-report.html (open in browser)
   - JSON Data: test-results.json
   - Screenshots: test-screenshots/ folder

💡 If tests failed, check the recommendations in the HTML report.
                `);
            } else {
                console.log(`
❌ Tests completed with errors (exit code: ${code})
Check the console output above for details.
                `);
            }
        });
        
        testProcess.on('error', (error) => {
            console.error('❌ Failed to start tests:', error.message);
        });
    }, 3000);
}

runTests().catch(console.error);
