# User Approval Workflow - Testing Guide

## ✅ Complete Integration Status

All components are now properly connected and handling the pending user approval workflow:

### 1️⃣ **Register Page** ✅
- **File**: `register.html`
- **Status**: ✅ Connected
- **Features**:
  - Blue info banner: "Registration Approval: All new accounts require admin approval"
  - Success message: "Registration submitted successfully! Your account is pending admin approval"
  - Error handling for database constraint issues
  - Creates users with `status='pending'`

### 2️⃣ **Login Page** ✅
- **File**: `login.html`
- **Status**: ✅ Connected
- **Features**:
  - Blocks pending users with message: "⏳ Your account is pending admin approval"
  - Blocks inactive/suspended users: "🚫 Your account is not active"
  - Enhanced error message detection with icons
  - Only allows `status='active'` users to login

### 3️⃣ **Backend Validation** ✅
- **File**: `authService.ts`
- **Status**: ✅ Connected
- **Features**:
  - Registration creates `status='pending'`
  - Login checks: pending → 403 error
  - Login checks: inactive/suspended → 403 error
  - Only active users can authenticate

### 4️⃣ **Admin Panel** ✅
- **File**: `admin-manage-users.html`
- **Status**: ✅ Connected
- **Features**:
  - Dual-table system (Verified vs Unverified)
  - Badge showing pending count: "X pending"
  - Yellow background for pending users
  - **Approve button**: Sets `status='active'` → user can login
  - **Reject button**: Permanently deletes registration
  - Confirmation dialogs with user details
  - Auto-refresh after actions

### 5️⃣ **Database** ⚠️
- **File**: `run-migration.sql`
- **Status**: ⚠️ NEEDS TO BE RUN
- **Action Required**: Run migration in Supabase SQL Editor
- **What it does**: Adds 'pending' as valid status value

---

## 🧪 Testing Checklist

### Step 1: Run Database Migration
```sql
-- In Supabase SQL Editor, run:
-- database-migrations/run-migration.sql
```

Expected output:
```
✓ Dropped old status constraint
✓ Added new status constraint with pending support
✓ New constraint definition: CHECK (status IN ...)
```

### Step 2: Test Registration Flow

1. Go to `/html/auth/register.html`
2. ✅ Check: Blue info banner about approval is visible
3. Fill out registration form with test data:
   - School ID: `888888`
   - Email: `test888@mabinicolleges.edu.ph`
   - Password: `test123`
   - Role: Student/Tutor
4. Submit form
5. ✅ Check: Success message shows "pending admin approval"
6. ✅ Check: Redirects to login after 4 seconds

### Step 3: Test Login Block (Before Approval)

1. Go to `/html/auth/login.html`
2. Try to login with the test account
3. ✅ Check: Error shows "⏳ Your account is pending admin approval"
4. ✅ Check: Login is blocked
5. ✅ Check: Stays on login page

### Step 4: Test Admin Panel - Unverified Users

1. Login as admin
2. Go to Admin → Manage Users
3. ✅ Check: "Unverified Users (Pending Approval)" section visible
4. ✅ Check: Badge shows "1 pending"
5. ✅ Check: Test user appears with yellow background
6. ✅ Check: Approve and Reject buttons visible

### Step 5: Test Approval Process

1. Click **"Approve"** button on test user
2. ✅ Check: Confirmation dialog shows:
   - Name, School ID, Role, Email
   - Message: "This user will be able to login after approval"
3. Confirm approval
4. ✅ Check: Success message: "User has been approved and can now login!"
5. ✅ Check: User moves to "All Users" table
6. ✅ Check: Badge updates: "0 pending"

### Step 6: Test Login Success (After Approval)

1. Logout from admin
2. Go to `/html/auth/login.html`
3. Login with test account
4. ✅ Check: Login successful
5. ✅ Check: Redirects to appropriate dashboard (student/tutor)
6. ✅ Check: User can access system normally

### Step 7: Test Rejection Process

1. Register another test user:
   - School ID: `999999`
   - Email: `test999@mabinicolleges.edu.ph`
2. Login as admin → Manage Users
3. Click **"Reject"** on the new user
4. ✅ Check: Confirmation dialog shows user details
5. ✅ Check: Message: "This will permanently delete the registration"
6. Confirm rejection
7. ✅ Check: Success message: "User registration has been rejected and deleted"
8. ✅ Check: User removed from unverified table
9. Try to register with same email again
10. ✅ Check: Registration works (user was deleted, not just deactivated)

