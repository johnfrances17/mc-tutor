# 🏗️ ARCHITECTURE GUIDE

Complete overview of MC Tutor system design, data flow, and technical architecture.

---

## 📊 SYSTEM OVERVIEW

MC Tutor is a **full-stack web application** with:
- **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
- **Backend:** Node.js + TypeScript + Express
- **Database:** PostgreSQL (Supabase)
- **Real-time:** Socket.IO for chat
- **Deployment:** Vercel

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │  HTTP   │   Backend   │  SQL    │  Database   │
│  (Frontend) │ ◄─────► │  (Node.js)  │ ◄─────► │ (Supabase)  │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │
       │    WebSocket          │
       └───────────────────────┘
           (Socket.IO)
```

---

## 🗂️ PROJECT STRUCTURE

```
mc-tutor/
│
├── client/                      # Frontend (runs in browser)
│   └── public/
│       ├── index.html          # Homepage
│       ├── login.html          # Login page
│       ├── register.html       # Registration page
│       │
│       ├── admin/              # Admin dashboard pages
│       │   ├── dashboard.html
│       │   └── manage-users.html
│       │
│       ├── tutor/              # Tutor pages
│       │   ├── dashboard.html
│       │   ├── my-sessions.html
│       │   └── upload-materials.html
│       │
│       ├── student/            # Student pages
│       │   ├── dashboard.html
│       │   ├── find-tutors.html
│       │   └── book-session.html
│       │
│       ├── css/                # Stylesheets
│       │   └── style.css
│       │
│       └── js/                 # Frontend JavaScript
│           ├── api.js          # API communication layer
│           ├── auth.js         # Authentication logic
│           ├── dashboard.js    # Dashboard functionality
│           └── chat.js         # Real-time chat
│
├── server/                      # Backend (runs on Node.js)
│   ├── src/
│   │   ├── server.ts           # Main entry point
│   │   │
│   │   ├── controllers/        # Business logic
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── adminController.ts
│   │   │   ├── sessionController.ts
│   │   │   ├── subjectController.ts
│   │   │   ├── tutorController.ts
│   │   │   ├── materialsController.ts
│   │   │   ├── feedbackController.ts
│   │   │   ├── chatController.ts
│   │   │   └── notificationController.ts
│   │   │
│   │   ├── routes/             # API endpoint definitions
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   └── ... (9 route files total)
│   │   │
│   │   ├── middleware/         # Request processing
│   │   │   ├── authMiddleware.ts      # JWT verification
│   │   │   ├── roleMiddleware.ts      # Role-based access
│   │   │   ├── rateLimitMiddleware.ts # Rate limiting
│   │   │   ├── uploadMiddleware.ts    # File uploads
│   │   │   └── errorMiddleware.ts     # Error handling
│   │   │
│   │   ├── config/             # Configuration
│   │   │   └── supabase.ts    # Database connection
│   │   │
│   │   └── utils/              # Helper functions
│   │       ├── validation.ts   # Input validation
│   │       ├── encryption.ts   # Message encryption
│   │       └── fileUtils.ts    # File handling
│   │
│   ├── package.json            # Dependencies
│   ├── tsconfig.json           # TypeScript config
│   └── .env                    # Environment variables (secrets)
│
├── docs/                        # Documentation
│   ├── README.md               # Documentation index
│   ├── 01-GETTING-STARTED.md
│   ├── 03-API-REFERENCE.md
│   ├── 04-SECURITY.md
│   ├── 05-TROUBLESHOOTING.md
│   ├── 06-ARCHITECTURE.md      # ← You are here
│   └── DEPLOYMENT.md
│
├── main/shared/                 # File-based storage
│   ├── chats/                  # Encrypted chat messages
│   │   └── metadata.json
│   ├── materials/              # Uploaded study materials
│   ├── notifications/          # User notifications
│   └── sessions/               # Session preferences
│
├── uploads/                     # Uploaded files
│   ├── profiles/               # Profile pictures
│   └── study_materials/        # Study materials
│
├── vercel.json                 # Vercel deployment config
├── supabase_migration_safe.sql # Database schema
└── README.md                   # Project README
```

---

## 🔄 REQUEST FLOW

### Example: Student books a tutoring session

```
1. USER ACTION
   └─► Student clicks "Book Session" button in browser

