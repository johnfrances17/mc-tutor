# Course Reduction & Admin Login - Implementation Summary

## Date: January 2025

## Changes Implemented

### 1. Course List Reduction (register.html)

**Previous State**: 20+ courses across 9 categories
- Business & Management (4 courses)
- Education (2 courses)
- Computer Studies (2 courses)
- Health Sciences (3 courses)
- Criminal Justice (1 course)
- Law (1 course)
- Arts & Sciences (3 courses)
- Engineering (3 courses)
- Hospitality (2 courses)

**Current State**: Exactly 6 courses (no optgroups)
```html
<select id="course" name="course" required>
  <option value="">Select course</option>
  <option value="BSA">BS in Accountancy</option>
  <option value="BSBA">BS in Business Administration</option>
  <option value="BSED">Bachelor in Secondary Education</option>
  <option value="BSN">Bachelor of Science in Nursing</option>
  <option value="BSCS">Bachelor of Science in Computer Science</option>
  <option value="BSCrim">Bachelor of Science in Criminology</option>
</select>
```

**Files Modified**:
- `c:\xampp\htdocs\mc-tutor\public\html\register.html` (lines 191-201)

**Impact**:
- Simplified registration process
- Reduced database complexity
- Aligned with actual college offerings
- Cleaner UI without category groups

---

### 2. Admin Login Implementation (login.html)

**Previous State**: Only Student and Tutor role cards (2-column grid)

**Current State**: Student, Tutor, and Admin role cards (3-column grid)

#### CSS Changes:
```css
.role-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* Changed from 1fr 1fr */
  gap: 20px;  /* Changed from 25px */
  margin-bottom: 40px;
}

/* Added tablet responsive breakpoint */
@media (min-width: 769px) and (max-width: 1024px) {
  .role-cards {
    grid-template-columns: 1fr 1fr;  /* 2 columns on tablets */
  }
}
```

#### HTML Changes:
```html
<!-- Added third role card -->
<div class="role-card" onclick="selectRole('admin')">
  <div class="icon">👨‍💼</div>
  <h3>Admin</h3>
  <p>Manage platform, users, and oversee tutoring activities</p>
</div>
```

#### JavaScript Changes:
```javascript
// Enhanced selectRole() function
function selectRole(role) {
  selectedRole = role;
  document.getElementById('roleSelection').style.display = 'none';
  document.getElementById('loginForm').classList.add('active');
  
  // Set role label with mapping
  const roleLabels = {
    'student': 'Student',
    'tutor': 'Tutor',
    'admin': 'Admin'  // Added admin
  };
  document.getElementById('roleLabel').textContent = roleLabels[role] || 'Student';
  
  // Update register link (admin shouldn't have register link)
  const registerLink = document.getElementById('registerLink');
  if (role === 'admin') {
    registerLink.parentElement.style.display = 'none';  // Hide "Don't have an account?"
  } else {
    registerLink.parentElement.style.display = 'block';
    registerLink.href = `/html/register.html?role=${role}`;
  }
}
```

**Files Modified**:
- `c:\xampp\htdocs\mc-tutor\public\html\login.html` (lines 70-74, 166-175, 197-211, 308-327)

