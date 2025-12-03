/**
 * Floating Chat Button Component
 * Renders a floating action button for quick messenger access
 */

/**
 * Render floating chat button
 * @param {number} unreadCount - Number of unread messages
 * @returns {string} HTML string for floating chat button
 */
export function renderFloatingChat(unreadCount = 0) {
  const badgeHTML = unreadCount > 0 
    ? `<span class="chat-badge">${unreadCount > 99 ? '99+' : unreadCount}</span>` 
    : '';

  return `
    <button class="floating-chat-btn" id="floatingChatBtn" title="Open Messenger">
      <i class="fas fa-comments"></i>
      ${badgeHTML}
    </button>
  `;
}

/**
 * Initialize floating chat button
 * Adds button to page and attaches click handler
 */
export async function initFloatingChat() {
  const user = window.auth?.getCurrentUser();
  
  if (!user) return;

  // Don't show on messenger page itself
  const currentPage = window.location.pathname;
  if (currentPage.includes('messenger.html')) return;

  // Fetch unread count
  let unreadCount = 0;
  try {
    if (window.API?.notifications?.getUnreadCount) {
      const response = await window.API.notifications.getUnreadCount();
      if (response.success) {
        unreadCount = response.data.count || 0;
      }
    }
  } catch (error) {
    console.error('Error fetching unread messages:', error);
  }

  // Check if button already exists
  let existingBtn = document.getElementById('floatingChatBtn');
  
  if (!existingBtn) {
    // Add to body
    document.body.insertAdjacentHTML('beforeend', renderFloatingChat(unreadCount));
    
    // Attach click handler
    const btn = document.getElementById('floatingChatBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        window.location.href = 'messenger.html';
      });
    }
  } else {
    // Update badge count
    const badge = existingBtn.querySelector('.chat-badge');
    if (unreadCount > 0) {
      if (badge) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      } else {
        existingBtn.insertAdjacentHTML('beforeend', 
          `<span class="chat-badge">${unreadCount > 99 ? '99+' : unreadCount}</span>`
        );
      }
    } else if (badge) {
      badge.remove();
    }
  }
}

/**
 * Update unread count on floating button
 * @param {number} count - New unread count
 */
export function updateFloatingChatBadge(count) {
  const btn = document.getElementById('floatingChatBtn');
  if (!btn) return;

  let badge = btn.querySelector('.chat-badge');
  
  if (count > 0) {
    const displayCount = count > 99 ? '99+' : count;
    if (badge) {
      badge.textContent = displayCount;
    } else {
      btn.insertAdjacentHTML('beforeend', `<span class="chat-badge">${displayCount}</span>`);
    }
  } else if (badge) {
    badge.remove();
  }
}

// Auto-export to window
if (typeof window !== 'undefined') {
  window.floatingChatComponent = {
    renderFloatingChat,
    initFloatingChat,
    updateFloatingChatBadge
  };
}
