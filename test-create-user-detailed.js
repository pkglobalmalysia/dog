import puppeteer from 'puppeteer';

async function testCreateUserWithDetails() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console logs from the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Page Error:', msg.text());
      }
    });
    
    // Listen for network requests to see API calls
    page.on('response', response => {
      if (response.url().includes('/api/admin/create-user')) {
        console.log(`📡 API Response: ${response.status()} ${response.url()}`);
        if (response.status() !== 200) {
          response.text().then(text => {
            console.log('📄 Response body:', text);
          });
        }
      }
    });
    
    console.log('🔄 Testing Create User functionality with detailed logging...');
    
    // Go to login page
    await page.goto('http://localhost:3006/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('📝 Logging in as admin...');
    await page.type('input[type="email"]', 'ceo@pkibs.com');
    await page.type('input[type="password"]', 'PKibs@@11');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('🚀 Navigating to User Management...');
    await page.goto('http://localhost:3006/admin/user-management');
    await page.waitForSelector('text=Create User', { timeout: 10000 });
    
    // Click on Create User tab
    await page.click('text=Create User');
    await page.waitForTimeout(1000);
    
    console.log('📝 Filling out student creation form...');
    
    // Fill out student form with test data
    const testEmail = `teststudent${Date.now()}@example.com`;
    await page.fill('input[placeholder*="student@example.com"]', testEmail);
    await page.fill('input[placeholder="Full Name"]', 'Test Student User');
    await page.fill('input[placeholder="123456789012"]', '123456789012');
    await page.fill('input[placeholder="+60123456789"]', '+60123456789');
    
    console.log(`🔄 Creating student with email: ${testEmail}`);
    
    // Submit the form
    await page.click('button:has-text("Create Student Account")');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Check for success or error messages
    const toastMessages = await page.$$eval('[data-toast]', elements => 
      elements.map(el => el.textContent)
    );
    
    if (toastMessages.length > 0) {
      console.log('📋 Toast messages:', toastMessages);
    } else {
      console.log('⚠️ No toast messages found, checking for other feedback...');
      
      // Check for any error text on the page
      const bodyText = await page.textContent('body');
      if (bodyText.includes('error') || bodyText.includes('Error') || bodyText.includes('failed') || bodyText.includes('Failed')) {
        console.log('❌ Error detected in page content');
      }
    }
    
    console.log('✅ Create User test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCreateUserWithDetails();
