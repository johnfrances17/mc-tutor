# 🎓 MC Tutor - Cloud-Based Peer Tutoring Platform

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/mc-tutor)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

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

### Prerequisites

- Node.js v18 or higher
- XAMPP (Apache server)
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/mc-tutor.git
cd mc-tutor
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Generate security keys**
```bash
npm run generate-key
```
Copy the generated keys to your `.env` file.

4. **Configure environment**

Create `server/.env`:
```env
# Server
PORT=3000
NODE_ENV=development

# Supabase (from your Supabase dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Security (use generated keys!)
JWT_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-base64-encryption-key
JWT_EXPIRES_IN=7d

# Storage
UPLOAD_DIR=./data

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost,http://localhost:3000
```

5. **Setup database**

In Supabase SQL Editor, run:
- `schema.sql` - Creates tables
- `seed.sql` - Adds sample data (optional)

6. **Create storage buckets**

In Supabase Storage:
- Create `profile-pictures` bucket (public)
- Create `study-materials` bucket (private)

7. **Start the server**
```bash
npm run dev
```

8. **Start Apache**
- Open XAMPP Control Panel
- Click "Start" for Apache
- Visit `http://localhost/mc-tutor/`

## 📚 Documentation

- **[Beginner's Guide](BEGINNER_GUIDE.md)** - Complete setup walkthrough
- **[Security Guide](SECURITY.md)** - Security features and best practices
- **[API Documentation](#api-endpoints)** - API reference below

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login user
POST   /api/auth/refresh       Refresh token
GET    /api/auth/me            Get current user
POST   /api/auth/logout        Logout user
```

### Users
```
GET    /api/users/profile           Get user profile
PUT    /api/users/profile           Update profile
POST   /api/users/profile/picture   Upload profile picture
PUT    /api/users/password          Change password
GET    /api/users/:studentId        Get user by student ID
```

### Sessions
```
GET    /api/sessions                Get sessions (filtered by role)
POST   /api/sessions                Create session (tutee)
PUT    /api/sessions/:id/confirm    Confirm session (tutor)
PUT    /api/sessions/:id/complete   Complete session (tutor)
DELETE /api/sessions/:id/cancel     Cancel session
GET    /api/sessions/options        Get session options
POST   /api/sessions/preferences    Save preferences (tutor)
```

### Tutors
```
GET    /api/tutors/search           Search tutors
GET    /api/tutors/:id              Get tutor details
GET    /api/tutors/:id/subjects     Get tutor subjects
POST   /api/tutors/subjects         Add subject (tutor)
DELETE /api/tutors/subjects/:id     Remove subject (tutor)
```

### Materials
```
GET    /api/materials               Browse materials
POST   /api/materials/upload        Upload material (tutor)
DELETE /api/materials/:id           Delete material (tutor)
GET    /api/materials/:id/download  Download material
```

### Chat
```
GET    /api/chat/conversations      Get all conversations
GET    /api/chat/messages/:userId   Get messages with user
POST   /api/chat/send               Send message
PUT    /api/chat/read/:userId       Mark messages as read
GET    /api/chat/unread/:userId     Get unread count
```

### Feedback
```
POST   /api/feedback                Submit feedback (tutee)
GET    /api/feedback/my             My submitted feedback
GET    /api/feedback/received       Received feedback (tutor)
GET    /api/feedback/tutor/:id      Get tutor's feedback
```

### Notifications
```
GET    /api/notifications           Get user notifications
PUT    /api/notifications/:id/read  Mark as read
DELETE /api/notifications/:id       Delete notification
```

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

Run the test suite:
```bash
npm test
```

Test specific features:
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Health check
curl http://localhost:3000/health
```

## 📊 Performance Optimization

### Backend Optimizations
- File-based caching for conversations
- Pagination for large datasets (max 100 items)
- Connection pooling via Supabase
- Efficient query filtering
- Lazy loading of resources

### Frontend Optimizations
- Minified CSS/JS in production
- Image optimization
- Lazy loading for messages
- Debounced search inputs
- Cached API responses

## 🔧 Development

### Build for production
```bash
npm run build
npm start
```

### Run in development mode
```bash
npm run dev
```

### Lint code
```bash
npm run lint
```

### Format code
```bash
npm run format
```

## 🌐 Deployment

### Prerequisites
- Node.js hosting (Heroku, DigitalOcean, AWS, etc.)
- Domain with SSL certificate
- Supabase project

### Steps
1. Set `NODE_ENV=production` in `.env`
2. Update `ALLOWED_ORIGINS` with production URLs
3. Generate new security keys for production
4. Build the application: `npm run build`
5. Start with PM2: `pm2 start dist/server.js`
6. Configure reverse proxy (Nginx)
7. Enable HTTPS
8. Setup monitoring and logging

## 📝 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3000` |
| `NODE_ENV` | Yes | Environment | `development` / `production` |
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Yes | Supabase anon key | `eyJhbGc...` |
| `JWT_SECRET` | Yes | JWT signing secret | `min-32-chars-random` |
| `ENCRYPTION_KEY` | Yes | AES-256 encryption key | `base64-encoded-32-bytes` |
| `JWT_EXPIRES_IN` | No | Token expiration | `7d` |
| `UPLOAD_DIR` | No | File storage path | `./data` |
| `ALLOWED_ORIGINS` | No | CORS origins | `http://localhost,https://app.com` |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **MC Tutor Team** - Initial development

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Socket.IO for real-time features
- TypeScript community
- Open source contributors

## 📞 Support

- **Documentation**: [BEGINNER_GUIDE.md](BEGINNER_GUIDE.md)
- **Security**: [SECURITY.md](SECURITY.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/mc-tutor/issues)
- **Email**: support@mc-tutor.com

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Video call integration
- [ ] AI-powered tutor matching
- [ ] Payment integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Offline mode support

---

**Made with ❤️ by the MC Tutor Team**

*Last Updated: December 2025*
*Version: 2.0.0*