2. FRONTEND (JavaScript)
   └─► Collects form data (tutor, subject, date, time)
   └─► Sends HTTP POST to API: /api/sessions
       Headers: Authorization: Bearer <JWT_TOKEN>
       Body: { tutor_id, subject_id, session_date, ... }

3. MIDDLEWARE LAYER
   ├─► Rate Limiter: Check if under 100 requests/15min ✓
   ├─► Auth Middleware: Verify JWT token ✓
   └─► Role Middleware: Check if user is 'tutee' ✓

4. CONTROLLER (Business Logic)
   ├─► Validate input data
   ├─► Check tutor availability
   ├─► Create session in database
   ├─► Create notification for tutor
   └─► Return success response

5. DATABASE (Supabase)
   ├─► INSERT INTO sessions (...)
   ├─► INSERT INTO notifications (...)
   └─► Return inserted data

6. RESPONSE
   └─► Backend sends JSON response to frontend
       { success: true, session: {...} }

7. FRONTEND UPDATE
   └─► Display success message
   └─► Redirect to "My Sessions" page
```

---

## 🏛️ ARCHITECTURE PATTERNS

### 1. MVC Pattern (Model-View-Controller)

```
MODEL                    VIEW                   CONTROLLER
(Database)               (Frontend HTML)        (Backend Logic)
    │                         │                      │
    │                         │   User clicks    ┌───┘
    │                         │   "Login"        │
    │                         │ ─────────────────►│
    │                         │                   │ Validate credentials
    │   Query database        │                   │
    │◄──────────────────────────────────────────  │
    │   Return user data      │                   │
    │ ─────────────────────────────────────────► │
    │                         │   Send response   │
    │                         │◄──────────────────┤
    │                         │   Display         │
    │                         │   dashboard       │
```

### 2. RESTful API Design

**REST Principles:**
- **Resources:** Users, Sessions, Subjects, Materials
- **HTTP Methods:** GET (read), POST (create), PUT (update), DELETE (delete)
- **Stateless:** Each request independent, no server-side session
- **JSON:** All data in JSON format

**Example Endpoints:**
```
GET    /api/users          → Get all users
GET    /api/users/:id      → Get specific user
POST   /api/users          → Create new user
PUT    /api/users/:id      → Update user
DELETE /api/users/:id      → Delete user
```

### 3. Middleware Pipeline

Requests pass through multiple middleware layers:

```
Request → Rate Limiter → Auth → Role Check → Controller → Response
          ↓              ↓      ↓            ↓
          Block if       Block  Block if     Process
          too many       if no  wrong role   request
          requests       token
```

### 4. Layered Architecture

```
┌─────────────────────────────────────┐
│     PRESENTATION LAYER              │ Frontend (HTML/CSS/JS)
│     (User Interface)                │
└─────────────────────────────────────┘
              ↕ HTTP/WebSocket
┌─────────────────────────────────────┐
│     API LAYER                       │ Routes (Express)
│     (Endpoint Definitions)          │
└─────────────────────────────────────┘
              ↕ Function Calls
┌─────────────────────────────────────┐
│     BUSINESS LOGIC LAYER            │ Controllers
│     (Application Logic)             │
└─────────────────────────────────────┘
              ↕ Database Queries
┌─────────────────────────────────────┐
│     DATA ACCESS LAYER               │ Supabase Client
│     (Database Operations)           │
└─────────────────────────────────────┘
              ↕ SQL
