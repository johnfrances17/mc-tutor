# Complete Header Update Plan - All Roles

## Issue Identified
- Duplicate Profile/Logout buttons appearing at bottom left
- Caused by old global CSS styles in `/public/css/style.css`
- Need to apply new header design to ALL pages (tutee, tutor, admin, shared)

## Header Design Standards

### Common Elements (All Roles)
1. **Montserrat Font** - Applied globally
2. **Main Navbar** - White background, sticky, user info inline with purple gradient badge
3. **Burger Menu Button** - Toggles secondary navigation
4. **Profile & Logout** - In top-right nav-links
5. **Secondary Navigation** - Purple gradient, collapsible, role-specific links
6. **Floating Message Button** - Bottom-right purple circle
7. **Page Header** - Title with bottom border

### Role-Specific Navigation Links

**Tutee (Student):**
- Dashboard
- Find Tutors
- My Sessions
- Materials

**Tutor:**
- Dashboard
- My Sessions
- My Subjects
- Upload Materials

**Admin:**
- Dashboard
- Manage Users
- Manage Sessions
- Manage Subjects
- View Materials

## Files to Update

### ✅ COMPLETED
1. `public/html/tutee/student-dashboard.html` - Montserrat, new header, logout fixed
2. `public/html/tutee/student-find-tutors.html` - Montserrat, new header, logout fixed
3. `public/html/tutee/student-my-sessions.html` - Montserrat, new header

### ⚠️ PENDING - Tutee Pages (4 files)
4. `public/html/tutee/student-book-session.html`
5. `public/html/tutee/student-study-materials.html`
6. `public/html/tutee/student-give-feedback.html`
7. `public/html/tutee/student-my-feedback.html`

### ⚠️ PENDING - Tutor Pages (4 files)
8. `public/html/tutor/tutor-dashboard.html`
9. `public/html/tutor/tutor-sessions.html`
10. `public/html/tutor/tutor-my-subjects.html`
11. `public/html/tutor/tutor-upload-materials.html`

### ⚠️ PENDING - Admin Pages (6 files)
12. `public/html/admin/admin-dashboard.html`
13. `public/html/admin/admin-manage-users.html`
14. `public/html/admin/admin-manage-sessions.html`
15. `public/html/admin/admin-manage-subjects.html`
16. `public/html/admin/admin-view-materials.html`
17. `public/html/admin/admin-view-sessions.html`

### ⚠️ PENDING - Shared Pages (3 files)
18. `public/html/shared/profile.html`
19. `public/html/shared/materials.html`
20. `public/html/shared/messenger.html`

## CSS Global Fix Needed

Add to `/public/css/style.css`:
```css
/* Hide old legacy navigation elements to prevent conflicts */
.old-navbar,
.legacy-sidebar,
header:not(.modern-header) {
    display: none !important;
}
```

## Automation Strategy

1. **Template Extraction** - Use student-dashboard.html as reference
2. **Role-Based Adaptation** - Adjust navigation links per role
3. **Batch Application** - Update all files in one commit
4. **Testing Checklist** - Verify each page loads correctly

## Next Steps

1. Fix global CSS to hide old elements
2. Batch update all tutee pages (4 remaining)
3. Batch update all tutor pages (4 files)
4. Batch update all admin pages (6 files)
5. Batch update shared pages (3 files)
6. Test authentication flow across all roles
7. Verify logout works consistently everywhere
