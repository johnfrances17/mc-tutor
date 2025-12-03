# 🎓 MC Tutor - Peer Tutoring Platform

**Version 2.0.0** - Complete Node.js + TypeScript Migration

A modern, secure web platform connecting students with peer tutors for academic support.

---

## 📖 Overview

MC Tutor is a secure, cloud-based peer tutoring platform that connects students with tutors for collaborative learning. Built with modern web technologies, it features real-time messaging, session management, file sharing, and comprehensive security measures.

### ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based with bcrypt password hashing
- 💬 **Real-Time Chat** - Socket.IO powered messaging with AES-256-GCM encryption
- 📚 **Study Materials** - Upload and share educational resources
- 📅 **Session Management** - Book, confirm, and track tutoring sessions
- ⭐ **Feedback System** - Rate and review tutor experiences
- 🔔 **Notifications** - Real-time alerts for important events
- 🛡️ **Rate Limiting** - Protection against abuse and DDoS
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js v18+ with TypeScript
- Express.js framework
- Socket.IO for real-time communication
- Supabase (PostgreSQL) for database
- JWT for authentication
- Bcrypt for password hashing
- AES-256-GCM for message encryption

**Frontend:**
- HTML5, CSS3, JavaScript
- PHP for templating
- Socket.IO client
- Responsive CSS Grid/Flexbox

**Security:**
- Helmet.js for security headers
- Express Rate Limit
- CORS protection
- Input validation & sanitization
- XSS prevention
- SQL injection protection

## 📁 Project Structure

```
mc-tutor/
├── client/                      # Frontend application
│   └── public/
│       ├── index.php           # Login page
│       ├── register.php        # User registration
│       ├── messenger.html      # Real-time chat interface
│       └── assets/
│           ├── css/            # Stylesheets
│           ├── js/             # Client scripts
│           └── includes/       # PHP components
│
├── server/                      # Backend API
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   └── database.ts     # Supabase client
│   │   ├── controllers/        # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── sessionController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── materialController.ts
│   │   │   ├── feedbackController.ts
│   │   │   ├── tutorController.ts
│   │   │   └── notificationController.ts
│   │   ├── middleware/         # Express middleware
│   │   │   ├── authMiddleware.ts    # JWT verification
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   ├── rateLimiter.ts       # Rate limiting
│   │   │   └── notFoundHandler.ts   # 404 handler
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   │   ├── AuthService.ts
│   │   │   ├── ChatService.ts       # File-based chat
│   │   │   ├── MaterialsService.ts
│   │   │   ├── NotificationService.ts
│   │   │   ├── EncryptionService.ts # AES-256-GCM
│   │   │   └── StorageService.ts    # Supabase storage
│   │   ├── sockets/            # WebSocket handlers
│   │   │   └── chatSocket.ts
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   │   ├── validation.ts   # Input validation
│   │   │   ├── jwt.ts          # Token utilities
│   │   │   └── fileSystem.ts   # File operations
│   │   └── server.ts           # Main entry point
│   │
│   ├── data/                   # File-based storage
│   │   ├── chats/              # Encrypted messages
│   │   ├── materials/          # Materials metadata
│   │   ├── notifications/      # User notifications
│   │   └── sessions/           # Session preferences
│   │
│   ├── scripts/
│   │   └── generate-key.js     # Encryption key generator
│   │
│   └── package.json
│
├── BEGINNER_GUIDE.md           # Step-by-step setup guide
├── SECURITY.md                 # Security documentation
├── README.md                   # This file
└── .gitignore
```

## 🚀 Quick Start

**📖 Complete guide:** [Getting Started](docs/01-GETTING-STARTED.md)

### Prerequisites
- Node.js 18+
- Supabase account (free)
- Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/mc-tutor.git
cd mc-tutor

# 2. Setup backend
cd server
npm install
cp .env.example .env  # Add your credentials

# 3. Start server
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

---

## 📂 Project Structure

```
mc-tutor/
├── client/              # Frontend (HTML/CSS/JS)
│   └── public/         # Web pages
├── server/             # Backend (Node.js + TypeScript)
│   └── src/
│       ├── controllers/  # Business logic
│       ├── routes/      # API endpoints
│       └── middleware/  # Auth, validation
├── docs/               # Documentation
├── _archive_php/       # Old PHP code (archived)
└── _archive_docs/      # Old documentation (archived)
```

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design
- Real-time chat (Socket.IO client)

**Backend:**
- Node.js 18 + TypeScript 5.3.3
- Express.js 4.18.2
- Socket.IO 4.6.0 (WebSocket)
- Bcrypt (password hashing)
- JWT (authentication)