┌─────────────────────────────────────┐
│     DATABASE LAYER                  │ PostgreSQL (Supabase)
│     (Data Storage)                  │
└─────────────────────────────────────┘
```

---

## 🗃️ DATABASE SCHEMA

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │───────┐
│──────────────│       │
│ user_id (PK) │       │ One user (tutor)
│ student_id   │       │ teaches many subjects
│ email        │       │
│ role         │       │
└──────────────┘       │
       │               │
       │               │
       │               ↓
       │        ┌─────────────────┐
       │        │  tutor_subjects │
       │        │─────────────────│
       │        │ tutor_id (FK)   │
       │        │ subject_id (FK) │
       │        └─────────────────┘
       │               │
       │               │
       │               ↓
       │        ┌──────────────┐
       │        │   subjects   │
       │        │──────────────│
       │        │ subject_id   │
       │        │ subject_code │
       │        │ subject_name │
       │        └──────────────┘
       │
       │ One user has many sessions
       │ (as tutor or tutee)
       │
       ↓
┌──────────────┐
│   sessions   │
│──────────────│
│ session_id   │───────┐
│ tutor_id     │       │ One session
│ tutee_id     │       │ can have one feedback
│ subject_id   │       │
│ status       │       ↓
└──────────────┘    ┌──────────────┐
                    │   feedback   │
                    │──────────────│
                    │ feedback_id  │
                    │ session_id   │
                    │ rating       │
                    │ comment      │
                    └──────────────┘
```

### Key Tables

**1. users** - All user accounts
- `user_id` (Primary Key)
- `student_id` (Unique identifier, e.g., 2021-12345)
- `email`, `password_hash`
- `role` (admin | tutor | tutee)
- `status` (active | inactive)

**2. subjects** - Available subjects for tutoring
- `subject_id` (Primary Key)
- `subject_code` (e.g., IT-111)
- `subject_name` (e.g., Introduction to Programming)
- `course` (BSIT, BSCS, etc.)

**3. tutor_subjects** - Which subjects each tutor teaches
- `tutor_id` (Foreign Key → users)
- `subject_id` (Foreign Key → subjects)
- `status` (active | inactive)

**4. sessions** - Tutoring sessions
- `session_id` (Primary Key)
- `tutor_id`, `tutee_id` (Foreign Keys → users)
- `subject_id` (Foreign Key → subjects)
- `status` (pending | confirmed | completed | cancelled)
- `session_date`, `start_time`, `end_time`

**5. feedback** - Student feedback on sessions
- `feedback_id` (Primary Key)
- `session_id` (Foreign Key → sessions)
- `rating` (1-5)
- `comment`

**6. study_materials** - Uploaded learning resources
- `material_id` (Primary Key)
- `tutor_student_id` (Foreign Key → users.student_id)
- `subject_id` (Foreign Key → subjects)
- `file_path`, `title`, `description`

---

## 🔐 AUTHENTICATION FLOW

### Registration

```
1. User submits registration form
   ↓
2. Backend validates input
   - Email format correct?
   - Password meets requirements?
   - Student ID unique?
   ↓
3. Hash password with bcrypt
   plaintext: "myPass123"
   hashed: "$2b$10$EixZaYVK..."
   ↓
4. Insert user into database
   ↓
5. Generate JWT token
   payload: { userId, studentId, role }
   secret: JWT_SECRET
   expiry: 7 days
   ↓
6. Return token to frontend
   ↓
7. Frontend stores token in localStorage
```

### Login

```
1. User submits login form
   ↓
2. Backend finds user by email
   ↓
3. Compare passwords
   bcrypt.compare(inputPassword, storedHash)
   ↓
4. If match:
   - Generate new JWT token
   - Generate refresh token (30 days)
   - Return both tokens
   ↓
5. Frontend stores tokens
   localStorage.setItem('token', ...)
```

### Authenticated Request

```
1. Frontend makes API call
   Headers: { Authorization: "Bearer <TOKEN>" }
   ↓
2. Auth Middleware extracts token
   ↓
3. Verify token with JWT_SECRET
   ↓
4. If valid:
   - Decode payload → get userId, role
   - Attach to request: req.user
   - Continue to next middleware
   ↓
5. Role Middleware checks permissions
   ↓
6. Controller processes request
```

---

## 💬 REAL-TIME CHAT ARCHITECTURE

### WebSocket Connection

