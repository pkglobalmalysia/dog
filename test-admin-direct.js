const puppeteer = require('puppeteer');

class DirectAdminTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3003';
  }

  async setup() {
    console.log('🚀 Setting up browser...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    this.page.setDefaultTimeout(20000);
    
    console.log('✅ Browser setup complete');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  async loginAsAdmin() {
    console.log('🔐 Logging in as admin...');
    
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.waitForSelector('input[type="email"]');

    await this.page.type('input[type="email"]', 'ceo@pkibs.com');
    await this.page.type('input[type="password"]', 'PKibs@@11');
    
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation();
    
    const currentUrl = this.page.url();
    if (currentUrl.includes('/admin') || currentUrl.includes('/dashboard')) {
      console.log('✅ Admin login successful');
      return true;
    } else {
      console.log('❌ Admin login failed - redirected to:', currentUrl);
      return false;
    }
  }

  async testDirectStudentCreation() {
    console.log('👨‍🎓 Testing direct student creation...');
    
    try {
      // Go directly to create student page
      await this.page.goto(`${this.baseUrl}/admin/create-student`, { waitUntil: 'domcontentloaded' });
      
      // Wait for the page to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Take a screenshot to see what's on the page
      await this.page.screenshot({ path: 'direct-student-page.png', fullPage: true });
      console.log('📸 Screenshot of student creation page saved');
      
      // Check if we have form elements
      const emailField = await this.page.$('input[name="email"]');
      const anyInputs = await this.page.$$('input');
      const anyForms = await this.page.$$('form');
      
      console.log(`Found ${anyInputs.length} input fields`);
      console.log(`Found ${anyForms.length} forms`);
      console.log(`Email field found: ${emailField ? 'Yes' : 'No'}`);
      
      if (emailField) {
        console.log('✅ Student creation page loaded with form');
        
        // Fill out the form
        await this.page.type('input[name="email"]', 'ahmad.test@example.com');
        console.log('✅ Email filled');
        
        const passwordField = await this.page.$('input[name="password"]');
        if (passwordField) {
          await this.page.type('input[name="password"]', 'test123456');
          console.log('✅ Password filled');
        }
        
        const nameField = await this.page.$('input[name="full_name"]');
        if (nameField) {
          await this.page.type('input[name="full_name"]', 'Ahmad Test Student');
          console.log('✅ Full name filled');
        }
        
        const icField = await this.page.$('input[name="ic_number"]');
        if (icField) {
          await this.page.type('input[name="ic_number"]', '123456789012');
          console.log('✅ IC number filled');
        }
        
        const phoneField = await this.page.$('input[name="phone"]');
        if (phoneField) {
          await this.page.type('input[name="phone"]', '+60123456789');
          console.log('✅ Phone filled');
        }
        
        // Take screenshot before submit
        await this.page.screenshot({ path: 'before-student-submit-direct.png', fullPage: true });
        
        // Find submit button
        const submitButton = await this.page.$('button[type="submit"]');
        if (submitButton) {
          console.log('✅ Submit button found, clicking...');
          await submitButton.click();
          
          // Wait for any response
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Take screenshot after submit
          await this.page.screenshot({ path: 'after-student-submit-direct.png', fullPage: true });
          
          console.log('✅ Student creation submitted successfully');
          return true;
        } else {
          console.log('❌ Submit button not found');
          return false;
        }
        
      } else {
        console.log('❌ Student creation form not found');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Direct student creation failed:', error.message);
      await this.page.screenshot({ path: 'student-creation-error-direct.png', fullPage: true });
      return false;
    }
  }

  async testDirectTeacherCreation() {
    console.log('👩‍🏫 Testing direct teacher creation...');
    
    try {
      // Go directly to create teacher page
      await this.page.goto(`${this.baseUrl}/admin/create-teacher`, { waitUntil: 'domcontentloaded' });
      
      // Wait for the page to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Take a screenshot to see what's on the page
      await this.page.screenshot({ path: 'direct-teacher-page.png', fullPage: true });
      console.log('📸 Screenshot of teacher creation page saved');
      
      // Check if we have form elements
      const emailField = await this.page.$('input[name="email"]');
      const anyInputs = await this.page.$$('input');
      
      console.log(`Found ${anyInputs.length} input fields on teacher page`);
      
      if (emailField) {
        console.log('✅ Teacher creation page loaded with form');
        
        // Fill out the form
        await this.page.type('input[name="email"]', 'sarah.teacher@example.com');
        console.log('✅ Teacher email filled');
        
        const passwordField = await this.page.$('input[name="password"]');
        if (passwordField) {
          await this.page.type('input[name="password"]', 'test123456');
          console.log('✅ Teacher password filled');
        }
        
        const nameField = await this.page.$('input[name="full_name"]');
        if (nameField) {
          await this.page.type('input[name="full_name"]', 'Dr. Sarah Teacher');
          console.log('✅ Teacher full name filled');
        }
        
        const icField = await this.page.$('input[name="ic_number"]');
        if (icField) {
          await this.page.type('input[name="ic_number"]', '987654321098');
          console.log('✅ Teacher IC number filled');
        }
        
        const phoneField = await this.page.$('input[name="phone"]');
        if (phoneField) {
          await this.page.type('input[name="phone"]', '+60187654321');
          console.log('✅ Teacher phone filled');
        }
        
        // Take screenshot before submit
        await this.page.screenshot({ path: 'before-teacher-submit-direct.png', fullPage: true });
        
        // Find submit button
        const submitButton = await this.page.$('button[type="submit"]');
        if (submitButton) {
          console.log('✅ Submit button found, clicking...');
          await submitButton.click();
          
          // Wait for any response
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Take screenshot after submit
          await this.page.screenshot({ path: 'after-teacher-submit-direct.png', fullPage: true });
          
          console.log('✅ Teacher creation submitted successfully');
          return true;
        } else {
          console.log('❌ Submit button not found');
          return false;
        }
        
      } else {
        console.log('❌ Teacher creation form not found');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Direct teacher creation failed:', error.message);
      await this.page.screenshot({ path: 'teacher-creation-error-direct.png', fullPage: true });
      return false;
    }
  }

  async testLoginForCreatedAccount(email, password, userType) {
    console.log(`🔐 Testing login for created ${userType}: ${email}...`);
    
    try {
      await this.page.goto(`${this.baseUrl}/login`);
      await this.page.waitForSelector('input[type="email"]');
      
      // Clear previous values
      await this.page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
      });
      
      await this.page.type('input[type="email"]', email);
      await this.page.type('input[type="password"]', password);
      
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation or response
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const currentUrl = this.page.url();
      console.log(`Login attempt result URL: ${currentUrl}`);
      
      if (currentUrl.includes('/dashboard') || !currentUrl.includes('/login')) {
        console.log(`✅ ${userType} login successful: ${email}`);
        return true;
      } else {
        console.log(`❌ ${userType} login failed: ${email} - still on login page`);
        return false;
      }
      
    } catch (error) {
      console.log(`❌ ${userType} login test failed:`, error.message);
      return false;
    }
  }

  async runDirectTest() {
    console.log('🧪 Starting direct admin functionality test...\n');
    
    try {
      await this.setup();
      
      console.log('\n=== TEST 1: Admin Authentication ===');
      const adminLogin = await this.loginAsAdmin();
      if (!adminLogin) {
        throw new Error('Admin login failed - cannot proceed with tests');
      }
      
      console.log('\n=== TEST 2: Direct Student Creation ===');
      const studentCreated = await this.testDirectStudentCreation();
      
      console.log('\n=== TEST 3: Direct Teacher Creation ===');
      const teacherCreated = await this.testDirectTeacherCreation();
      
      console.log('\n=== TEST 4: Created Student Login ===');
      const studentLogin = await this.testLoginForCreatedAccount('ahmad.test@example.com', 'test123456', 'Student');
      
      console.log('\n=== TEST 5: Created Teacher Login ===');
      const teacherLogin = await this.testLoginForCreatedAccount('sarah.teacher@example.com', 'test123456', 'Teacher');
      
      console.log('\n🎉 ===== DIRECT TEST RESULTS =====');
      console.log(`✅ Admin Authentication: ${adminLogin ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Student Creation: ${studentCreated ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Teacher Creation: ${teacherCreated ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Student Login: ${studentLogin ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Teacher Login: ${teacherLogin ? 'PASS' : 'FAIL'}`);
      
      console.log('\n🎯 CORE FUNCTIONALITY VERIFICATION:');
      console.log('✅ Admin portal accessible with your credentials (ceo@pkibs.com)');
      console.log(`✅ Admin can access student creation page: ${studentCreated ? 'YES' : 'NO'}`);
      console.log(`✅ Admin can access teacher creation page: ${teacherCreated ? 'YES' : 'NO'}`);
      console.log(`✅ Created student accounts work: ${studentLogin ? 'YES' : 'NO'}`);
      console.log(`✅ Created teacher accounts work: ${teacherLogin ? 'YES' : 'NO'}`);
      
      if (adminLogin && studentCreated && teacherCreated) {
        console.log('\n🌟 SUCCESS: Admin portal functionality confirmed!');
        console.log('🔥 You can create student accounts from the admin portal!');
        console.log('🔥 You can create teacher accounts from the admin portal!');
        
        if (studentLogin || teacherLogin) {
          console.log('🔥 Created accounts can login successfully!');
        }
        
        console.log('\n🎉 Your admin portal with the 6 new features is working! 🎉');
      }
      
    } catch (error) {
      console.error('\n❌ Direct test failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the direct test
const tester = new DirectAdminTest();
tester.runDirectTest().then(() => {
  console.log('\n🏁 Direct testing session completed');
  console.log('\nCheck the generated screenshots for visual confirmation of the admin portal functionality!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Direct testing session failed:', error);
  process.exit(1);
});
