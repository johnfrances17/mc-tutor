# Custom Subject Creation Feature - Complete Guide

## 🎯 Feature Overview

This huge QOL (Quality of Life) improvement allows tutors to:
1. **Add existing subjects** from the standardized catalog
2. **Create custom subjects** that aren't in the catalog

Custom subjects require **admin approval** before they become visible to students.

---

## 🚀 Components Implemented

### 1️⃣ **Tutor Interface - Enhanced Subject Management**
**File**: `tutor-my-subjects.html`

**Changes**:
- Replaced inline form with modal system
- Added tabbed interface: "Existing Subjects" vs "Create Custom Subject"
- Dual submission forms for different workflows

**Features**:
- **Tab 1 - Existing Subjects**:
  - Dropdown with all available subjects
  - Select proficiency level
  - Set physical location
  
- **Tab 2 - Create Custom Subject**:
  - Subject Code (e.g., CS101, MATH201)
  - Subject Name
  - Course selection
  - Description (optional)
  - Proficiency level
  - Physical location

### 2️⃣ **Backend API - Custom Subject Creation**
**Files**: 
- `subjectController.ts`
- `subjectRoutes.ts`
- `adminController.ts`

**New Endpoints**:
```
POST /api/subjects/custom
- Creates tutor-generated custom subject
- Requires authentication
- Sets is_custom=true, approval_status='pending'

PUT /api/admin/subjects/:id
- Updated to support approval_status field
- Admin can set: 'pending', 'approved', 'rejected'
```

### 3️⃣ **Database Schema Updates**
**File**: `add-custom-subjects-tracking.sql`

**New Columns**:
```sql
subjects table:
- is_custom (BOOLEAN) - Marks tutor-created subjects
- created_by_tutor_id (INTEGER) - References which tutor created it
- approval_status (VARCHAR) - 'pending', 'approved', or 'rejected'
```

### 4️⃣ **Admin Panel - Subject Management**
**File**: `admin-manage-subjects.html`

**New Section**: "Pending Custom Subjects"
- Shows subjects awaiting approval
- Badge with pending count
- Table with subject details
- Approve/Reject buttons

---

## 🔄 Complete Workflow

### **Tutor Creates Custom Subject**

1. **Tutor** goes to "My Subjects" page
2. Clicks **"Add Subject"** button
3. Modal opens with 2 tabs
4. Switches to **"Create Custom Subject"** tab
5. Fills in form:
   - Subject Code: `WEB301`
   - Subject Name: `Advanced Web Development`
   - Course: `BSCS`
   - Description: `Deep dive into modern web frameworks`
   - Proficiency: `Expert`
   - Physical Location: `Computer Lab 2`
6. Clicks **"Create & Add Subject"**
7. Backend creates subject with:
   ```javascript
   {
     is_custom: true,
     created_by_tutor_id: 123,
     approval_status: 'pending'
   }
   ```
8. Subject is **NOT visible to students yet**
9. Shows success message: "Custom subject created! Pending admin approval"

### **Admin Reviews and Approves**

1. **Admin** goes to "Manage Subjects"
2. Sees **"Pending Custom Subjects"** section
3. Badge shows: "1 pending"
4. Table displays:
   - Code: WEB301
   - Name: Advanced Web Development
   - Course: BSCS
   - Created By: Tutor ID 123
   - Date: Today
   - Actions: [Approve] [Reject]
5. Admin reviews the subject
6. Clicks **"Approve"**
7. Confirmation dialog appears
8. Backend updates: `approval_status = 'approved'`
9. Subject moves to "All Subjects" list
10. Subject is **NOW visible to students**

### **Student Sees Approved Subject**

1. **Student** goes to "Find Tutors"
2. Searches for subjects
3. Now sees "WEB301 - Advanced Web Development" in results
4. Can book sessions with tutors teaching this subject

---

## 💾 Database Migration Required

**IMPORTANT**: Run this migration before using the feature!

### Migration File
`database-migrations/add-custom-subjects-tracking.sql`

### How to Run

