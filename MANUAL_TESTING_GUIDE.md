# 🧪 MANUAL TESTING CHECKLIST - COMPREHENSIVE SYSTEM TEST

> **Current Status**: APIs working, existing data present, ready for UI testing  
> **Admin Account**: `ceo@pkibs.com` exists  
> **Test Data**: 9 courses, 15+ events, teacher accounts available

---

## 🚀 **PHASE 1: ADMIN TESTING** 

### Step 1: Admin Login (Using Existing Account)
**URL**: http://localhost:3000/login

1. **Login with Existing Admin**:
   - [ ] Go to http://localhost:3000/login
   - [ ] Email: `ceo@pkibs.com`  
   - [ ] Password: `[Try common passwords or reset if needed]`
   - [ ] **Test passwords**: admin123, password, 123456, ceo123, pkibs123
   - [ ] If login fails, use password reset functionality
   - [ ] Verify redirected to admin dashboard
   - [ ] Check admin role permissions working

2. **Admin Login Verification**:
   - [ ] Dashboard loads without errors
   - [ ] Navigation shows admin sections
   - [ ] User profile shows admin role
   - [ ] All admin menu items accessible

### Step 2: Admin Dashboard Testing
**URL**: http://localhost:3000/admin

3. **Dashboard Access**:
   - [ ] Admin dashboard loads without errors
   - [ ] Statistics display correctly
   - [ ] Navigation menu shows admin options
   - [ ] User role displayed as "admin"

4. **Admin Dashboard Features**:
   - [ ] Total students count displays
   - [ ] Total teachers count displays  
   - [ ] Course statistics accurate
   - [ ] Recent activities shown

### Step 3: Database Setup Testing  
**URL**: http://localhost:3000/admin/database-setup

5. **Database Management**:
   - [ ] Database setup page accessible
   - [ ] Can run database initialization
   - [ ] Success/error messages display
   - [ ] Tables creation status shown

### Step 4: Course Management Testing
**URL**: http://localhost:3000/admin/courses

6. **Course Creation**:
   - [ ] Access admin courses page
   - [ ] Create new course button works
   - [ ] Fill form: "ADMIN TEST Course", description, price
   - [ ] Assign teacher (select from dropdown)
   - [ ] Set scheduled time
   - [ ] Submit course creation
   - [ ] **CRITICAL**: Verify course appears in list
   - [ ] **CRITICAL**: Check course has calendar events

7. **Course Management**:
   - [ ] View existing courses (should show 9+)
   - [ ] Edit course functionality  
   - [ ] Delete course functionality
   - [ ] Teacher assignments work
   - [ ] Student enrollment visible

### Step 5: Calendar Management Testing
**URL**: http://localhost:3000/admin/calendar  

8. **Calendar Functionality**:
   - [ ] Admin calendar loads
   - [ ] View existing events (15+ events)
   - [ ] Create new class event
   - [ ] Create new assignment event
   - [ ] Create new exam event
   - [ ] **CRITICAL**: Events appear in calendar immediately
   - [ ] Different event types have different colors

9. **Event Management**:  
   - [ ] Edit existing events
   - [ ] Delete events
   - [ ] Assign teachers to events
   - [ ] Set event times and dates
   - [ ] All-day events functionality

### Step 6: Teacher Management  
**URL**: http://localhost:3000/admin/lectures

10. **Teacher Oversight**:
    - [ ] View teacher lectures/attendance
    - [ ] Check which classes marked complete
    - [ ] Teacher approval system
    - [ ] Performance metrics

### Step 7: Salary Management
**URL**: http://localhost:3000/admin/salary-management

11. **Salary System**:
    - [ ] View teacher salary calculations
    - [ ] Approve/reject salary payments  
    - [ ] Payment history
    - [ ] Export salary reports

---

## 🧑‍🏫 **PHASE 2: TEACHER TESTING**

### Step 1: Teacher Account Setup
**URL**: http://localhost:3000/signup/teacher

12. **Create Test Teacher**:
    - [ ] Email: `testteacher@test.com`
    - [ ] Password: `testteacher123` 
    - [ ] Full Name: `Test Teacher`
    - [ ] Complete teacher profile
    - [ ] Submit application

13. **Teacher Approval Process**:
    - [ ] Login as admin
    - [ ] Approve new teacher account
    - [ ] Verify teacher gets approved status

### Step 2: Teacher Login & Dashboard
**URL**: http://localhost:3000/login → http://localhost:3000/dashboard/teacher

14. **Teacher Access**:
    - [ ] Login with teacher credentials
    - [ ] Access teacher dashboard  
    - [ ] View assigned courses (from admin)
    - [ ] Dashboard shows correct information

### Step 3: Teacher Calendar Testing
**URL**: http://localhost:3000/dashboard/teacher/calendar

15. **Calendar Integration**:
    - [ ] **CRITICAL**: Teacher sees admin-created courses in calendar
    - [ ] **CRITICAL**: Teacher sees admin-created events  
    - [ ] Calendar displays class schedule
    - [ ] Teacher can view event details

16. **Mark Complete Functionality**:
    - [ ] **CRITICAL ISSUE**: Teacher can mark classes complete
    - [ ] Mark complete button appears on class events
    - [ ] Success message after marking complete
    - [ ] **CRITICAL**: Completion shows in admin salary system
    - [ ] Test with multiple events

