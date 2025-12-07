// ADMIN NAVIGATION TEMPLATE - Copy this style block to all admin HTML files
// Replace existing <style> section with this

const ADMIN_NAVIGATION_STYLES = `
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

        /* Menu button inside navbar - matching Profile style */
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
        
        .page-header p {
            color: #6b7280;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
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

            .container {
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
                content: '\\f007';
            }

            #logoutBtn::before {
                content: '\\f2f5';
            }

            .user-info-inline {
                max-width: 50px;
                padding: 6px;
            }
        }
    </style>
`;

// ADMIN NAVIGATION HTML - Replace navbar section with this
const ADMIN_NAVIGATION_HTML = `
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
`;

// NAVIGATION TOGGLE SCRIPT - Add before </body> closing tag
const ADMIN_NAVIGATION_SCRIPT = `
        // Secondary Navigation Toggle
        const navToggleBtn = document.getElementById('navToggleBtn');
        const secondaryNav = document.getElementById('secondaryNav');
        
        if (navToggleBtn && secondaryNav) {
            // Load saved state from localStorage
            const isNavCollapsed = localStorage.getItem('secondaryNavCollapsed') === 'true';
            if (isNavCollapsed) {
                secondaryNav.classList.add('collapsed');
                navToggleBtn.classList.add('collapsed');
            }

            navToggleBtn.addEventListener('click', () => {
                secondaryNav.classList.toggle('collapsed');
                navToggleBtn.classList.toggle('collapsed');
                
                // Save state to localStorage
                const isCollapsed = secondaryNav.classList.contains('collapsed');
                localStorage.setItem('secondaryNavCollapsed', isCollapsed);
            });
        }

        // Highlight active page in secondary nav
        const currentPath = window.location.pathname;
        document.querySelectorAll('.secondary-nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath || currentPath.includes(link.getAttribute('href').split('/').pop())) {
                link.classList.add('active');
            }
        });
`;
