# 📚 MC TUTOR - Documentation Index

Welcome to the MC Tutor documentation! This guide will help you understand, deploy, and maintain the platform.

---

## 📖 TABLE OF CONTENTS

### For Beginners:
1. **[Getting Started](01-GETTING-STARTED.md)** - Setup your development environment
2. **[Deployment Guide](DEPLOYMENT.md)** - Deploy to Vercel + Supabase (20 minutes)
3. **[Troubleshooting](05-TROUBLESHOOTING.md)** - Common errors and solutions

### For Developers:
4. **[API Reference](03-API-REFERENCE.md)** - Complete API endpoint documentation
5. **[Architecture](06-ARCHITECTURE.md)** - System design and structure
6. **[Security](04-SECURITY.md)** - Security features and best practices

---

## 🎯 QUICK START

**Want to get started quickly?** Follow these 3 steps:

### Step 1: Clone & Install (5 minutes)
```bash
# Clone repository
git clone https://github.com/johnfrances17/mc-tutor.git
cd mc-tutor

# Install backend dependencies
cd server
npm install

# Start development server
npm run dev
```

### Step 2: Setup Database (10 minutes)
- Create Supabase account
- Import `supabase_migration_safe.sql`
- Add credentials to `.env`

👉 **[Full Database Setup Guide](01-GETTING-STARTED.md#database-setup)**

### Step 3: Deploy (5 minutes)
- Push code to GitHub
- Connect to Vercel
- Add environment variables

👉 **[Full Deployment Guide](DEPLOYMENT.md)**

---

## 🏗️ PROJECT STRUCTURE

```
mc-tutor/
├── client/                 # Frontend (HTML/CSS/JS)
│   └── public/
│       ├── *.html         # Page templates
│       ├── css/           # Stylesheets
│       └── js/            # JavaScript modules
│
├── server/                # Backend (Node.js + TypeScript)
│   └── src/
│       ├── controllers/   # Request handlers
│       ├── routes/        # API routes
│       ├── services/      # Business logic
│       ├── middleware/    # Auth, validation
│       └── server.ts      # Main app
│
├── docs/                  # Documentation (you are here!)
│   ├── DEPLOYMENT.md
│   ├── 01-GETTING-STARTED.md
│   ├── 03-API-REFERENCE.md
│   └── 04-SECURITY.md
│
└── supabase_migration_safe.sql  # Database schema
```

---

## 🎓 LEARNING PATH

### Complete Beginner?
Start here: **[Getting Started](01-GETTING-STARTED.md)**

### Ready to Deploy?
Jump to: **[Deployment Guide](DEPLOYMENT.md)**

### Need API Info?
Check: **[API Reference](03-API-REFERENCE.md)**

### Having Issues?
See: **[Troubleshooting](05-TROUBLESHOOTING.md)**

---

## 🌟 KEY FEATURES

### For Students:
- 📖 Browse subjects and find tutors
- 📅 Book tutoring sessions
- 💬 Chat with tutors
- ⭐ Give feedback
- 📚 Access study materials

### For Tutors:
- 📝 Manage subjects you teach
- 📅 Set availability preferences
- 📤 Upload study materials
- 💬 Chat with students
- 📊 View feedback ratings

### For Admins:
- 👥 Manage users (CRUD)
- 📖 Manage subjects (CRUD)
- 📊 View system statistics
- 📋 Monitor sessions
- 🔍 View activity logs

---

## 🔧 TECH STACK

### Frontend:
- **HTML5** - Modern semantic markup
- **CSS3** - Responsive design
- **JavaScript (ES6+)** - Modern features
- **Fetch API** - HTTP requests
- **Socket.IO Client** - Real-time chat

### Backend:
- **Node.js 18+** - JavaScript runtime
- **TypeScript 5.3** - Type safety
- **Express 4.18** - Web framework
- **Socket.IO 4.6** - WebSocket server
- **Helmet** - Security headers
- **Express Rate Limit** - API protection

### Database:
- **Supabase** - PostgreSQL cloud
- **Row Level Security** - Database-level auth

### Deployment:
- **Vercel** - Serverless hosting
- **GitHub** - Version control

---

## 📚 DOCUMENTATION FILES

### Essential Guides:
| File | Description | Time to Read |
|------|-------------|--------------|
| [01-GETTING-STARTED.md](01-GETTING-STARTED.md) | Setup dev environment | 10 min |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploy to production | 15 min |
| [03-API-REFERENCE.md](03-API-REFERENCE.md) | API endpoints | 20 min |
| [04-SECURITY.md](04-SECURITY.md) | Security features | 10 min |
| [05-TROUBLESHOOTING.md](05-TROUBLESHOOTING.md) | Fix common errors | 5 min |
| [06-ARCHITECTURE.md](06-ARCHITECTURE.md) | System design | 15 min |

### Legacy Files (Archive):
These files were from the migration process. You can safely ignore them:
- `MIGRATION_GUIDE.md`
- `MIGRATION_STATUS_REPORT.md`
- `MIGRATION_VERIFICATION_REPORT.md`
- `PROGRESS_UPDATE.md`

---

## 🚀 DEPLOYMENT STATUS

**Current Version:** 2.0.0 (Node.js Migration Complete)

**Migration Status:**
- ✅ Backend: Node.js + TypeScript
- ✅ Frontend: HTML + CSS + JS
- ✅ Database: Supabase PostgreSQL
- ✅ Chat: Socket.IO + File-based
- ✅ Materials: File-based storage
- ✅ Authentication: JWT
- ✅ Security: Helmet + Rate Limiting
- ✅ Admin Panel: Full CRUD

**PHP Migration:** ✅ Complete - All PHP files archived

---

## 🔐 SECURITY FEATURES

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Helmet.js** - HTTP security headers
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **Input Validation** - Sanitize all user input
- ✅ **AES-256-GCM Encryption** - Encrypted chat messages
- ✅ **Row Level Security** - Database-level permissions
- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **CORS Protection** - Whitelist allowed origins

👉 **[Full Security Documentation](04-SECURITY.md)**

---

## 🤝 CONTRIBUTING

Want to improve MC Tutor?

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 SUPPORT

### Getting Help:
- 📖 Read the docs (you're here!)
- 🔍 Check [Troubleshooting Guide](05-TROUBLESHOOTING.md)
- 🐛 Report bugs via GitHub Issues
- 💬 Ask questions in Discussions

### Common Questions:
- **"How do I deploy?"** → [Deployment Guide](DEPLOYMENT.md)
- **"API not working?"** → [Troubleshooting](05-TROUBLESHOOTING.md)
- **"How do I add features?"** → [API Reference](03-API-REFERENCE.md)
- **"Security concerns?"** → [Security Guide](04-SECURITY.md)

---

## 📜 LICENSE

This project is for educational purposes.

---

## 🎉 ACKNOWLEDGMENTS

Built with:
- Node.js & TypeScript
- Express.js
- Supabase
- Socket.IO
- Vercel

**Thank you for using MC Tutor!** 🚀

---

## 📅 VERSION HISTORY

### v2.0.0 (December 2025)
- ✅ Complete migration from PHP to Node.js
- ✅ Added TypeScript for type safety
- ✅ Migrated to Supabase PostgreSQL
- ✅ Implemented real-time chat (Socket.IO)
- ✅ Added comprehensive security (Helmet, Rate Limiting)
- ✅ Created admin panel with full CRUD
- ✅ Added beginner-friendly documentation

### v1.0.0 (Original)
- PHP + MySQL implementation
- File-based chat system
- Basic authentication

---

**Ready to get started?** → **[Begin with Getting Started Guide](01-GETTING-STARTED.md)** 🚀
