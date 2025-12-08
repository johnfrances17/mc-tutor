# 🚀 MC TUTOR - MIGRATION IMPLEMENTATION GUIDE

## ✅ COMPLETED FIXES (Just Now)

### 1. Backend Controllers Updated ✅
- **authController.ts** - Now converts course code to course_id using `getCourseIdByCode()`
- **AuthService.ts** - RegisterData interface updated (course_id: number, year_level: number)
- **AuthService.ts** - All responses include course JOIN (course_code, course_name)
- **validation.ts** - Course list fixed to match Mabini College: BSA, BSBA, BSED, BSN, BSCS, BSCrim
- **server.ts** - Course routes added (`/api/courses`)
- **courseRoutes.ts** - New routes file created

### 2. Helper Functions Available ✅
- `getCourseIdByCode()` - Convert "BSA" → 1
- `parseYearLevel()` - Convert string/number to validated integer 1-4
- `convertTo24HourTime()` - Convert "2:00 PM" → "14:00:00"

### 3. TypeScript Types Updated ✅
- All interfaces in `types/index.ts` match new schema
- Course interface with course_id as primary key
- User interface with course_id FK and year_level as number

---

## 🔥 NEXT STEPS (DO NOW)

### Step 1: Run Database Migration in Supabase

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select project: `axrzqrzlnceaiuiyixif`

2. **Open SQL Editor:**
   - Left sidebar → SQL Editor
   - Click "New Query"

3. **Copy & Paste Migration:**
   ```bash
   # Open this file in VS Code:
   mc-tutor/server/migrations/FULL_SAFE_MIGRATION.sql
   
   # Select ALL (Ctrl+A) → Copy (Ctrl+C)
   # Paste in Supabase SQL Editor
   ```

4. **Execute Migration:**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message
   - Check output: Should see "DROP CASCADE" then "CREATE TABLE" messages

5. **Verify Tables:**
   - Left sidebar → Table Editor
   - Should see:
     - ✅ courses (6 rows: BSA, BSBA, BSED, BSN, BSCS, BSCrim)
     - ✅ users (1 admin user)
     - ✅ subjects
     - ✅ tutor_subjects
     - ✅ tutor_availability
     - ✅ tutor_stats
     - ✅ sessions
     - ✅ materials
     - ✅ feedback
     - ✅ notifications
     - ✅ chats

---

### Step 2: Test Registration Flow

1. **Start Server:**
   ```powershell
   cd c:\xampp\htdocs\mc-tutor\server
   npm run dev
   ```

2. **Open Registration Page:**
   ```
   http://localhost/mc-tutor/public/register.html
   ```

3. **Test Registration:**
   - School ID: `2024-12345`
   - Email: `student@mabinicolleges.edu.ph`
   - Password: `test123`
   - First Name: `Juan`
   - Last Name: `Dela Cruz`
   - Role: `Tutee`
   - Phone: `09123456789`
   - **Course: BSA** (should work now!)
   - **Year Level: 1** (should work now!)

4. **Expected Result:**
   - ✅ Registration successful
   - ✅ Response includes `course_code: "BSA"`
   - ✅ Response includes `course_name: "Bachelor of Science in Accountancy"`
   - ✅ Response includes `year_level: 1`

5. **Check Database:**
   - Supabase → Table Editor → users
   - Should see new user with:
     - `course_id: 1`
     - `year_level: 1`

---

### Step 3: Test Login Flow

1. **Open Login Page:**
   ```
   http://localhost/mc-tutor/public/login.html
   ```

2. **Login with Test User:**
   - Email: `student@mabinicolleges.edu.ph`
   - Password: `test123`
   - Role: `Tutee`

3. **Expected Result:**
   - ✅ Login successful
   - ✅ Redirects to tutee dashboard
   - ✅ Profile shows course name (not course_id)

---

### Step 4: Test Admin Panel

1. **Login as Admin:**
   - Email: `admin@mabinicolleges.edu.ph`
   - Password: `admin123`
   - Role: `Admin`

2. **Check User Management:**
   - Should see users with course names displayed
   - Should see year levels as numbers (1, 2, 3, 4)

---

## 🐛 IF ERRORS OCCUR

### Error: "course_id does not exist"
**Fix:** Migration not run yet. Go to Step 1.

### Error: "Invalid course code"
**Fix:** Frontend sending wrong course value. Check:
```javascript
// In register.html, should be:
<option value="BSA">Bachelor of Science in Accountancy</option>
```

### Error: "Invalid year level"
**Fix:** Frontend sending string instead of number. Check:
```javascript
// In register.html, should be:
<option value="1">1st Year</option>
```

### Error: "courses JOIN not working"
**Fix:** Check if courses table has data:
```sql
SELECT * FROM courses;
-- Should return 6 rows
```

---

## 📊 DATABASE SCHEMA OVERVIEW

### Courses Table
```sql
course_id | course_code | course_name
----------|-------------|-------------
1         | BSA         | Bachelor of Science in Accountancy
2         | BSBA        | Bachelor of Science in Business Administration
3         | BSED        | Bachelor of Secondary Education
4         | BSN         | Bachelor of Science in Nursing
5         | BSCS        | Bachelor of Science in Computer Science
6         | BSCrim      | Bachelor of Science in Criminology
```

### Users Table (Key Fields)
- `user_id` - Primary Key
- `course_id` - Foreign Key → courses.course_id
- `year_level` - INTEGER (1, 2, 3, or 4)
- `role` - 'admin', 'tutor', 'tutee'

---

## ✅ CHECKLIST

- [ ] Run FULL_SAFE_MIGRATION.sql in Supabase
- [ ] Verify 6 courses exist in courses table
- [ ] Verify admin user exists
- [ ] Start backend server (`npm run dev`)
- [ ] Test registration with BSA, year_level 1
- [ ] Test login with new user
- [ ] Check user profile shows course name
- [ ] Test admin panel user list
- [ ] Commit changes to Git

---

## 🚀 GIT COMMIT

After testing, commit the changes:

```powershell
cd c:\xampp\htdocs\mc-tutor
git add .
git commit -m "feat: implement course_id schema migration and controller updates

- Update AuthService to use course_id (FK) and year_level (INTEGER)
- Add getCourseIdByCode() helper for course conversion
- Update validation.ts with correct Mabini College courses
- Add course JOIN to all user queries for display
- Create courseRoutes and courseController
- Update authController to validate and convert course codes
- Ready for FULL_SAFE_MIGRATION.sql execution"
git push origin main
```

---

## 📞 SUPPORT

Supabase Project: `axrzqrzlnceaiuiyixif`
Database: PostgreSQL 15
URL: https://axrzqrzlnceaiuiyixif.supabase.co

**All backend code is ready. Just need to run the migration in Supabase SQL Editor!** 🎉
