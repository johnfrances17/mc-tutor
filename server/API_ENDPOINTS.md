# MC Tutor API - Complete Endpoint Summary

**Base URL**: `http://localhost:3000`  
**Server Status**: ✅ Running on port 3000  
**Environment**: Development

---

## 🔐 Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login with credentials |
| GET | `/api/auth/me` | Yes | Get current user info |
| POST | `/api/auth/refresh` | No | Refresh JWT token |
| POST | `/api/auth/logout` | Yes | Logout current user |

---

## 👤 User Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/users/profile` | Yes | All | Get current user profile |
| PUT | `/api/users/profile` | Yes | All | Update profile info |
| POST | `/api/users/profile/picture` | Yes | All | Upload profile picture |
| GET | `/api/users/:studentId` | No | - | Get user by student ID |
| PUT | `/api/users/password` | Yes | All | Change password |

---

## 📅 Session Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/sessions` | Yes | All | Get all user's sessions |
| POST | `/api/sessions` | Yes | Tutee | Book new session |
| GET | `/api/sessions/options/:tutorStudentId/:subjectCode` | Yes | All | Get booking options |
| PUT | `/api/sessions/:id/confirm` | Yes | Tutor | Confirm session |
| PUT | `/api/sessions/:id/cancel` | Yes | All | Cancel session |
| PUT | `/api/sessions/:id/complete` | Yes | Tutor | Mark as completed |
| POST | `/api/sessions/preferences` | Yes | Tutor | Save session preferences |

---

## 📚 Subject Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/subjects` | No | Get all subjects (filter by ?course=) |
| GET | `/api/subjects/courses` | No | Get list of available courses |
| GET | `/api/subjects/course/:course` | No | Get subjects by course |
| GET | `/api/subjects/:id` | No | Get subject by ID |

---

## 🎓 Tutor Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/tutors/search` | No | - | Search tutors (filter by subject_id, course, search) |
| GET | `/api/tutors/:id` | No | - | Get tutor details with subjects |
| GET | `/api/tutors/:id/subjects` | No | - | Get tutor's subjects |
| POST | `/api/tutors/subjects` | Yes | Tutor | Add subject to tutor |
| DELETE | `/api/tutors/subjects/:subjectId` | Yes | Tutor | Remove subject from tutor |

---

## 📄 Materials Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/materials` | Yes | All | Get materials (filter by subject_id, tutor_student_id, search) |
| POST | `/api/materials/upload` | Yes | Tutor | Upload study material |
| GET | `/api/materials/:id/download` | Yes | All | Download material |
| DELETE | `/api/materials/:id` | Yes | Tutor | Delete own material |

---

## ⭐ Feedback Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/api/feedback` | Yes | Tutee | Submit session feedback |
| GET | `/api/feedback/my` | Yes | Tutee | Get my submitted feedback |
| GET | `/api/feedback/received` | Yes | Tutor | Get received feedback |
| GET | `/api/feedback/tutor/:tutorId` | No | - | Get tutor's public feedback |

---

## 🔔 Notification Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/notifications` | Yes | Get all notifications (?unread_only=true) |
| GET | `/api/notifications/unread/count` | Yes | Get unread count |
| PUT | `/api/notifications/:id/read` | Yes | Mark as read |
| PUT | `/api/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/api/notifications/:id` | Yes | Delete notification |
| DELETE | `/api/notifications` | Yes | Delete all notifications |

---

## 💬 Chat Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/chat/conversations` | Yes | Get all conversations |
| GET | `/api/chat/messages/:otherStudentId` | Yes | Get conversation messages |
| POST | `/api/chat/send` | Yes | Send message |
| PUT | `/api/chat/mark-read/:otherStudentId` | Yes | Mark messages as read |
| GET | `/api/chat/unread/:otherStudentId` | Yes | Get unread count |

---

## 🔌 WebSocket Events (Socket.IO)

**Connection**: `io('http://localhost:3000')`

### Events (Planned Implementation)
- `join-conversation` - Join chat room
- `send-message` - Send real-time message
- `message-received` - Receive message
- `typing` - Typing indicator
- `mark-read` - Read receipt

---

## 📊 Complete Feature Matrix

