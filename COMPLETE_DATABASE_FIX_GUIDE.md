# 🔧 Complete Database Setup & Fix for Student Management

## 🚨 Current Issue
After deleting `courses_enhanced` table, the system can't load courses or payments because:
1. Missing `courses` table
2. Missing `student_enrollments` table 
3. Missing `student_payments` table
4. Wrong foreign key references

## ✅ Complete Fix Process

### Step 1: Run Database Setup SQL
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and run: `complete-database-analysis-setup.sql`
3. This will:
   - ✅ Create `courses` table with sample data
   - ✅ Create `student_enrollments` table
   - ✅ Create `student_payments` table
   - ✅ Set up proper foreign key relationships
   - ✅ Add missing columns to `profiles` table
   - ✅ Create storage bucket for profile pictures

### Step 2: Verify Database Setup
1. Open: `debug-student-management.html` in browser
2. Click "Check Table Status" to verify all tables exist
3. Should see:
   ```
   ✅ profiles: EXISTS
   ✅ courses: EXISTS
   ✅ student_enrollments: EXISTS
   ✅ student_payments: EXISTS
   ```

### Step 3: Test Each API
1. **Test Load Courses**: Should show courses from your `courses` table
2. **Test Manual Payment**: Should work with any valid student ID
3. **Test Student Enrollments**: Should load enrollments with course details
4. **Test Student Payments**: Should load payment history

### Step 4: Test in Admin Interface
1. Go to `/admin/user-management`
2. Click "View Details" on any student
3. Verify:
   - ✅ Course dropdown shows courses from database
   - ✅ Can assign courses to students
   - ✅ Can add manual payments
   - ✅ Payment history displays correctly

## 📋 What the SQL Script Creates

### 1. **courses** table
```sql
- id (uuid, primary key)
- title (text, required)
- description (text, optional)
- price (decimal, required)
- duration (text, optional) 
- status (text, default 'active')
- created_at, updated_at (timestamps)
```

**Sample Data Added:**
- English Basic Course - RM 299
- English Intermediate Course - RM 399
- English Business Course - RM 499
- IELTS Preparation Course - RM 599
- English Conversation Class - RM 199

### 2. **student_enrollments** table
```sql
- id (uuid, primary key)
- student_id (references profiles.id)
- course_id (references courses.id)
- enrolled_at (timestamp)
- enrollment_status ('active', 'completed', 'suspended')
- admin_notes (text, optional)
```

### 3. **student_payments** table
```sql
- id (uuid, primary key)
- student_id (references profiles.id)
- amount (decimal, required)
- payment_method ('cash', 'bank_transfer', 'online', 'card')
- payment_status ('pending', 'approved', 'rejected')
- receipt_url (text, optional)
- admin_notes (text, optional)
- approved_at, approved_by (for tracking approval)
```

### 4. **Enhanced profiles** table
Added columns:
- profile_picture_url
- date_of_birth
- emergency_contact
- phone
- address
- approved (boolean)

## 🔧 API Updates Made

### 1. **Courses API** (`/api/admin/courses/route.ts`)
- ✅ Updated to fetch from `courses` table
- ✅ Uses admin client (bypasses RLS)
- ✅ Enhanced error handling

### 2. **Student Enrollments API** (`/api/admin/student-enrollments/[studentId]/route.ts`)
- ✅ Updated to join with `courses` table
- ✅ Fixed foreign key reference syntax
- ✅ Proper course data structure

### 3. **Student Payments API** (`/api/admin/student-payments/[studentId]/route.ts`)
- ✅ Uses admin client
- ✅ Enhanced error handling

### 4. **Frontend Updates** (`user-management/page.tsx`)
- ✅ Updated TypeScript interfaces
- ✅ Fixed course data access (`enrollment.courses`)
- ✅ Enhanced error handling and logging

## 🧪 Testing Checklist

After running the SQL script, test these:

### ✅ Course Assignment
1. Open student details modal
2. Course dropdown should show 5 courses
3. Select and assign course
4. Should appear in enrolled courses list

### ✅ Manual Payments
1. Enter payment amount
2. Select payment method
3. Add admin notes
4. Should add successfully and appear in history

### ✅ Data Management
1. Edit student profile information
2. Delete enrollments
3. Delete payments
4. All should work without errors

## 🚨 Troubleshooting

### If courses still don't load:
1. Check browser console for errors
2. Verify `courses` table has active courses
3. Check Network tab for API response
4. Ensure Service Role Key is set

### If payments don't work:
1. Use a valid student ID (get from profiles table)
2. Check admin permissions
3. Verify table structure matches schema

### If foreign key errors:
1. Re-run the SQL script
2. Check table relationships in Supabase
3. Verify data types match

## 🎉 Expected Result

After completing all steps:
- ✅ **5 courses** should appear in assignment dropdown
- ✅ **Manual payments** should work perfectly
- ✅ **Student enrollments** should display with course details
- ✅ **All CRUD operations** should function properly
- ✅ **Database relationships** should be properly established

The system will be **fully functional** with your existing `courses` table!
