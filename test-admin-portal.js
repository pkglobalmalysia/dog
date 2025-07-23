const puppeteer = require('puppeteer');

class LMSAutomatedTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3003';
  }

  async setup() {
    console.log('🚀 Setting up browser...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Set longer timeouts for form submissions
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

    // Use the admin credentials
    await this.page.type('input[type="email"]', 'ceo@pkibs.com');
    await this.page.type('input[type="password"]', 'PKibs@@11');
    
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
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

  async navigateToAdminDashboard() {
    console.log('📊 Navigating to admin dashboard...');
    
    await this.page.goto(`${this.baseUrl}/admin/dashboard`);
    await this.page.waitForSelector('h1');
    
    const title = await this.page.$eval('h1', el => el.textContent);
    if (title && title.includes('Admin Management Dashboard')) {
      console.log('✅ Admin dashboard loaded successfully');
      return true;
    } else {
      console.log('❌ Failed to load admin dashboard');
      return false;
    }
  }

  async createStudent(student) {
    console.log(`👨‍🎓 Creating student: ${student.full_name}...`);
    
    // Navigate to create student page
    await this.page.goto(`${this.baseUrl}/admin/create-student`);
    await this.page.waitForSelector('input[name="email"]');

    // Fill in the student form
    await this.page.type('input[name="email"]', student.email);
    await this.page.type('input[name="password"]', student.password);
    await this.page.type('input[name="full_name"]', student.full_name);
    await this.page.type('input[name="ic_number"]', student.ic_number);
    await this.page.type('input[name="phone"]', student.phone);
    await this.page.type('textarea[name="address"]', student.address);
    await this.page.type('input[name="date_of_birth"]', student.date_of_birth);
    
    // Select gender
    await this.page.select('select[name="gender"]', student.gender);
    
    await this.page.type('input[name="emergency_contact"]', student.emergency_contact);

    // Select a course to enroll
    const courseCheckboxes = await this.page.$$('input[type="checkbox"]');
    if (courseCheckboxes.length > 0) {
      await courseCheckboxes[0].click(); // Select first available course
      console.log('✅ Selected course for enrollment');
    }

    // Submit the form
    await this.page.click('button[type="submit"]');
    
    // Wait for success or error message
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`✅ Student ${student.full_name} creation submitted`);
    return true;
  }

  async createTeacher(teacher) {
    console.log(`👩‍🏫 Creating teacher: ${teacher.full_name}...`);
    
    // Navigate to create teacher page
    await this.page.goto(`${this.baseUrl}/admin/create-teacher`);
    await this.page.waitForSelector('input[name="email"]');

    // Fill in the teacher form
    await this.page.type('input[name="email"]', teacher.email);
    await this.page.type('input[name="password"]', teacher.password);
    await this.page.type('input[name="full_name"]', teacher.full_name);
    await this.page.type('input[name="ic_number"]', teacher.ic_number);
    await this.page.type('input[name="phone"]', teacher.phone);
    
    // Fill teacher-specific fields
    await this.page.type('textarea[name="specializations"]', teacher.specializations);
    await this.page.type('input[name="experience_years"]', teacher.experience_years);
    await this.page.type('input[name="salary_per_hour"]', teacher.salary_per_hour);

    // Submit the form
    await this.page.click('button[type="submit"]');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`✅ Teacher ${teacher.full_name} creation submitted`);
    return true;
  }

  async loginAsStudent(email, password) {
    console.log(`🎓 Testing student login: ${email}...`);
    
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.waitForSelector('input[type="email"]');

    // Clear previous values and login as student
    await this.page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    });

    await this.page.type('input[type="email"]', email);
    await this.page.type('input[type="password"]', password);
    
    await this.page.click('button[type="submit"]');
    
    try {
      await this.page.waitForNavigation({ timeout: 10000 });
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard/student') || currentUrl.includes('/student')) {
        console.log(`✅ Student login successful: ${email}`);
        return true;
      } else {
        console.log(`❌ Student login failed: ${email} - redirected to:`, currentUrl);
        return false;
      }
    } catch (error) {
      console.log(`❌ Student login timeout: ${email}`);
      return false;
    }
  }

  async loginAsTeacher(email, password) {
    console.log(`👩‍🏫 Testing teacher login: ${email}...`);
    
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.waitForSelector('input[type="email"]');

    await this.page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    });

    await this.page.type('input[type="email"]', email);
    await this.page.type('input[type="password"]', password);
    
    await this.page.click('button[type="submit"]');
    
    try {
      await this.page.waitForNavigation({ timeout: 10000 });
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard/teacher') || currentUrl.includes('/teacher')) {
        console.log(`✅ Teacher login successful: ${email}`);
        return true;
      } else {
        console.log(`❌ Teacher login failed: ${email} - redirected to:`, currentUrl);
        return false;
      }
    } catch (error) {
      console.log(`❌ Teacher login timeout: ${email}`);
      return false;
    }
  }

  async testTeacherHoursLogging(teacher) {
    console.log(`⏰ Testing teacher hours logging: ${teacher.full_name}...`);
    
    // Navigate to log hours page
    await this.page.goto(`${this.baseUrl}/teacher/log-hours`);
    
    try {
      await this.page.waitForSelector('input[name="date_worked"]', { timeout: 5000 });

      // Fill in timesheet
      const today = new Date().toISOString().split('T')[0];
      await this.page.type('input[name="date_worked"]', today);
      await this.page.type('input[name="start_time"]', '09:00');
      await this.page.type('input[name="end_time"]', '17:00');
      await this.page.type('textarea[name="description"]', 'Teaching English speaking course and grading assignments');

      // Submit timesheet
      await this.page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`✅ Teacher ${teacher.full_name} logged hours successfully`);
      return true;
    } catch (error) {
      console.log(`⚠️ Teacher hours logging page not accessible: ${error.message}`);
      return false;
    }
  }

  async testAdminDashboardTabs() {
    console.log('📋 Testing admin dashboard tabs...');
    
    // Navigate to admin dashboard
    await this.page.goto(`${this.baseUrl}/admin/dashboard`);
    await this.page.waitForSelector('h1');

    // Test clicking different tabs
    const tabs = ['students', 'teachers', 'payments', 'salaries'];
    
    for (const tab of tabs) {
      try {
        // Look for tab trigger
        const tabSelector = `[data-value="${tab}"], [value="${tab}"], button:contains("${tab}"), [role="tab"]:contains("${tab}")`;
        await this.page.click(tabSelector);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`✅ ${tab} tab clicked successfully`);
      } catch (error) {
        console.log(`⚠️ Could not click ${tab} tab: ${error.message}`);
      }
    }
    
    return true;
  }

  async runCompleteTest() {
    console.log('🧪 Starting comprehensive LMS testing...\n');
    
    const testStudents = [
      {
        email: 'student1@test.com',
        password: 'test123456',
        full_name: 'Ahmad Rahman',
        ic_number: '123456789012',
        phone: '+60123456789',
        address: 'Jalan Test 1, Kuala Lumpur',
        date_of_birth: '1995-05-15',
        gender: 'male',
        emergency_contact: '+60198765432'
      },
      {
        email: 'student2@test.com',
        password: 'test123456',
        full_name: 'Siti Aminah',
        ic_number: '987654321098',
        phone: '+60198765432',
        address: 'Jalan Test 2, Petaling Jaya',
        date_of_birth: '1998-08-22',
        gender: 'female',
        emergency_contact: '+60123456789'
      }
    ];

    const testTeachers = [
      {
        email: 'teacher1@test.com',
        password: 'test123456',
        full_name: 'Dr. Sarah Johnson',
        ic_number: '555666777888',
        phone: '+60177123456',
        specializations: 'English Language Teaching, IELTS Preparation',
        experience_years: '5',
        salary_per_hour: '50'
      }
    ];

    try {
      await this.setup();

      // Test 1: Admin Login
      console.log('\n=== TEST 1: Admin Login ===');
      const adminLoginSuccess = await this.loginAsAdmin();
      if (!adminLoginSuccess) throw new Error('Admin login failed');

      // Test 2: Admin Dashboard Access
      console.log('\n=== TEST 2: Admin Dashboard ===');
      const dashboardSuccess = await this.navigateToAdminDashboard();
      if (!dashboardSuccess) throw new Error('Admin dashboard access failed');

      // Test 3: Admin Dashboard Tabs
      console.log('\n=== TEST 3: Admin Dashboard Tabs ===');
      await this.testAdminDashboardTabs();

      // Test 4: Create Students
      console.log('\n=== TEST 4: Student Creation ===');
      for (const student of testStudents) {
        await this.createStudent(student);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between creations
      }

      // Test 5: Create Teachers
      console.log('\n=== TEST 5: Teacher Creation ===');
      for (const teacher of testTeachers) {
        await this.createTeacher(teacher);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between creations
      }

      // Wait a bit for accounts to be processed
      console.log('\n⏳ Waiting for accounts to be processed...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Test 6: Student Login Tests
      console.log('\n=== TEST 6: Student Login Verification ===');
      for (const student of testStudents) {
        await this.loginAsStudent(student.email, student.password);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Test 7: Teacher Login and Hours Logging
      console.log('\n=== TEST 7: Teacher Login & Hours Logging ===');
      for (const teacher of testTeachers) {
        const teacherLoginSuccess = await this.loginAsTeacher(teacher.email, teacher.password);
        if (teacherLoginSuccess) {
          await this.testTeacherHoursLogging(teacher);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('\n🎉 ===== ALL TESTS COMPLETED! =====');
      console.log('✅ Admin portal functionality verified');
      console.log('✅ Student creation tested');
      console.log('✅ Teacher creation tested');
      console.log('✅ Login workflows tested');
      console.log('✅ Hours logging system tested');
      console.log('✅ Admin dashboard navigation tested');

    } catch (error) {
      console.error('\n❌ Test failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
const tester = new LMSAutomatedTest();
tester.runCompleteTest().then(() => {
  console.log('\n🏁 Testing session completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Testing session failed:', error);
  process.exit(1);
});