### Step 4: Teacher Course Management
**URL**: http://localhost:3000/dashboard/teacher

17. **Course Access**:
    - [ ] Teacher sees courses assigned by admin
    - [ ] Can access course details
    - [ ] Student enrollment lists visible
    - [ ] Course materials accessible

### Step 5: Assignment Management
**URL**: http://localhost:3000/dashboard/teacher/assignments

18. **Assignment Creation**:
    - [ ] Create assignments for admin-created courses
    - [ ] Set assignment deadlines
    - [ ] Upload assignment materials
    - [ ] Assignments appear for students

19. **Assignment Grading**:
    - [ ] View student submissions  
    - [ ] Grade assignments
    - [ ] Provide feedback
    - [ ] Export grades

---

## 🎓 **PHASE 3: STUDENT TESTING**

### Step 1: Student Account Setup  
**URL**: http://localhost:3000/signup/student

20. **Create Test Student**:
    - [ ] Email: `teststudent@test.com`
    - [ ] Password: `teststudent123`
    - [ ] Full Name: `Test Student` 
    - [ ] Complete student profile

### Step 2: Student Course Enrollment
**URL**: http://localhost:3000/courses

21. **Browse Courses**:
    - [ ] **CRITICAL**: Student sees admin-created courses  
    - [ ] Course details display correctly
    - [ ] Enrollment button works
    - [ ] **CRITICAL**: Enrollment confirmation process

22. **Enrollment Testing**:
    - [ ] Enroll in admin-created course
    - [ ] Verify enrollment success  
    - [ ] Check course appears in student dashboard
    - [ ] Access course materials

### Step 3: Student Dashboard
**URL**: http://localhost:3000/dashboard/student  

23. **Student Portal**:
    - [ ] Student dashboard loads
    - [ ] Enrolled courses displayed
    - [ ] Assignment notifications
    - [ ] Calendar integration

### Step 4: Assignment Submission
**URL**: http://localhost:3000/dashboard/student/assignments

24. **Assignment System**:
    - [ ] **CRITICAL**: Student sees teacher-created assignments
    - [ ] Assignment submission form works
    - [ ] File upload functionality  
    - [ ] Submission confirmation
    - [ ] View submission history

### Step 5: Student Calendar
**URL**: http://localhost:3000/dashboard/student/calendar

25. **Calendar Access**:
    - [ ] Student sees class schedule
    - [ ] Assignment due dates visible
    - [ ] Exam dates displayed
    - [ ] Event details accessible

---

## 🔄 **PHASE 4: INTEGRATION TESTING**

### Admin → Teacher → Student Flow

26. **Complete Workflow Test**:
    - [ ] Admin creates course "Integration Test Course"
    - [ ] Admin assigns teacher to course  
    - [ ] Admin creates class events for course
    - [ ] **Verify**: Teacher sees course and events in calendar
    - [ ] Teacher creates assignment for course
    - [ ] Student enrolls in course
    - [ ] **Verify**: Student sees course, events, and assignments
    - [ ] Student submits assignment
    - [ ] **Verify**: Teacher sees submission
    - [ ] Teacher grades assignment
    - [ ] **Verify**: Student sees grade
    - [ ] Teacher marks class complete
    - [ ] **Verify**: Admin sees for salary approval

### Critical Integration Points

27. **Database Trigger Testing**:
    - [ ] Course creation → Calendar event creation  
    - [ ] Event creation → Teacher attendance records
    - [ ] Mark complete → Salary calculations
    - [ ] Student enrollment → Course access

28. **Permission Testing**:
    - [ ] Admin can access all areas
    - [ ] Teacher cannot access admin areas  
    - [ ] Student cannot access admin/teacher areas
    - [ ] Proper redirects for unauthorized access

---

## 🎯 **SUCCESS CRITERIA**

### Complete System Testing (All Features):
- ✅ **Admin Authentication & Dashboard** → Full admin functionality access
- ✅ **Course Management System** → Create, edit, delete, assign teachers
- ✅ **Calendar System** → All event types, proper display, editing
- ✅ **Teacher Management** → Account approval, course assignments, salary tracking  
- ✅ **Student Management** → Enrollment process, progress tracking, assignments
- ✅ **Assignment System** → Creation, submission, grading workflow
- ✅ **Salary & Payment System** → Teacher compensation, approval workflow
- ✅ **Database Integrity** → All triggers, constraints, relationships working
- ✅ **User Role Permissions** → Proper access control and security
- ✅ **End-to-End Workflows** → Complete admin→teacher→student interactions

### Critical Integration Points:
- Admin creates course → Teacher sees in calendar → Student can enroll
- Teacher marks complete → Admin sees for salary → Payment processed  
- Student submits assignment → Teacher grades → Student sees feedback
- All user roles have appropriate permissions and redirects

---

## 📝 **TESTING NOTES**

**Current Browser**: Use http://localhost:3000 in browser  
**Test Accounts**: Create fresh accounts for testing  
**Data**: Existing data available for testing  
**Focus**: Test the 3 main issues identified + complete workflow

**Next Action**: Start with Phase 1, Step 1 - Admin account creation