**Option 1: Supabase Dashboard**
```sql
-- Copy and paste into SQL Editor

BEGIN;

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS created_by_tutor_id INTEGER REFERENCES users(user_id);
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT NULL;

UPDATE subjects SET is_custom = FALSE WHERE is_custom IS NULL;

CREATE INDEX IF NOT EXISTS idx_subjects_is_custom ON subjects(is_custom);
CREATE INDEX IF NOT EXISTS idx_subjects_approval_status ON subjects(approval_status);
CREATE INDEX IF NOT EXISTS idx_subjects_created_by_tutor ON subjects(created_by_tutor_id);

COMMIT;
```

**Option 2: psql Command Line**
```bash
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f add-custom-subjects-tracking.sql
```

### Verification
```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subjects' 
AND column_name IN ('is_custom', 'created_by_tutor_id', 'approval_status');

-- Should return 3 rows
```

---

## 🧪 Testing Checklist

### Step 1: Run Database Migration
- [  ] Run migration in Supabase SQL Editor
- [  ] Verify columns added: `is_custom`, `created_by_tutor_id`, `approval_status`
- [  ] Check existing subjects marked as `is_custom = FALSE`

### Step 2: Test Existing Subject Addition
1. Login as **Tutor**
2. Go to "My Subjects"
3. Click "Add Subject"
4. Stay on "Existing Subjects" tab
5. [  ] Select subject from dropdown
6. [  ] Set proficiency and location
7. [  ] Submit form
8. [  ] Subject appears in "My Subjects" list immediately
9. [  ] No admin approval needed

### Step 3: Test Custom Subject Creation
1. Still logged in as **Tutor**
2. Click "Add Subject" again
3. Switch to "Create Custom Subject" tab
4. Fill in form:
   - Code: `TEST101`
   - Name: `Test Subject`
   - Course: `BSCS`
   - Description: `Testing custom subjects`
   - Proficiency: `Intermediate`
   - Location: `Test Lab`
5. [  ] Submit form
6. [  ] Success message shows: "Pending admin approval"
7. [  ] Subject appears in "My Subjects" list
8. [  ] Note: It's marked as pending/not visible to students yet

### Step 4: Test Admin Approval
1. Logout and login as **Admin**
2. Go to "Manage Subjects"
3. [  ] See "Pending Custom Subjects" section
4. [  ] Badge shows "1 pending"
5. [  ] Table shows TEST101 subject
6. [  ] Subject has yellow background
7. Click "Approve"
8. [  ] Confirmation dialog appears
9. Confirm approval
10. [  ] Success message: "Custom subject approved!"
11. [  ] Subject moves to "All Subjects" list
12. [  ] Badge updates: "0 pending"

### Step 5: Test Student Visibility
1. Logout and login as **Student**
2. Go to "Find Tutors"
3. [  ] Search for tutors
4. [  ] TEST101 appears in subject filters/options
5. [  ] Can see tutors teaching TEST101
6. [  ] Can book sessions for TEST101

### Step 6: Test Rejection
1. Login as **Tutor** again
2. Create another custom subject: `REJECT202`
3. Login as **Admin**
4. Go to "Manage Subjects" → "Pending Custom Subjects"
5. Click "Reject" on REJECT202
6. [  ] Confirmation dialog appears
7. Confirm rejection
8. [  ] Subject deleted from database
9. [  ] Removed from tutor's subject list
10. [  ] Never appears to students

### Step 7: Test Duplicate Prevention
1. Login as **Tutor**
2. Try to create subject with existing code (e.g., `CS101`)
3. [  ] Error message: "Subject code already exists"
4. [  ] Form not submitted
5. [  ] Tutor can use existing subject instead

---

## 📊 Data Flow Diagram

```
TUTOR CREATES CUSTOM SUBJECT
    ↓
POST /api/subjects/custom
    ↓
Database INSERT
    subject_code: "WEB301"
    subject_name: "Advanced Web Development"
    course_code: "BSCS"
    is_custom: TRUE
    created_by_tutor_id: 123
    approval_status: 'pending'
    ↓
Tutor adds to their teaching list
    POST /api/tutors/subjects
    ↓
Subject appears in tutor's list
    (but not visible to students)
    ↓
ADMIN SEES IN PENDING SECTION
    GET /api/subjects → filters by approval_status='pending'
    ↓
ADMIN CLICKS "APPROVE"
    ↓
PUT /api/admin/subjects/:id
    { approval_status: 'approved' }
    ↓
Subject moves to "All Subjects"
    ↓
STUDENTS CAN NOW SEE IT
    GET /api/subjects → includes approved custom subjects
    ↓
Students can book sessions
```

