const puppeteer = require('puppeteer');

async function testAdminDashboard() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3004/login');
    await page.waitForSelector('input[type="email"]');
    
    await page.type('input[type="email"]', 'ceo@pkibs.com');
    await page.type('input[type="password"]', 'PKibs@@11');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    console.log('✅ Login successful');
    
    console.log('📊 Navigating to admin dashboard...');
    await page.goto('http://localhost:3004/admin/dashboard');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for page to fully load
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'admin-dashboard-full.png', fullPage: true });
    
    // Check what elements are present
    const title = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
    console.log('Page title:', title);
    
    const tabs = await page.$$eval('[role="tablist"] [role="tab"]', tabs => 
      tabs.map(tab => ({ text: tab.textContent, value: tab.getAttribute('data-value') }))
    ).catch(() => []);
    
    console.log('Found tabs:', tabs);
    
    // Check if any tab-like elements exist
    const allButtons = await page.$$eval('button', buttons => 
      buttons.map(btn => btn.textContent).filter(text => text && text.trim().length > 0)
    ).catch(() => []);
    
    console.log('All buttons:', allButtons.slice(0, 10)); // Show first 10
    
    console.log('✅ Screenshot saved as admin-dashboard-full.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminDashboard();