**Impact**:
- Admins can now log in through the UI
- Proper role labeling in form
- Registration link hidden for admin (admins don't self-register)
- Responsive design maintained (3 cols desktop, 2 cols tablet, 1 col mobile)

---

### 3. Subject Mapping Documentation

**New File Created**: `c:\xampp\htdocs\mc-tutor\docs\COURSE_SUBJECTS_MAPPING.md`

**Contents**:
- Complete subject lists for all 6 courses
- Subject codes following convention: PREFIX + NUMBER
  - ACC101-110: Accountancy subjects
  - BSBA101-108: Business Admin core
  - EDUC101-110: Education professional subjects
  - NURS101-205: Nursing core and clinical
  - CS101-209: Computer Science programming/advanced
  - CRIM101-304: Criminology law enforcement/corrections
- Shared subjects (BUS, MATH) for cross-course general education
- Database schema examples for implementation
- Frontend integration guidelines

**Subject Count by Course**:
- BSA: 14 subjects (10 core + 4 business)
- BSBA: 14 subjects (8 core + 6 business)
- BSED: 15 subjects (10 professional + 5 specialization)
- BSN: 15 subjects (10 core + 5 clinical)
- BSCS: 21 subjects (8 core + 9 advanced + 4 math)
- BSCrim: 19 subjects (10 core + 5 law enforcement + 4 corrections)

**Usage**:
- Student dashboard: Show available subjects based on their course
- Tutor profile: Select subjects to tutor from their course expertise
- Subject search/filtering: Course-specific subject browsing
- Matching algorithm: Match students with qualified tutors

---

## Authentication Flow Updates

### Login Process (All Roles)
1. User clicks role card (Student/Tutor/Admin)
2. `selectRole(role)` sets role and shows login form
3. Role label updates in form title
4. If admin: registration link hidden
5. User enters credentials
6. Login submitted with role: `student → 'tutee'`, `tutor → 'tutor'`, `admin → 'admin'`
7. Backend validates credentials and role
8. Success: Redirect to role-specific dashboard
   - Admin → `admin-dashboard.html`
   - Tutor → `tutor-dashboard.html`
   - Student (tutee) → `student-dashboard.html`

### Registration Process (Student/Tutor Only)
1. User selects role from login page OR direct to register
2. Fills form including course selection (6 options)
3. Course determines available subjects for future features
4. Registration creates account with course association
5. Redirect to login

### Admin Creation
- Admins are **NOT created through registration**
- Must be created directly in database or through existing admin panel
- Security consideration: Prevents unauthorized admin accounts

---

## Database Considerations

### User Table
Should include `course_code` column:
```sql
ALTER TABLE users ADD COLUMN course_code VARCHAR(10);
-- Values: 'BSA', 'BSBA', 'BSED', 'BSN', 'BSCS', 'BSCrim'
```

### Subjects Table (Recommended)
```sql
CREATE TABLE subjects (
  subject_code VARCHAR(10) PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(10) NOT NULL,
  description TEXT,
  units INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tutor-Subject Relationship
```sql
CREATE TABLE tutor_subjects (
  id SERIAL PRIMARY KEY,
  tutor_id INT REFERENCES users(id),
  subject_code VARCHAR(10) REFERENCES subjects(subject_code),
  proficiency_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing Checklist

### Registration Page
- [ ] Only 6 courses appear in dropdown
- [ ] No optgroups visible
- [ ] Course codes match: BSA, BSBA, BSED, BSN, BSCS, BSCrim
- [ ] Form submits successfully with selected course

### Login Page
- [ ] Three role cards visible (Student, Tutor, Admin)
- [ ] Student card shows 📚 icon
- [ ] Tutor card shows 🎓 icon
- [ ] Admin card shows 👨‍💼 icon
- [ ] All cards clickable
- [ ] Role label updates correctly for each selection
- [ ] Registration link hidden when admin selected
- [ ] Registration link visible for student/tutor
- [ ] Back button returns to role selection

### Admin Login Flow
- [ ] Admin card selects properly
- [ ] "Admin Login" title appears
- [ ] No registration link shown
- [ ] Credentials authenticate correctly
- [ ] Redirects to admin-dashboard.html on success

### Responsive Design
- [ ] Desktop (>1024px): 3 columns for role cards
- [ ] Tablet (769-1024px): 2 columns for role cards
- [ ] Mobile (<768px): 1 column for role cards
- [ ] All layouts maintain proper spacing and alignment

---

## Files Changed Summary

| File | Lines Changed | Type | Description |
|------|---------------|------|-------------|
| `register.html` | 191-201 | Modified | Reduced courses from 20+ to 6 |
| `login.html` | 70-74 | Modified | Changed grid from 2 to 3 columns |
| `login.html` | 166-175 | Added | Tablet responsive breakpoint |
| `login.html` | 197-211 | Modified | Added admin role card HTML |
| `login.html` | 308-327 | Modified | Enhanced selectRole() function |
| `COURSE_SUBJECTS_MAPPING.md` | New file | Created | Complete subject documentation |
| `COURSE_ADMIN_CHANGES.md` | New file | Created | This summary document |

---

## Next Steps (Future Development)

1. **Subject Selection Interface**
   - Add subject selection during registration
   - Create tutor subject expertise selection
   - Implement subject-based tutor search

2. **Database Population**
   - Insert all subjects from COURSE_SUBJECTS_MAPPING.md
   - Link subjects to courses
   - Create admin accounts via SQL

3. **Admin Dashboard Enhancements**
   - User management (CRUD operations)
   - Course/subject management
   - Tutoring session oversight
   - Analytics and reporting

4. **Subject Filtering**
   - Filter tutors by subject expertise
   - Show only course-relevant subjects to students
   - Subject-based matching algorithm

5. **Backend API Updates**
   - Update registration endpoint to validate course codes
   - Add subject endpoints (GET /api/subjects/:course_code)
   - Add tutor subject management endpoints

---

## Deployment Notes

### Git Commit Message Suggestion
```
feat: Reduce courses to 6 and add admin login

- Simplified course selection in registration to 6 core programs
- Added admin login option with 3-column role selection
- Created comprehensive subject mapping documentation
- Updated responsive design for tablet/mobile layouts
- Hide registration link for admin role selection

BREAKING CHANGE: Course list reduced from 20+ to 6 courses
Existing users with deprecated courses may need migration
```

### Vercel Deployment
1. Commit changes to Git
2. Push to GitHub main branch
3. Vercel auto-deploys
4. Test all three login roles
5. Verify course dropdown shows only 6 options

### Database Migration (If Needed)
```sql
-- Update existing users to valid course codes
UPDATE users 
SET course_code = 'BSBA' 
WHERE course_code IN ('BSAIS', 'BSMA', 'BSOA');

UPDATE users 
SET course_code = 'BSED' 
WHERE course_code = 'BEED';

UPDATE users 
SET course_code = 'BSCS' 
WHERE course_code = 'BSIT';

-- Remove orphaned course codes
-- Review and migrate users with courses no longer offered
```

---

## Security Considerations

1. **Admin Registration Disabled**: Admins cannot self-register through the UI
2. **Role Validation**: Backend must validate submitted role against user's actual role
3. **Dashboard Access**: Ensure `requireRole()` middleware protects admin routes
4. **Course Validation**: Backend must validate selected course against allowed list

---

**Implementation Status**: ✅ Complete  
**Testing Status**: ⏳ Pending  
**Deployment Status**: 🚀 Ready to deploy  

**Implemented By**: GitHub Copilot  
**Date**: January 2025
