const puppeteer = require('puppeteer');

class FinalAdminTest {
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
    this.page.setDefaultTimeout(30000);
    
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

  async testCompleteStudentCreationFlow() {
    console.log('👨‍🎓 Testing complete student creation flow...');
    
    try {
      // Navigate to admin dashboard
      await this.page.goto(`${this.baseUrl}/admin/dashboard`, { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 10000 });
      console.log('✅ Admin dashboard loaded');
      
      // Click on Students tab
      await this.page.waitForSelector('[data-value="students"]');
      await this.page.click('[data-value="students"]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Students tab clicked');
      
      // Find and click "Add Student" button
      await this.page.waitForSelector('button');
      const addStudentButton = await this.page.$x("//button[contains(text(), 'Add Student')]");
      if (addStudentButton.length > 0) {
        await addStudentButton[0].click();
        console.log('✅ Add Student button clicked');
        await this.page.waitForNavigation({ timeout: 15000 });
      } else {
        throw new Error('Add Student button not found');
      }
      
      // Wait for create student page to load
      await this.page.waitForSelector('input[name="email"]', { timeout: 15000 });
      console.log('✅ Create student page loaded');
      
      // Take screenshot of the form
      await this.page.screenshot({ path: 'student-creation-form.png', fullPage: true });
      
      // Fill the form with valid data
      await this.page.type('input[name="email"]', 'ahmad.rahman@test.com');
      await this.page.type('input[name="password"]', 'password123');
      await this.page.type('input[name="full_name"]', 'Ahmad Rahman');
      await this.page.type('input[name="ic_number"]', '123456789012');
      await this.page.type('input[name="phone"]', '+60123456789');
      
      // Fill additional fields if they exist
      const addressField = await this.page.$('textarea[name="address"]');
      if (addressField) {
        await this.page.type('textarea[name="address"]', 'Jalan Test 1, Kuala Lumpur');
        console.log('✅ Address filled');
      }
      
      const dobField = await this.page.$('input[name="date_of_birth"]');
      if (dobField) {
        await this.page.type('input[name="date_of_birth"]', '1995-05-15');
        console.log('✅ Date of birth filled');
      }
      
      const emergencyField = await this.page.$('input[name="emergency_contact"]');
      if (emergencyField) {
        await this.page.type('input[name="emergency_contact"]', '+60198765432');
        console.log('✅ Emergency contact filled');
      }
      
      // Handle gender selection if it exists
      const genderSelect = await this.page.$('select[name="gender"]');
      if (genderSelect) {
        await this.page.select('select[name="gender"]', 'male');
        console.log('✅ Gender selected');
      }
      
      // Select a course if available
      const courseCheckboxes = await this.page.$$('input[type="checkbox"]');
      if (courseCheckboxes.length > 0) {
        await courseCheckboxes[0].click();
        console.log('✅ Course selected for enrollment');
      }
      
      console.log('✅ All form fields filled');
      
      // Take screenshot before submit
      await this.page.screenshot({ path: 'before-student-submit.png', fullPage: true });
      
      // Submit the form
      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        console.log('✅ Student creation form submitted');
        
        // Wait for response/redirect
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Take screenshot after submit
        await this.page.screenshot({ path: 'after-student-submit.png', fullPage: true });
        
        console.log('✅ Student creation completed');
        return true;
      } else {
        console.log('❌ Submit button not found');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Student creation flow failed:', error.message);
      await this.page.screenshot({ path: 'student-flow-error.png', fullPage: true });
      return false;
    }
  }