---

## 🎨 UI/UX Improvements

### Modal Design
- **Tabbed Interface**: Clean separation of existing vs custom
- **Color Coding**:
  - Blue banner: Info about existing subjects
  - Orange banner: Info about custom subjects (needs approval)
- **Responsive**: Works on mobile and desktop

### Admin Panel
- **Pending Section**: Highlighted with yellow background
- **Badge Counter**: Shows pending count at a glance
- **Confirmation Dialogs**: Clear details before approve/reject
- **Auto-refresh**: Tables update immediately after actions

### Status Indicators
- Custom subjects in tutor's list: Badge showing "Pending Approval"
- Approved subjects: No special indicator (standard subject)
- Rejected subjects: Automatically removed

---

## 🔒 Security & Validation

### Backend Validation
- ✅ Authentication required for custom subject creation
- ✅ Valid course codes only (BSA, BSBA, etc.)
- ✅ Duplicate subject code prevention
- ✅ Admin-only approval endpoints
- ✅ Sanitized input (prevents SQL injection)

### Business Rules
- ✅ Custom subjects default to `approval_status='pending'`
- ✅ Only approved subjects visible to students
- ✅ Tutor who created it can see it immediately in their list
- ✅ Standard subjects (not custom) don't need approval

---

## 📝 Key Benefits

### For Tutors
- ✅ **Flexibility**: Teach subjects not in catalog
- ✅ **Specialization**: Create niche subjects
- ✅ **No Waiting**: Can start preparing materials immediately
- ✅ **Clear Feedback**: Know when approved/rejected

### For Admins
- ✅ **Control**: Review all custom subjects before students see them
- ✅ **Quality**: Ensure subjects meet standards
- ✅ **Easy Management**: Simple approve/reject workflow
- ✅ **Visibility**: Badge shows pending count

### For Students
- ✅ **More Options**: Access to specialized subjects
- ✅ **Quality**: Only admin-approved subjects available
- ✅ **Consistency**: All subjects follow same booking process
- ✅ **Trust**: Know subjects are vetted

---

## 🐛 Troubleshooting

### Issue: Custom subject creation fails
**Error**: "Column 'is_custom' does not exist"
**Solution**: Run the database migration

### Issue: Pending subjects not showing in admin panel
**Solution**: Check that `loadSubjects()` filters by `approval_status='pending'`

### Issue: Approved subject not visible to students
**Solution**: 
1. Check subject `approval_status` is 'approved'
2. Check `is_custom` doesn't filter it out
3. Verify getAllSubjects endpoint returns it

### Issue: Duplicate subject code error
**Expected**: This is correct behavior
**Solution**: Tutor should use existing subject or choose different code

---

## 🚀 Future Enhancements

### Possible Improvements
1. **Email Notifications**: Notify tutor when subject approved/rejected
2. **Rejection Reason**: Admin can provide reason for rejection
3. **Edit Pending Subjects**: Tutor can edit while pending
4. **Subject Categories**: Tag custom subjects by topic
5. **Approval History**: Track who approved what and when
6. **Bulk Approval**: Admin can approve multiple at once
7. **Auto-approval**: After X approved subjects, tutor gets auto-approve privilege

---

## ✅ Summary

**What Was Built:**
- Modal-based subject addition with 2 workflows
- Backend API for custom subject creation
- Database schema for tracking custom subjects
- Admin approval workflow
- Complete integration across tutor and admin panels

**Migration Needed:**
- Run `add-custom-subjects-tracking.sql` in Supabase

**Testing:**
- Follow testing checklist to verify all workflows

**Result:**
- Tutors have freedom to create specialized subjects
- Admins maintain quality control
- Students get access to approved custom subjects
- Platform becomes more flexible and valuable