```
┌──────────┐                    ┌──────────┐
│ Client A │                    │ Client B │
└────┬─────┘                    └────┬─────┘
     │                               │
     │ 1. Connect to Socket.IO       │
     │    ws://localhost:3000        │
     ├───────────────┐               │
     │               ↓               │
     │        ┌─────────────┐        │
     │        │   Server    │        │
     │        │ (Socket.IO) │        │
     │        └─────────────┘        │
     │               │               │
     │ 2. Join conversation room     │
     │    room: "2021-12345:2021-54321"
     │◄──────────────┤               │
     │               │               │
     │ 3. Send message               │
     ├──────────────►│               │
     │               │ 4. Encrypt    │
     │               │    AES-256-GCM│
     │               │               │
     │               │ 5. Save to file
     │               │    chats/metadata.json
     │               │               │
     │               │ 6. Emit to room
     │               ├──────────────►│
     │ 7. Receive    │               │ 8. Receive
     │    (decrypted)│               │    (decrypted)
     │◄──────────────┤               │◄───────────────
```

### Socket Events

**Client → Server:**
- `join_conversation` - Join chat room
- `send_message` - Send new message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `mark_read` - Mark messages as read

**Server → Client:**
- `new_message` - New message received
- `user_typing` - Other user is typing
- `messages_read` - Messages marked as read
- `user_online` - User came online
- `user_offline` - User went offline

### Message Encryption

```javascript
// Sending
const message = "Hello!";
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = cipher.update(message, 'utf8', 'hex');
// Store: { iv, encrypted, authTag }

// Receiving
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
const decrypted = decipher.update(encrypted, 'hex', 'utf8');
// Display: "Hello!"
```

---

## 📁 FILE STORAGE

### Profile Pictures

```
uploads/profiles/
├── 550e8400-e29b-41d4-a716-446655440000.jpg  # UUID filename
├── 6ba7b810-9dad-11d1-80b4-00c04fd430c8.png
└── ...
```

**Storage Strategy:**
- Local: `uploads/profiles/` (development)
- Cloud: Supabase Storage `profiles/` bucket (production)
- Max size: 2 MB
- Allowed: JPEG, PNG, GIF

### Study Materials

```
uploads/study_materials/
├── abc123-IT-111-notes.pdf
├── def456-IT-222-slides.pptx
└── ...
```

**Storage Strategy:**
- Local: `uploads/study_materials/`
- Cloud: Supabase Storage `materials/` bucket
- Max size: 10 MB
- Allowed: PDF, DOC, DOCX, PPT, PPTX, ZIP

### Chat Messages (File-based)

```
main/shared/chats/metadata.json
{
  "conversations": {
    "2021-12345:2021-54321": {
      "lastMessage": "See you tomorrow!",
      "timestamp": 1705315200000,
      "unread": 2
    }
  },
  "messages": [
    {
      "conversationId": "2021-12345:2021-54321",
      "sender": "2021-12345",
      "message": "encrypted_content_here",
      "iv": "initialization_vector",
      "authTag": "authentication_tag",
      "timestamp": 1705315200000
    }
  ]
}
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Local Development

```
┌─────────────────────────────────────┐
│     Developer's Computer            │
│                                     │
│  ┌──────────┐      ┌────────────┐  │
│  │ Frontend │◄────►│  Backend   │  │
│  │localhost │      │localhost   │  │
│  │   :3000  │      │  :3000     │  │
│  └──────────┘      └────────────┘  │
│                          │          │
└──────────────────────────┼──────────┘
                           │ HTTPS
                           ↓
                  ┌─────────────────┐
                  │    Supabase     │
                  │   (Database)    │
                  └─────────────────┘
```

### Production (Vercel)

```
         ┌──────────────────────────────┐
         │      Vercel Edge Network      │
         │  (Global CDN - 100+ locations)│
         └────────┬─────────────┬────────┘
                  │             │
          Frontend│             │Backend
          (Static)│             │(Serverless Functions)
                  │             │
         ┌────────▼──────┐   ┌─▼────────────┐
         │   HTML/CSS/   │   │  Node.js API │
         │   JavaScript  │   │  (Express)   │
         └───────────────┘   └──────┬───────┘
                                    │
                             HTTPS  │
                                    ↓
                          ┌──────────────────┐
                          │    Supabase      │
                          │   (PostgreSQL)   │
                          └──────────────────┘
