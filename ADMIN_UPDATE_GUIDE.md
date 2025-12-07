# MC Tutor - Admin Navigation Update Guide

## Summary
Lahat ng admin pages ay dapat may:
1. **Montserrat font** - Para consistent across all pages
2. **Modern navbar** - User info sa loob, collapsible secondary nav
3. **Blurple gradient** (#5865F2 to #4752C4) - Para sa admin theme
4. **Mobile responsive** - Working sa lahat ng screen sizes
5. **Floating message button** - Quick access to messenger

## Status

### ✅ COMPLETED FILES:
- `admin-dashboard.html` - UPDATED with new navigation structure
- `messenger.html` - Pending (needs role-based secondary nav)

### ⏳ PENDING FILES (Need same treatment):
- admin-manage-users.html
- admin-manage-sessions.html
- admin-manage-subjects.html
- admin-view-materials.html
- admin-view-sessions.html

## Key Changes Needed for Each Admin File:

### 1. Add Montserrat Font (sa <head>)
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 2. Replace Navbar Structure
**OLD (simple links)**:
```html
<nav class="navbar">
    <div class="nav-container">
        <a href="..." class="nav-brand">MC Tutor Admin</a>
        <div class="nav-links">
            <a href="...">Dashboard</a>
            <a href="...">Users</a>
            ...
        </div>
    </div>
</nav>
```

**NEW (modern with user info + collapsible secondary)**:
```html
<nav class="navbar">
    <div class="nav-container">
        <a href="/html/admin/admin-dashboard.html" class="nav-brand">MC Tutor Admin</a>
        <div class="nav-right">
            <!-- User Info Badge -->
            <div class="user-info-inline">
                <div class="user-avatar-small" data-user-avatar>
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="user-details-inline">
                    <span class="user-name-inline" data-user-name>Admin</span>
                    <span class="user-role-badge-inline" data-user-role>ADMIN</span>
                </div>
            </div>
            <!-- Nav Links -->
            <div class="nav-links">
                <button class="nav-menu-btn" id="navToggleBtn" title="Toggle Menu">
                    <i class="fas fa-bars"></i>
                </button>
                <a href="/html/shared/profile.html" class="nav-link">Profile</a>
                <a href="#" class="nav-link" id="logoutBtn">Logout</a>
            </div>
        </div>
    </div>
</nav>

<!-- Collapsible Secondary Navigation -->
<nav class="secondary-navbar" id="secondaryNav">
    <div class="secondary-nav-container">
        <div class="secondary-nav-links">
            <a href="/html/admin/admin-dashboard.html" class="secondary-nav-link">Dashboard</a>
            <a href="/html/admin/admin-manage-users.html" class="secondary-nav-link">Users</a>
            <a href="/html/admin/admin-manage-sessions.html" class="secondary-nav-link">Sessions</a>
            <a href="/html/admin/admin-manage-subjects.html" class="secondary-nav-link">Subjects</a>
            <a href="/html/admin/admin-view-materials.html" class="secondary-nav-link">Materials</a>
        </div>
    </div>
</nav>

<!-- Floating Message Button -->
<a href="/html/shared/messenger.html" class="floating-message-btn" title="Messages">
    <i class="fas fa-comments"></i>
</a>
```

### 3. Add Navigation Toggle Script (before </body>)
```javascript
// Secondary Navigation Toggle
const navToggleBtn = document.getElementById('navToggleBtn');
const secondaryNav = document.getElementById('secondaryNav');

if (navToggleBtn && secondaryNav) {
    const isNavCollapsed = localStorage.getItem('secondaryNavCollapsed') === 'true';
    if (isNavCollapsed) {
        secondaryNav.classList.add('collapsed');
        navToggleBtn.classList.add('collapsed');
    }

    navToggleBtn.addEventListener('click', () => {
        secondaryNav.classList.toggle('collapsed');
        navToggleBtn.classList.toggle('collapsed');
        localStorage.setItem('secondaryNavCollapsed', secondaryNav.classList.contains('collapsed'));
    });
}

// Highlight active page
const currentPath = window.location.pathname;
document.querySelectorAll('.secondary-nav-link').forEach(link => {
    if (currentPath.includes(link.getAttribute('href').split('/').pop())) {
        link.classList.add('active');
    }
});
```

### 4. CSS Updates Needed
Replace old navbar/user header styles with the complete style block from `admin-dashboard.html` (lines 10-150+).

Key styles include:
- `.navbar`, `.nav-container`, `.nav-brand`, `.nav-right`
- `.user-info-inline`, `.user-avatar-small`, `.user-details-inline`
- `.secondary-navbar`, `.secondary-nav-container`, `.secondary-nav-links`
- `.floating-message-btn`
- Mobile responsive styles (@media queries)
- **Blurple gradient**: `linear-gradient(135deg, #5865F2 0%, #4752C4 100%)`

### 5. Remove Old Elements
- Delete `.user-header` component (kung meron pa)
- Remove old nav link structure

## Messenger.html Special Case

messenger.html needs **ROLE-BASED secondary nav**:

```javascript
// In messenger.html, add after getCurrentUser():
if (currentUser.role === 'tutee') {
    document.querySelector('.secondary-nav-links').innerHTML = `
        <a href="/html/tutee/student-dashboard.html" class="secondary-nav-link">Dashboard</a>
        <a href="/html/tutee/student-find-tutors.html" class="secondary-nav-link">Find Tutors</a>
        <a href="/html/tutee/student-my-sessions.html" class="secondary-nav-link">My Sessions</a>
        <a href="/html/tutee/student-study-materials.html" class="secondary-nav-link">Study Materials</a>
    `;
} else if (currentUser.role === 'tutor') {
    document.querySelector('.secondary-nav-links').innerHTML = `
        <a href="/html/tutor/tutor-dashboard.html" class="secondary-nav-link">Dashboard</a>
        <a href="/html/tutor/tutor-my-sessions.html" class="secondary-nav-link">My Sessions</a>
        <a href="/html/tutor/tutor-materials.html" class="secondary-nav-link">Materials</a>
    `;
} else if (currentUser.role === 'admin') {
    document.querySelector('.secondary-nav-links').innerHTML = `
        <a href="/html/admin/admin-dashboard.html" class="secondary-nav-link">Dashboard</a>
        <a href="/html/admin/admin-manage-users.html" class="secondary-nav-link">Users</a>
        <a href="/html/admin/admin-manage-sessions.html" class="secondary-nav-link">Sessions</a>
        <a href="/html/admin/admin-manage-subjects.html" class="secondary-nav-link">Subjects</a>
        <a href="/html/admin/admin-view-materials.html" class="secondary-nav-link">Materials</a>
    `;
}

// Also update gradient colors based on role
if (currentUser.role === 'admin') {
    document.querySelector('.secondary-navbar').style.background = 
        'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)';
    document.querySelector('.user-info-inline').style.background = 
        'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)';
}
```

## Color Reference
- **Student/Tutor Purple**: `#667eea` to `#764ba2`
- **Admin Blurple**: `#5865F2` to `#4752C4`
- **Logout Red**: `#dc3545`

## Testing Checklist
For each updated file:
- [ ] Montserrat font loads
- [ ] Navbar shows user info badge
- [ ] Toggle button collapses/expands secondary nav
- [ ] Active page highlighted in secondary nav
- [ ] Floating message button visible
- [ ] Responsive on mobile (check at 768px, 480px)
- [ ] Blurple gradient for admin pages
- [ ] Logout button red

## Files Reference
- Template: `c:\xampp\htdocs\mc-tutor\public\html\tutee\student-dashboard.html` (for structure)
- Completed: `c:\xampp\htdocs\mc-tutor\public\html\admin\admin-dashboard.html` (for admin colors)
- Styles: Copy from admin-dashboard.html lines ~10-200

## Next Steps
1. Run `001_transform_to_3_names.sql` in Supabase
2. Update remaining admin files with new navigation
3. Update messenger.html with role-based secondary nav
4. Test all pages on desktop + mobile
5. Verify consistent design across all roles
