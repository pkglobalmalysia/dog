import puppeteer from 'puppeteer';

async function testCreateUserFixed() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔄 Testing FIXED Create User functionality...');
    
    // Wait for dev server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Go to login page
    await page.goto('http://localhost:3005/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('📝 Logging in as admin...');
    await page.type('input[type="email"]', 'ceo@pkibs.com');
    await page.type('input[type="password"]', 'PKibs@@11');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('🚀 Navigating to admin dashboard...');
    await page.goto('http://localhost:3005/admin/dashboard');
    await page.waitForSelector('button', { timeout: 10000 });
    
    console.log('🔍 Looking for Create User tab...');
    await page.waitForSelector('text=Create User', { timeout: 5000 });
    console.log('✅ Found Create User tab');
    
    // Click on Create User tab
    await page.click('text=Create User');
    await page.waitForTimeout(1000);
    
    console.log('📝 Testing student creation...');
    
    // Fill out student form
    await page.waitForSelector('input[placeholder="Enter email"]', { timeout: 5000 });
    const testEmail = `teststudent${Date.now()}@example.com`;
    await page.type('input[placeholder="Enter email"]', testEmail);
    
    await page.type('input[placeholder="Enter full name"]', 'Test Student Fixed');
    await page.type('input[placeholder="Enter IC number"]', '123456789012');
    await page.type('input[placeholder="Enter phone number"]', '+60123456789');
    
    // Select Student
    await page.select('select', 'student');
    
    console.log('🔄 Submitting form...');
    
    // Submit form and wait for response
    await page.click('button[type="submit"]');
    
    // Wait longer for the response
    await page.waitForTimeout(8000);
    
    // Check for success or error message in the page content
    const pageContent = await page.content();
    
    if (pageContent.includes('successfully') || pageContent.includes('Success')) {
      console.log('✅ SUCCESS: User creation appears to be working!');
    } else if (pageContent.includes('error') || pageContent.includes('Error') || pageContent.includes('failed')) {
      console.log('❌ Error still detected in response');
    } else {
      console.log('⚠️  Unclear response - check manually');
    }
    
    console.log(`📧 Test email used: ${testEmail}`);
    console.log('✅ Test completed - check server logs for detailed results');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCreateUserFixed();