---

## 🔄 Complete Flow Diagram

```
NEW USER
   │
   ├──> 1. Visits /register.html
   │         • Sees info banner about approval
   │         • Fills form
   │         • Submits
   │
   ├──> 2. Backend (authService.ts)
   │         • Creates user with status='pending'
   │         • Returns success
   │
   ├──> 3. Register Page
   │         • Shows "pending approval" message
   │         • Redirects to login
   │
   ├──> 4. User tries to login
   │         • Backend checks status
   │         • status='pending' → 403 error
   │         • Shows "pending approval" message
   │         • Login blocked ❌
   │
   ├──> 5. ADMIN sees new user
   │         • Goes to Manage Users
   │         • "Unverified Users" section
   │         • Badge shows "1 pending"
   │         • User in yellow row
   │
   ├──> 6a. ADMIN clicks "Approve"
   │         • Confirmation dialog
   │         • Updates status='active'
   │         • User moves to "All Users"
   │         • Badge updates "0 pending"
   │         │
   │         └──> 7. User can now login ✅
   │                • Backend checks status
   │                • status='active' → allowed
   │                • Redirects to dashboard
   │                • Full system access
   │
   └──> 6b. ADMIN clicks "Reject"
            • Confirmation dialog
            • Deletes user permanently
            • Removed from database
            • User must re-register
```

---

## 🎯 Key Integration Points

### Register → Backend
```javascript
// register.html
const response = await window.API.auth.register(formData);
// ↓
// authService.ts
status: 'pending'  // Created with pending status
```

### Login → Backend
```javascript
// login.html
const response = await window.API.auth.login({ email, password });
// ↓
// authService.ts
if (user.status === 'pending') {
  throw createError('Your account is pending admin approval...', 403);
}
// ↓
// login.html catches error
if (error.message.includes('pending admin approval')) {
  errorMsg = '⏳ Your account is pending admin approval...';
}
```

### Admin → Backend
```javascript
// admin-manage-users.html
await api.put(`/admin/users/${userId}`, { status: 'active' });
// ↓
// adminController.ts → updateUser()
// Updates user.status = 'active'
// ↓
// User can now login
```

---

## 🐛 Troubleshooting

### Issue: Registration fails with "check constraint" error
**Solution**: Database migration not run yet
```sql
-- Run in Supabase SQL Editor
-- File: database-migrations/run-migration.sql
```

### Issue: Pending users can login
**Solution**: Backend status check not working
```typescript
// Check authService.ts login function
if (user.status === 'pending') {
  throw createError('Your account is pending...', 403);
}
```

### Issue: Unverified users not showing in admin
**Solution**: Check filter in loadUsers
```javascript
const unverifiedUsers = response.users.filter(u => u.status === 'pending');
```

### Issue: Approve button doesn't work
**Solution**: Check API endpoint
```javascript
await api.put(`/admin/users/${userId}`, { status: 'active' });
```

---

## 📝 Status Summary

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Registration Form | register.html | ✅ Ready | Shows approval banner + success message |
| Login Page | login.html | ✅ Ready | Blocks pending users with clear message |
| Backend Auth | authService.ts | ✅ Ready | Creates pending, validates on login |
| Admin Panel | admin-manage-users.html | ✅ Ready | Dual table with approve/reject |
| Database | Supabase | ⚠️ Pending | **Need to run migration** |

---

## 🚀 Next Steps

1. **REQUIRED**: Run `run-migration.sql` in Supabase SQL Editor
2. **TEST**: Follow testing checklist above
3. **OPTIONAL**: Set up email notifications for approvals
4. **OPTIONAL**: Add pending count to admin dashboard stats

---

## ✨ Benefits of This Workflow

- ✅ **Security**: No unauthorized access before admin review
- ✅ **Control**: Admin manually approves each registration
- ✅ **Transparency**: Users know they need approval
- ✅ **Clean Data**: Reject spam/invalid registrations
- ✅ **Audit Trail**: Track who registers and when
- ✅ **Flexibility**: Admin can approve or reject with reasons
- ✅ **No Migration Pain**: Uses existing database column