```

### Serverless Functions

Vercel runs backend as serverless functions:
- **Cold Start:** ~500ms (first request)
- **Warm Start:** <50ms (subsequent requests)
- **Timeout:** 10 seconds (free tier)
- **Memory:** 1024 MB
- **Concurrent:** Scales automatically

---

## 🔧 CONFIGURATION FILES

### vercel.json
```json
{
  "builds": [
    { "src": "server/package.json", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/src/server.ts" },
    { "src": "/(.*)", "dest": "client/public/$1" }
  ]
}
```

**Purpose:**
- Tell Vercel how to build project
- Route /api/* to Node.js backend
- Route everything else to frontend static files

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  }
}
```

**Purpose:**
- TypeScript compilation settings
- Output JavaScript to `dist/` folder
- Enable strict type checking

---

## 📊 PERFORMANCE OPTIMIZATION

### Caching Strategy

**1. Browser Cache (Frontend)**
```html
<link rel="stylesheet" href="css/style.css?v=1.0">
<!-- Version number forces cache refresh when CSS changes -->
```

**2. Database Queries (Backend)**
```typescript
// Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX idx_sessions_tutee ON sessions(tutee_id);
```

**3. API Response Caching (Future)**
- Cache tutor search results (5 minutes)
- Cache subject list (1 hour)
- Cache study materials list (10 minutes)

### Load Balancing

Vercel automatically:
- Distributes requests across multiple servers
- Scales serverless functions based on demand
- Uses CDN for static files (HTML, CSS, JS, images)

---

## 🔒 SECURITY LAYERS

```
┌─────────────────────────────────────────┐
│          REQUEST                        │
└──────────────┬──────────────────────────┘
               │
               ▼
      ┌─────────────────┐
      │ HTTPS/TLS       │ ← Encrypted transport
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ Helmet.js       │ ← Security headers
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ Rate Limiting   │ ← Prevent abuse
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ Input Validation│ ← Sanitize input
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ JWT Auth        │ ← Verify identity
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ Role Check      │ ← Check permissions
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ Supabase RLS    │ ← Database-level security
      └────────┬────────┘
               │
               ▼
         ┌──────────┐
         │ RESPONSE │
         └──────────┘
```

---

## 📈 SCALABILITY CONSIDERATIONS

### Current Limits (Free Tier)

- **Vercel:** 100GB bandwidth/month, 100 serverless functions
- **Supabase:** 500MB database, 1GB file storage, 2GB bandwidth
- **Concurrent users:** ~100-200

### Scaling Path

**Stage 1: Current (0-200 users)**
- Free tier sufficient
- No optimization needed

**Stage 2: Growth (200-1,000 users)**
- Upgrade to Vercel Pro ($20/month)
- Add database indexes
- Implement response caching

**Stage 3: Scale (1,000+ users)**
- Upgrade to Supabase Pro ($25/month)
- Move to dedicated database
- Implement Redis for caching
- CDN for file storage

---

## 🧪 TESTING STRATEGY

### Unit Tests (Future)
```typescript
// Test individual functions
describe('Validation', () => {
  it('should validate email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

### Integration Tests (Future)
```typescript
// Test API endpoints
describe('POST /api/auth/login', () => {
  it('should return token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
```

### Manual Testing (Current)
- Test all endpoints with Postman/curl
- Test frontend flows manually
- Check error handling

---

## 📚 FURTHER READING

- [Getting Started](01-GETTING-STARTED.md) - Setup instructions
- [API Reference](03-API-REFERENCE.md) - All endpoints
- [Security Guide](04-SECURITY.md) - Security details
- [Deployment Guide](DEPLOYMENT.md) - Production deployment

---

**Questions about the architecture? Check the [Troubleshooting Guide](05-TROUBLESHOOTING.md)!**
