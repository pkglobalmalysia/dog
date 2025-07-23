import puppeteer from 'puppeteer';

async function quickAdminTest() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 200,
    args: ['--no-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔄 Quick admin test...');
    
    // Go directly to admin after login
    console.log('📝 Going to login page...');
    await page.goto('http://localhost:3006/login', { waitUntil: 'networkidle0' });
    
    // Check if login form exists
    const emailInput = await page.$('input[type="email"]');
    if (!emailInput) {
      console.log('❌ Login form not found');
      return;
    }
    
    console.log('✅ Login form found, filling credentials...');
    await page.type('input[type="email"]', 'ceo@pkibs.com');
    await page.type('input[type="password"]', 'PKibs@@11');
    
    console.log('🔄 Submitting login...');
    await page.click('button[type="submit"]');
    
    // Wait for redirect or success
    await page.waitForTimeout(3000);
    
    console.log('🚀 Current URL after login:', page.url());
    
    // Now try to go to admin
    console.log('📋 Navigating to admin page...');
    await page.goto('http://localhost:3006/admin', { waitUntil: 'domcontentloaded' });
    
    console.log('🔍 Current URL:', page.url());
    
    // Check if sidebar exists
    const sidebar = await page.$('nav, aside, [class*="sidebar"]');
    if (sidebar) {
      console.log('✅ Sidebar found');
      
      // Look for User Management link
      const userMgmtLink = await page.$('a[href*="user-management"], text=User Management');
      if (userMgmtLink) {
        console.log('✅ User Management link found!');
      } else {
        console.log('❌ User Management link not found');
        // Log all links to see what's available
        const links = await page.$$eval('a', links => 
          links.map(link => ({ href: link.href, text: link.textContent?.trim() }))
        );
        console.log('Available links:', links.filter(l => l.text && l.text.length > 0));
      }
    } else {
      console.log('❌ Sidebar not found');
    }
    
    await page.waitForTimeout(5000); // Keep browser open for inspection
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

quickAdminTest();