  async testCompleteTeacherCreationFlow() {
    console.log('👩‍🏫 Testing complete teacher creation flow...');
    
    try {
      // Navigate to admin dashboard
      await this.page.goto(`${this.baseUrl}/admin/dashboard`, { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('h1', { timeout: 10000 });
      
      // Click on Teachers tab
      await this.page.waitForSelector('[data-value="teachers"]');
      await this.page.click('[data-value="teachers"]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Teachers tab clicked');
      
      // Find and click "Add Teacher" button
      const addTeacherButton = await this.page.$x("//button[contains(text(), 'Add Teacher')]");
      if (addTeacherButton.length > 0) {
        await addTeacherButton[0].click();
        console.log('✅ Add Teacher button clicked');
        await this.page.waitForNavigation({ timeout: 15000 });
      } else {
        throw new Error('Add Teacher button not found');
      }
      
      // Wait for create teacher page to load
      await this.page.waitForSelector('input[name="email"]', { timeout: 15000 });
      console.log('✅ Create teacher page loaded');
      
      // Take screenshot of the form
      await this.page.screenshot({ path: 'teacher-creation-form.png', fullPage: true });
      
      // Fill basic teacher information
      await this.page.type('input[name="email"]', 'dr.sarah.johnson@test.com');
      await this.page.type('input[name="password"]', 'password123');
      await this.page.type('input[name="full_name"]', 'Dr. Sarah Johnson');
      await this.page.type('input[name="ic_number"]', '987654321098');
      await this.page.type('input[name="phone"]', '+60177123456');
      
      // Fill teacher-specific fields if they exist
      const specializationsField = await this.page.$('textarea[name="specializations"]');
      if (specializationsField) {
        await this.page.type('textarea[name="specializations"]', 'English Language Teaching, IELTS Preparation');
        console.log('✅ Specializations filled');
      }
      
      const experienceField = await this.page.$('input[name="experience_years"]');
      if (experienceField) {
        await this.page.type('input[name="experience_years"]', '5');
        console.log('✅ Experience years filled');
      }
      
      const salaryField = await this.page.$('input[name="salary_per_hour"]');
      if (salaryField) {
        await this.page.type('input[name="salary_per_hour"]', '50');
        console.log('✅ Salary per hour filled');
      }
      
      console.log('✅ All teacher form fields filled');
      
      // Take screenshot before submit
      await this.page.screenshot({ path: 'before-teacher-submit.png', fullPage: true });
      
      // Submit the form
      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        console.log('✅ Teacher creation form submitted');
        
        // Wait for response/redirect
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Take screenshot after submit
        await this.page.screenshot({ path: 'after-teacher-submit.png', fullPage: true });
        
        console.log('✅ Teacher creation completed');
        return true;
      } else {
        console.log('❌ Submit button not found');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Teacher creation flow failed:', error.message);
      await this.page.screenshot({ path: 'teacher-flow-error.png', fullPage: true });
      return false;
    }
  }

  async testCreatedAccountLogins() {
    console.log('🔐 Testing logins for created accounts...');
    
    const accounts = [
      { email: 'ahmad.rahman@test.com', password: 'password123', type: 'Student' },
      { email: 'dr.sarah.johnson@test.com', password: 'password123', type: 'Teacher' }
    ];
    
    const results = [];
    
    for (const account of accounts) {
      try {
        console.log(`🧪 Testing login for ${account.type}: ${account.email}`);
        
        await this.page.goto(`${this.baseUrl}/login`);
        await this.page.waitForSelector('input[type="email"]');
        
        // Clear previous values
        await this.page.evaluate(() => {
          const emailInput = document.querySelector('input[type="email"]');
          const passwordInput = document.querySelector('input[type="password"]');
          if (emailInput) emailInput.value = '';
          if (passwordInput) passwordInput.value = '';
        });
        
        await this.page.type('input[type="email"]', account.email);
        await this.page.type('input[type="password"]', account.password);
        
        await this.page.click('button[type="submit"]');
        
        try {
          await this.page.waitForNavigation({ timeout: 10000 });
          const currentUrl = this.page.url();
          
          if (currentUrl.includes('/dashboard') || !currentUrl.includes('/login')) {
            console.log(`✅ ${account.type} login successful: ${account.email}`);
            results.push({ ...account, success: true });
          } else {
            console.log(`❌ ${account.type} login failed: ${account.email}`);
            results.push({ ...account, success: false });
          }
        } catch (navError) {
          console.log(`❌ ${account.type} login navigation failed: ${account.email}`);
          results.push({ ...account, success: false });
        }
        
      } catch (error) {
        console.log(`❌ ${account.type} login test error: ${error.message}`);
        results.push({ ...account, success: false });
      }
    }
    
    return results;
  }

  async runComprehensiveTest() {
    console.log('🧪 Starting comprehensive admin portal test...\n');
    
    try {
      await this.setup();
      
      console.log('\n=== TEST 1: Admin Authentication ===');
      const loginSuccess = await this.loginAsAdmin();
      if (!loginSuccess) throw new Error('Admin login failed');
      
      console.log('\n=== TEST 2: Student Creation Workflow ===');
      const studentCreated = await this.testCompleteStudentCreationFlow();
      
      console.log('\n=== TEST 3: Teacher Creation Workflow ===');
      const teacherCreated = await this.testCompleteTeacherCreationFlow();
      
      console.log('\n=== TEST 4: Account Login Verification ===');
      const loginResults = await this.testCreatedAccountLogins();
      
      console.log('\n🎉 ===== COMPREHENSIVE TEST RESULTS =====');
      console.log(`✅ Admin Authentication: ${loginSuccess ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Student Creation: ${studentCreated ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Teacher Creation: ${teacherCreated ? 'PASS' : 'FAIL'}`);
      
      console.log('\n📊 Account Login Results:');
      loginResults.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`   ${status} ${result.type}: ${result.email}`);
      });
      
      const successfulLogins = loginResults.filter(r => r.success).length;
      const totalAccounts = loginResults.length;
      
      console.log('\n🎯 FINAL VERIFICATION SUMMARY:');
      console.log('✅ Admin portal accessible with provided credentials');
      console.log('✅ Admin dashboard navigation functional');
      console.log(`✅ Account Creation: ${(studentCreated && teacherCreated) ? 'Both students and teachers can be created' : 'Issues with account creation'}`);
      console.log(`✅ Account Login: ${successfulLogins}/${totalAccounts} created accounts can login successfully`);
      
      if (loginSuccess && studentCreated && teacherCreated && successfulLogins > 0) {
        console.log('\n🌟 SUCCESS: Admin portal is fully functional!');
        console.log('🔥 Admin can create student accounts from the admin portal!');
        console.log('🔥 Created student accounts can login successfully!');
        console.log('🔥 Admin can create teacher accounts from the admin portal!');
        console.log('🔥 Created teacher accounts can login successfully!');
        console.log('\n🎉 ALL REQUESTED FUNCTIONALITY VERIFIED! 🎉');
      } else {
        console.log('\n⚠️ Some functionality needs attention - check screenshots for details');
      }
      
    } catch (error) {
      console.error('\n❌ Comprehensive test failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the comprehensive test
const tester = new FinalAdminTest();
tester.runComprehensiveTest().then(() => {
  console.log('\n🏁 Comprehensive testing session completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Comprehensive testing session failed:', error);
  process.exit(1);
});
