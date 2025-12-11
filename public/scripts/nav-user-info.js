/**
 * Update Navigation User Info with Profile Picture
 * This function updates user avatar, name, and role in the navbar
 * Can be called from any page after auth check
 */
window.updateNavUserInfo = function() {
    // ALWAYS read fresh from localStorage/cookies - never use cached window.currentUser
    let currentUser;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        } else {
            // Fallback to cookie
            const cookieUser = document.cookie.split('; ').find(row => row.startsWith('user='));
            if (cookieUser) {
                currentUser = JSON.parse(decodeURIComponent(cookieUser.split('=')[1]));
            }
        }
    } catch (error) {
        console.error('[Nav] Error reading user data:', error);
    }
    
    if (!currentUser || !currentUser.user_id) {
        console.warn('[Nav] No current user found');
        return;
    }

    console.log('[Nav] Updating with user:', currentUser.first_name, 'Has picture:', !!currentUser.profile_picture, 'URL:', currentUser.profile_picture);

    // Update user name with FIRST NAME ONLY
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
        el.textContent = currentUser.first_name || 'User';
    });

    // Update role
    const userRoleElements = document.querySelectorAll('[data-user-role]');
    userRoleElements.forEach(el => {
        const role = currentUser.role || 'user';
        el.textContent = role.toUpperCase();
    });

    // Update avatar in nav - use FIRST letter of FIRST name
    const firstName = currentUser.first_name || 'User';
    const initial = firstName.charAt(0).toUpperCase();
    
    // Update all navbar avatars with profile picture or initial
    const avatarElements = document.querySelectorAll('[data-user-avatar]');
    avatarElements.forEach(avatarEl => {
        if (currentUser.profile_picture) {
            // User has profile picture
            let pictureUrl = currentUser.profile_picture;
            
            // Handle Supabase Storage URLs
            if (pictureUrl.includes('supabase.co/storage')) {
                // Already full Supabase URL
                console.log('[Nav] Using Supabase Storage URL');
            } else if (pictureUrl.startsWith('/uploads/')) {
                // Old local path
                pictureUrl = `${window.location.protocol}//${window.location.host}${pictureUrl}`;
            } else if (pictureUrl.startsWith('http://') && window.location.protocol === 'https:') {
                // Convert HTTP to HTTPS
                pictureUrl = pictureUrl.replace('http://', 'https://');
            }
            
            // Set profile picture with fallback to initial
            avatarEl.innerHTML = `<img src="${pictureUrl}?t=${Date.now()}" alt="${firstName}" onerror="this.onerror=null; this.parentElement.innerHTML='<span>${initial}</span>';" style="width: 100%; height: 100%; object-fit: cover;">`;
            console.log('[Nav] Profile picture set for avatar');
        } else {
            // No profile picture, show initial
            avatarEl.innerHTML = `<span>${initial}</span>`;
            console.log('[Nav] Avatar initial set to:', initial);
        }
    });
    
    console.log('✅ Nav updated - Name:', firstName, 'Initial:', initial, 'Has picture:', !!currentUser.profile_picture);
};

// Auto-update when auth state changes
if (window.auth) {
    const originalCheckAuth = window.auth.checkAuth;
    window.auth.checkAuth = async function() {
        const result = await originalCheckAuth.call(window.auth);
        if (result) {
            window.updateNavUserInfo();
        }
        return result;
    };
}

console.log('✅ Navigation user info updater loaded');
