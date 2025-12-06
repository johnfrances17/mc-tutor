# PowerShell Script: Batch Update All Pages with New Header Design
# This script updates tutee, tutor, admin, and shared pages

Write-Host "=== MC Tutor: Complete Header Design Rollout ===" -ForegroundColor Cyan
Write-Host ""

# Define page configurations
$pages = @(
    # TUTEE PAGES (4 remaining)
    @{
        file = "public\html\tutee\student-book-session.html"
        title = "Book Session"
        role = "tutee"
        activeNav = "Dashboard"
        navLinks = @("Dashboard", "Find Tutors", "My Sessions", "Materials")
    },
    @{
        file = "public\html\tutee\student-study-materials.html"
        title = "Study Materials"
        role = "tutee"
        activeNav = "Materials"
        navLinks = @("Dashboard", "Find Tutors", "My Sessions", "Materials")
    },
    @{
        file = "public\html\tutee\student-give-feedback.html"
        title = "Give Feedback"
        role = "tutee"
        activeNav = "Dashboard"
        navLinks = @("Dashboard", "Find Tutors", "My Sessions", "Materials")
    },
    @{
        file = "public\html\tutee\student-my-feedback.html"
        title = "My Feedback"
        role = "tutee"
        activeNav = "Dashboard"
        navLinks = @("Dashboard", "Find Tutors", "My Sessions", "Materials")
    },
    
    # TUTOR PAGES (4 files)
    @{
        file = "public\html\tutor\tutor-dashboard.html"
        title = "Tutor Dashboard"
        role = "tutor"
        activeNav = "Dashboard"
        navLinks = @("Dashboard", "My Sessions", "My Subjects", "Upload Materials")
    },
    @{
        file = "public\html\tutor\tutor-sessions.html"
        title = "My Sessions"
        role = "tutor"
        activeNav = "My Sessions"
        navLinks = @("Dashboard", "My Sessions", "My Subjects", "Upload Materials")
    },
    @{
        file = "public\html\tutor\tutor-my-subjects.html"
        title = "My Subjects"
        role = "tutor"
        activeNav = "My Subjects"
        navLinks = @("Dashboard", "My Sessions", "My Subjects", "Upload Materials")
    },
    @{
        file = "public\html\tutor\tutor-upload-materials.html"
        title = "Upload Materials"
        role = "tutor"
        activeNav = "Upload Materials"
        navLinks = @("Dashboard", "My Sessions", "My Subjects", "Upload Materials")
    },
    
    # ADMIN PAGES (6 files)
    @{
        file = "public\html\admin\admin-dashboard.html"
        title = "Admin Dashboard"
        role = "admin"
        activeNav = "Dashboard"
        navLinks = @("Dashboard", "Manage Users", "Manage Sessions", "Manage Subjects")
    },
    @{
        file = "public\html\admin\admin-manage-users.html"
        title = "Manage Users"
        role = "admin"
        activeNav = "Manage Users"
        navLinks = @("Dashboard", "Manage Users", "Manage Sessions", "Manage Subjects")
    },
    @{
        file = "public\html\admin\admin-manage-sessions.html"
        title = "Manage Sessions"
        role = "admin"
        activeNav = "Manage Sessions"
        navLinks = @("Dashboard", "Manage Users", "Manage Sessions", "Manage Subjects")
    },
    @{
        file = "public\html\admin\admin-manage-subjects.html"
        title = "Manage Subjects"
        role = "admin"
        activeNav = "Manage Subjects"
        navLinks = @("Dashboard", "Manage Users", "Manage Sessions", "Manage Subjects")
    },
    @{
        file = "public\html\admin\admin-view-materials.html"
        title = "View Materials"
        role = "admin"
        activeNav = "Dashboard"
        navLinks = @("Dashboard", "Manage Users", "Manage Sessions", "Manage Subjects")
    },
    @{
        file = "public\html\admin\admin-view-sessions.html"
        title = "View Sessions"
        role = "admin"
        activeNav = "Manage Sessions"
        navLinks = @("Dashboard", "Manage Users", "Manage Sessions", "Manage Subjects")
    }
)

Write-Host "Pages to Update: $($pages.Count)" -ForegroundColor Yellow
Write-Host ""

