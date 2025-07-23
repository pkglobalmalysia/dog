import puppeteer from 'puppeteer';

async function testCreateUser() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔄 Starting Create User test...');
    
    // Go to login page
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('📝 Logging in as admin...');
    await page.type('input[type="email"]', 'ceo@pkibs.com');
    await page.type('input[type="password"]', 'PKibs@@11');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('🚀 Navigating to admin user management...');
    await page.goto('http://localhost:3000/admin/user-management');
    await page.waitForSelector('button', { timeout: 10000 });
    
    console.log('🔍 Looking for Create User tab...');
    await page.waitForSelector('text=Create User', { timeout: 5000 });
    console.log('✅ Found Create User tab');
    
    // Click on Create User tab
    await page.click('text=Create User');
    await page.waitForTimeout(1000);
    
    console.log('📝 Filling out student creation form...');
    
    // Fill out student form
    await page.waitForSelector('input[placeholder="Enter email"]', { timeout: 5000 });
    const testEmail = `teststudent${Date.now()}@example.com`;
    await page.type('input[placeholder="Enter email"]', testEmail);
    
    await page.type('input[placeholder="Enter full name"]', 'Test Student');
    await page.type('input[placeholder="Enter IC number"]', '123456789012');
    await page.type('input[placeholder="Enter phone number"]', '+60123456789');
    
    // Select Student
    await page.select('select', 'student');
    
    console.log('🔄 Submitting student creation form...');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Check for success or error message
    const errorElements = await page.$$('text=/error|Error|failed|Failed/i');
    const successElements = await page.$$('text=/success|Success|created|Created/i');
    
    if (errorElements.length > 0) {
      console.log('❌ Error detected in UI');
      const errorText = await page.evaluate(() => document.body.innerText);
      console.log('Error text:', errorText.slice(0, 500));
    } else if (successElements.length > 0) {
      console.log('✅ Success message detected');
    } else {
      console.log('⚠️  No clear success/error message found');
    }
    
    console.log(`📧 Test student email: ${testEmail}`);
    console.log('✅ Create User test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCreateUser();
