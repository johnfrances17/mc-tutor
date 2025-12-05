/**
 * Floating Chat Button Component
 * Displays a floating chat button with unread message count
 */

class FloatingChatButton {
  constructor() {
    this.user = window.auth?.getCurrentUser();
    this.unreadCount = 0;
    this.button = null;
    this.socket = null;
    
    if (this.user) {
      this.init();
    }
  }
  
  init() {
    this.createButton();
    this.attachListeners();
    this.initSocket();
    this.fetchUnreadCount();
  }
  
  createButton() {
    // Remove existing button if present
    const existing = document.getElementById('floatingChatBtn');
    if (existing) {
      existing.remove();
    }
    
    this.button = document.createElement('div');
    this.button.id = 'floatingChatBtn';
    this.button.className = 'floating-chat-button';
    this.button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <span class="unread-badge" style="display: none;">0</span>
    `;
    
    document.body.appendChild(this.button);
  }
  
  attachListeners() {
    this.button.addEventListener('click', () => {
      this.openMessenger();
    });
  }
  
  initSocket() {
    try {
      this.socket = window.socketClient?.initSocket();
      
      if (this.socket) {
        // Listen for new messages
        window.socketClient.onNewMessage((data) => {
          // Only increment if not on messenger page
          if (!window.location.pathname.includes('messenger.html')) {
            this.incrementUnreadCount();
          }
        });
        
        // Listen for messages read
        window.socketClient.onMessagesRead(() => {
          this.fetchUnreadCount();
        });
      }
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }
  
  async fetchUnreadCount() {
    try {
      const response = await window.API?.chat?.getConversations();
      
      if (response && response.success) {
        let total = 0;
        response.data.forEach(conversation => {
          total += conversation.unread_count || 0;
        });
        this.updateUnreadCount(total);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }
  
  updateUnreadCount(count) {
    this.unreadCount = count;
    const badge = this.button.querySelector('.unread-badge');
    
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
      this.button.classList.add('has-unread');
    } else {
      badge.style.display = 'none';
      this.button.classList.remove('has-unread');
    }
  }
  
  incrementUnreadCount() {
    this.updateUnreadCount(this.unreadCount + 1);
  }
  
  openMessenger() {
    window.location.href = '/public/html/messenger.html';
  }
  
  destroy() {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
  }
}

// Auto-initialize on page load (only if not on messenger page)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('messenger.html')) {
      new FloatingChatButton();
    }
  });
} else {
  if (!window.location.pathname.includes('messenger.html')) {
    new FloatingChatButton();
  }
}

// Export for manual initialization
if (typeof window !== 'undefined') {
  window.FloatingChatButton = FloatingChatButton;
}