# Header Template Generator Function
function Get-HeaderHTML {
    param(
        [string]$Role,
        [array]$NavLinks,
        [string]$ActiveNav,
        [string]$DashboardPath
    )
    
    $navLinksHTML = ""
    foreach ($link in $NavLinks) {
        $activeClass = if ($link -eq $ActiveNav) { " active" } else { "" }
        $href = Get-NavLinkHref -Role $Role -LinkName $link
        $navLinksHTML += "                <a href=`"$href`" class=`"secondary-nav-link$activeClass`">$link</a>`n"
    }
    
    return @"
    <nav class="navbar">
        <div class="nav-container">
            <a href="$DashboardPath" class="nav-brand">MC Tutor</a>
            <div class="nav-right">
                <div class="user-info-inline">
                    <div class="user-avatar-small" data-user-avatar>
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details-inline">
                        <span class="user-name-inline" data-user-name>User</span>
                        <span class="user-role-badge-inline" data-user-role>$($Role.Substring(0,1).ToUpper() + $Role.Substring(1))</span>
                    </div>
                </div>
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
$navLinksHTML            </div>
        </div>
    </nav>

    <!-- Floating Message Button -->
    <a href="/html/shared/messenger.html" class="floating-message-btn" title="Messages">
        <i class="fas fa-comments"></i>
    </a>
"@
}

function Get-NavLinkHref {
    param([string]$Role, [string]$LinkName)
    
    switch ($Role) {
        "tutee" {
            switch ($LinkName) {
                "Dashboard" { return "/html/tutee/student-dashboard.html" }
                "Find Tutors" { return "/html/tutee/student-find-tutors.html" }
                "My Sessions" { return "/html/tutee/student-my-sessions.html" }
                "Materials" { return "/html/shared/materials.html" }
            }
        }
        "tutor" {
            switch ($LinkName) {
                "Dashboard" { return "/html/tutor/tutor-dashboard.html" }
                "My Sessions" { return "/html/tutor/tutor-sessions.html" }
                "My Subjects" { return "/html/tutor/tutor-my-subjects.html" }
                "Upload Materials" { return "/html/tutor/tutor-upload-materials.html" }
            }
        }
        "admin" {
            switch ($LinkName) {
                "Dashboard" { return "/html/admin/admin-dashboard.html" }
                "Manage Users" { return "/html/admin/admin-manage-users.html" }
                "Manage Sessions" { return "/html/admin/admin-manage-sessions.html" }
                "Manage Subjects" { return "/html/admin/admin-manage-subjects.html" }
            }
        }
    }
}

$headerStyles = @"
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Base font styling - Montserrat for all elements */
        * {
            font-family: 'Montserrat', sans-serif;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
        }

        /* Logout button red styling */
        #logoutBtn { color: #dc3545 !important; }
        #logoutBtn:hover { color: #c82333 !important; background-color: rgba(220, 53, 69, 0.1) !important; }
        
        /* Page header styling */
        .page-header {
            max-width: 1200px;
            margin: 40px auto 0;
            padding: 0 20px;
        }
        
        .page-header h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        /* Floating message button */
        .floating-message-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
            text-decoration: none;
            color: white;
            font-size: 24px;
        }
        .floating-message-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        /* Main Navbar */
        .navbar {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .nav-brand {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            text-decoration: none;
        }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 25px;
        }

        .nav-links {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .nav-link {
            color: #333;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .nav-link:hover {
            background: #f0f0f0;
            color: #667eea;
        }

        .nav-menu-btn {
            background: transparent;
            color: #333;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            font-size: 18px;
        }

        .nav-menu-btn:hover {
            background: #f0f0f0;
            color: #667eea;
        }

        .user-info-inline {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 25px;
            color: white;
        }

        .user-avatar-small {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: white;
            color: #667eea;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        .user-details-inline {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .user-name-inline {
            font-weight: 600;
            font-size: 14px;
        }

        .user-role-badge-inline {
            font-size: 11px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Collapsible Secondary Header */
        .secondary-navbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 68px;
            z-index: 999;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 70px;
            overflow: hidden;
        }

        .secondary-navbar.collapsed {
            max-height: 0;
            opacity: 0;
            transform: translateY(-100%);
        }

        .secondary-nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 15px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .secondary-nav-links {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .secondary-nav-link {
            color: white;
            text-decoration: none;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
        }

        .secondary-nav-link:hover {
            background: white;
            color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .secondary-nav-link.active {
            background: white;
            color: #667eea;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        /* Hide old elements */
        .user-header,
        .old-navbar,
        .sidebar {
            display: none !important;
        }
    </style>
"@

$navToggleScript = @"
    <!-- Navigation Toggle Script -->
    <script>
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
    </script>
"@

Write-Host "✓ Templates Generated Successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Manual Update Required:" -ForegroundColor Yellow
Write-Host "This script provides the templates. Apply manually using replace_string_in_file tool." -ForegroundColor White
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- 4 Tutee pages remaining" -ForegroundColor White
Write-Host "- 4 Tutor pages to update" -ForegroundColor White
Write-Host "- 6 Admin pages to update" -ForegroundColor White
Write-Host "- Total: 14 pages" -ForegroundColor Yellow