**Database:**
- PostgreSQL (Supabase)
- Row Level Security (RLS)

**Security:**
- Helmet.js (security headers)
- Express-rate-limit (DDoS protection)
- AES-256-GCM (message encryption)

**Deployment:**
- Vercel (serverless functions)
- Supabase (database + storage)

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/01-GETTING-STARTED.md) | Local setup (20 min) |
| [API Reference](docs/03-API-REFERENCE.md) | Complete API docs |
| [Security Guide](docs/04-SECURITY.md) | Security features |
| [Troubleshooting](docs/05-TROUBLESHOOTING.md) | Fix common issues |
| [Architecture](docs/06-ARCHITECTURE.md) | System design |
| [Deployment](docs/DEPLOYMENT.md) | Deploy to production |

**📖 Full Documentation:** [docs/README.md](docs/README.md)

## 🔌 API Endpoints

**Complete documentation:** [docs/03-API-REFERENCE.md](docs/03-API-REFERENCE.md)

### Authentication: `/api/auth`
- POST `/register` - Create account
- POST `/login` - Login
- POST `/refresh` - Refresh token
- GET `/me` - Current user

### Admin: `/api/admin` (Admin only)
- GET `/users` - List all users (with filters)
- POST `/users` - Create user
- PUT `/users/:id` - Update user
- DELETE `/users/:id` - Delete user
- POST `/subjects` - Create subject
- GET `/stats` - System statistics

### Sessions: `/api/sessions`
- GET `/` - Get sessions (filtered by role)
- POST `/` - Create session (tutee)
- PUT `/:id/confirm` - Confirm session (tutor)
- PUT `/:id/complete` - Complete session

### More Endpoints:
- **Users:** `/api/users`
- **Tutors:** `/api/tutors`
- **Materials:** `/api/materials`
- **Feedback:** `/api/feedback`
- **Chat:** `/api/chat`
- **Notifications:** `/api/notifications`

## 🛡️ Security Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ HTTP-only cookies
- ✅ Role-based access control (RBAC)
- ✅ Bcrypt password hashing (10 rounds)

### Data Protection
- ✅ AES-256-GCM message encryption
- ✅ Input validation & sanitization
- ✅ XSS prevention
- ✅ SQL injection protection (Supabase)

### Rate Limiting
- ✅ General API: 100 req / 15 min
- ✅ Auth endpoints: 5 req / 15 min
- ✅ File uploads: 10 uploads / hour
- ✅ Chat messages: 30 msg / min

### HTTP Security
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ HTTPS/TLS support
- ✅ Secure cookies (httpOnly, sameSite)

## 🧪 Testing

**Test locally:**
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/health"

# Mac/Linux
curl http://localhost:3000/api/health
```

**Test authentication:**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","studentId":"2021-12345","fullName":"Test User","role":"tutee"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"tutee"}'
```

---

## 🚀 Deployment

**Deploy to Vercel in 5 minutes:**

1. Setup Supabase database
2. Push code to GitHub
3. Connect to Vercel
4. Add environment variables
5. Deploy!

**📖 Full deployment guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📝 Environment Variables

Create `server/.env`:

```env
# Database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-base64-key-here

# Server
PORT=3000
NODE_ENV=development
```

**🔑 Generate keys:**
```bash
# JWT Secret
openssl rand -base64 32

# Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🆘 Troubleshooting

**Common Issues:**

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check SUPABASE_URL and key in .env |
| "Port 3000 already in use" | Kill process or use different port |
| "Token expired" | Login again |
| "Cannot find module" | Run `npm install` in server/ |

**📖 Full troubleshooting:** [docs/05-TROUBLESHOOTING.md](docs/05-TROUBLESHOOTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

This project is for educational purposes.

---

## 📞 Support

- **Documentation:** [docs/README.md](docs/README.md)
- **Troubleshooting:** [docs/05-TROUBLESHOOTING.md](docs/05-TROUBLESHOOTING.md)
- **Issues:** Create a GitHub issue

---

## 📊 Version History

**v2.0.0** (December 2025)
- ✅ Complete migration to Node.js + TypeScript
- ✅ Modern REST API with 10 controllers
- ✅ Real-time chat with Socket.IO
- ✅ Enhanced security (Helmet, rate limiting)
- ✅ Admin panel with full CRUD
- ✅ Vercel deployment ready
- ✅ Comprehensive documentation

**v1.0.0** (Initial)
- PHP-based application

---

**Made with ❤️ for peer learning**

*Last Updated: December 2025*