### ✅ Implemented (Tasks 1-4)
- [x] Node.js/Express backend with TypeScript
- [x] Supabase PostgreSQL database integration
- [x] JWT authentication (access + refresh tokens)
- [x] User registration/login/profile management
- [x] Session booking system
- [x] Subject management
- [x] Tutor search and profiles
- [x] Study materials upload/download
- [x] Feedback and rating system
- [x] Notification system
- [x] Encrypted chat messaging (file-based)
- [x] File-based storage (chats, notifications, session preferences)
- [x] Role-based access control (admin/tutor/tutee)
- [x] Input validation and sanitization
- [x] Error handling middleware
- [x] CORS configuration
- [x] Cookie support for JWT

### ⏳ Pending (Tasks 5-10)
- [ ] Frontend HTML/CSS/Vanilla JS pages
- [ ] Socket.IO real-time chat implementation
- [ ] Supabase Storage migration (profile pictures, materials)
- [ ] Admin dashboard endpoints
- [ ] Navigation and routing system
- [ ] Deployment to Vercel/Railway
- [ ] Production testing

---

## 🔑 Authentication Example

### Register
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "student_id": "2024001",
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "phone": "09123456789",
  "role": "tutee",
  "course": "BSIT",
  "year_level": 3
}
```

### Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "student_id": "2024001",
  "password": "password123"
}

# Response includes:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": { ... }
}
```

### Authenticated Request
```bash
GET http://localhost:3000/api/users/profile
Authorization: Bearer eyJhbGc...
```

---

## 📁 File Storage Structure

```
server/
  data/
    chats/
      2024001-2024002/
        messages.json
      metadata.json
    notifications/
      2024001.json
      2024002.json
    sessions/
      2024001/
        CS101.json
        MATH101.json
    materials/
      2024001/
        5/
          metadata.json
          1734567890_abc123_lecture1.pdf
  uploads/
    profiles/
      2024001_1734567890.jpg
    temp/
```

---

## 🔒 Security Features

- **JWT Authentication**: 7-day access tokens, 30-day refresh tokens
- **Password Hashing**: bcrypt with 10 salt rounds
- **Chat Encryption**: AES-256-GCM for message storage
- **Input Validation**: Email, phone, student ID, password validation
- **Input Sanitization**: XSS protection on text inputs
- **Role-Based Access Control**: Middleware for admin/tutor/tutee routes
- **CORS Protection**: Configured allowed origins
- **Cookie Security**: httpOnly cookies for token storage

---

## 🌐 Database Schema (Supabase)

### Tables
1. **users** - User accounts (student_id, email, role, etc.)
2. **subjects** - Course subjects (subject_code, name, course)
3. **tutor_subjects** - Tutor-subject relationships
4. **tutoring_sessions** - Session bookings
5. **feedback** - Session ratings and comments
6. **admins** - Admin users
7. **session_types** - Session type definitions
8. **notification_types** - Notification categories
9. **audit_logs** - System audit trail

### Key Relationships
- Users → Tutor_Subjects (tutors teach multiple subjects)
- Sessions → Users (tutee + tutor)
- Sessions → Subjects
- Feedback → Sessions → Tutors
- Notifications stored in JSON files (not in DB)
- Chat messages stored in JSON files with encryption

---

## 📈 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode)"
}
```

---

## 🚀 Server Status

```
✅ Server Running: http://localhost:3000
✅ Database Connected: Supabase PostgreSQL
✅ Socket.IO Enabled: Real-time ready
✅ File Storage: ./data and ../uploads
✅ Authentication: JWT with bcrypt
✅ Encryption: AES-256-GCM
✅ Total Endpoints: 45+
```

---

## 🛠️ Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production
npm start

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📝 Migration Status

### ✅ Completed Migrations
- PHP sessions → JWT tokens
- password_hash() → bcryptjs
- mysqli → Supabase client
- $_SESSION → req.user
- PHP ChatManager → TypeScript ChatService
- PHP MaterialsManager → TypeScript MaterialsService
- PHP NotificationManager → TypeScript NotificationService
- PHP SessionPreferencesManager → TypeScript SessionPreferencesService
- PHP ChatEncryption → TypeScript EncryptionService

### 🔄 In Progress
- Frontend pages (PHP → HTML/JS)
- Real-time chat (PHP → Socket.IO)
- File uploads (Local → Supabase Storage)

---

Generated: 2024-12-18  
Server Version: 1.0.0  
Documentation: Complete
