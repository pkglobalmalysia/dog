import puppeteer from 'puppeteer';

async function testUserManagement() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔄 Testing User Management page...');
    
    // Go to login page
    await page.goto('http://localhost:3006/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('📝 Logging in as admin...');
    await page.type('input[type="email"]', 'ceo@pkibs.com');
    await page.type('input[type="password"]', 'PKibs@@11');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('🚀 Navigating to admin page...');
    await page.goto('http://localhost:3006/admin');
    await page.waitForSelector('a[href="/admin/user-management"]', { timeout: 10000 });
    
    console.log('✅ Found User Management link in sidebar');
    
    // Click on User Management
    await page.click('a[href="/admin/user-management"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('📋 Checking User Management page content...');
    
    // Check if the page loaded correctly
    const pageTitle = await page.textContent('h1');
    console.log('Page title:', pageTitle);
    
    // Check if Create User tab exists
    const createUserTab = await page.$('text=Create User');
    if (createUserTab) {
      console.log('✅ Create User tab found');
      
      // Click on Create User tab
      await page.click('text=Create User');
      await page.waitForTimeout(1000);
      
      // Check for student creation form
      const studentForm = await page.$('h3:has-text("Create Student")');
      const teacherForm = await page.$('h3:has-text("Create Teacher")');
      
      if (studentForm && teacherForm) {
        console.log('✅ Both student and teacher creation forms found');
      } else {
        console.log('❌ Creation forms not found');
      }
      
    } else {
      console.log('❌ Create User tab not found');
    }
    
    console.log('✅ User Management page test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testUserManagement();
