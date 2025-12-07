# Batch Update All Admin Files with Modern Navigation
# This script updates all admin HTML files efficiently

Write-Host "🚀 Starting Admin Files Update..." -ForegroundColor Cyan

$adminFiles = @(
    "admin-manage-users.html",
    "admin-manage-sessions.html",
    "admin-manage-subjects.html",
    "admin-view-materials.html",
    "admin-view-sessions.html"
)

$basePath = "c:\xampp\htdocs\mc-tutor\public\html\admin\"

# Montserrat font link
$montserratLink = '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">'

# Base CSS to add after <style> tag
$baseCss = @'
        /* Base font styling - Montserrat for all elements */
        * {
            font-family: 'Montserrat', sans-serif;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
        }

'@

# Modern navigation CSS (to add after base CSS)
$navCss = @'
        /* Main Navbar with User Info */
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
            background: linear-gradient(135deg, #5865F2 0%, #4752C4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
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
            color: #5865F2;
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
            color: #5865F2;
        }

        .user-info-inline {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 16px;
            background: linear-gradient(135deg, #5865F2 0%, #4752C4 100%);
            border-radius: 25px;
            color: white;
            max-width: 200px;
            min-width: 100px;
        }

        .user-avatar-small {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: white;
            color: #5865F2;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .user-details-inline {
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow: hidden;
            flex: 1;
        }

        .user-name-inline {
            font-weight: 600;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .user-role-badge-inline {
            font-size: 11px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        /* Collapsible Secondary Header - Blurple Gradient */
        .secondary-navbar {
            background: linear-gradient(135deg, #5865F2 0%, #4752C4 100%);
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
            color: #5865F2;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .secondary-nav-link.active {
            background: white;
            color: #5865F2;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        /* Floating Message Button - Blurple */
        .floating-message-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #5865F2 0%, #4752C4 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(88, 101, 242, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
            text-decoration: none;
            color: white;
            font-size: 24px;
        }

        .floating-message-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(88, 101, 242, 0.6);
        }

        /* Hide old user header */
        .user-header {
            display: none;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 1024px) {
            .user-info-inline {
                max-width: 160px;
            }
        }

        @media (max-width: 768px) {
            .nav-container {
                padding: 10px;
            }

            .nav-brand {
                font-size: 18px;
            }

            .nav-right {
                gap: 10px;
                flex-wrap: nowrap;
            }

            .user-info-inline {
                padding: 6px 10px;
                max-width: 140px;
                min-width: 100px;
                flex-shrink: 1;
            }

            .user-avatar-small {
                width: 30px;
                height: 30px;
                font-size: 14px;
            }

            .user-name-inline {
                font-size: 12px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100px;
            }

            .user-role-badge-inline {
                font-size: 9px;
            }

            .nav-links {
                gap: 8px;
            }

            .nav-link {
                padding: 6px 10px;
                font-size: 14px;
            }

            .nav-menu-btn {
                padding: 6px 10px;
                font-size: 16px;
            }

            .secondary-navbar {
                top: 58px;
            }

            .secondary-nav-container {
                padding: 10px;
                overflow-x: auto;
                justify-content: flex-start;
            }

            .secondary-nav-links {
                gap: 6px;
                min-width: min-content;
            }

            .secondary-nav-link {
                padding: 8px 16px;
                font-size: 14px;
                white-space: nowrap;
            }

            .page-header {
                margin: 20px auto 0;
                padding: 0 15px;
                padding-top: 10px;
                flex-direction: column;
            }

            .page-header h1 {
                font-size: 1.5rem;
            }

            .floating-message-btn {
                width: 50px;
                height: 50px;
                font-size: 20px;
                bottom: 20px;
                right: 20px;
            }

            .container, .content-container {
                padding: 10px;
            }
        }

        @media (max-width: 480px) {
            .nav-brand {
                font-size: 16px;
            }

            .user-name-inline {
                display: none;
            }

            .nav-link {
                font-size: 0;
                padding: 6px;
            }

            .nav-link::before {
                font-family: 'Font Awesome 6 Free';
                font-weight: 900;
                font-size: 16px;
            }

            .nav-link[href*="profile"]::before {
                content: '\f007';
            }

            #logoutBtn::before {
                content: '\f2f5';
            }

            .user-info-inline {
                max-width: 50px;
                padding: 6px;
            }
        }

'@

# New navbar HTML
$newNavbar = @'
    <nav class="navbar">
        <div class="nav-container">
            <a href="/html/admin/admin-dashboard.html" class="nav-brand">MC Tutor Admin</a>
            <div class="nav-right">
                <div class="user-info-inline">
                    <div class="user-avatar-small" data-user-avatar>
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <div class="user-details-inline">
                        <span class="user-name-inline" data-user-name>Admin</span>
                        <span class="user-role-badge-inline" data-user-role>ADMIN</span>
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
'@

# Navigation toggle script
$navScript = @'

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
'@

foreach ($file in $adminFiles) {
    $filePath = Join-Path $basePath $file
    
    if (Test-Path $filePath) {
        Write-Host "📝 Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        
        # 1. Add Montserrat font if not present
        if ($content -notmatch "Montserrat") {
            $content = $content -replace '(<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">)', "`$1`n    $montserratLink"
            Write-Host "  ✓ Added Montserrat font" -ForegroundColor Green
        }
        
        # 2. Add base CSS after <style> tag if not present
        if ($content -notmatch "\* \{[\s\S]*?font-family: 'Montserrat'") {
            $content = $content -replace '(<style>)', "`$1`n$baseCss"
            Write-Host "  ✓ Added base CSS" -ForegroundColor Green
        }
        
        # 3. Add navigation CSS after logout button styling
        if ($content -notmatch "\.nav-container") {
            $content = $content -replace '(#logoutBtn:hover \{[^\}]+\})', "`$1`n$navCss"
            Write-Host "  ✓ Added navigation CSS" -ForegroundColor Green
        }
        
        # 4. Replace old navbar with new one
        $oldNavPattern = '(?s)<nav class="navbar">.*?</nav>'
        if ($content -match $oldNavPattern) {
            $content = $content -replace $oldNavPattern, $newNavbar
            Write-Host "  ✓ Replaced navbar structure" -ForegroundColor Green
        }
        
        # 5. Add floating button if not present
        if ($content -notmatch "floating-message-btn") {
            # Find where to insert (after navbar)
            $content = $content -replace '(</nav>)([^<]*<div class="(page-header|filters|content-container))', "`$1`n`n    <!-- Floating Message Button -->`n    <a href=`"/html/shared/messenger.html`" class=`"floating-message-btn`" title=`"Messages`">`n        <i class=`"fas fa-comments`"></i>`n    </a>`n`$2"
            Write-Host "  ✓ Added floating message button" -ForegroundColor Green
        }
        
        # 6. Add navigation toggle script before </body>
        if ($content -notmatch "navToggleBtn") {
            $content = $content -replace '(</body>)', "$navScript`n    `$1"
            Write-Host "  ✓ Added navigation toggle script" -ForegroundColor Green
        }
        
        # Save
        $content | Set-Content $filePath -NoNewline
        Write-Host "✅ Successfully updated: $file" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "🎉 All admin files updated successfully!" -ForegroundColor Cyan
Write-Host "Next: Update messenger.html with role-based navigation" -ForegroundColor Yellow
