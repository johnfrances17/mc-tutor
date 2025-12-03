# MC Tutor Server

Node.js/Express backend for MC Tutor - Cloud-Based Peer Tutoring Platform

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account with project set up
- PostgreSQL database (via Supabase)

### Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Entry point
├── data/                # File-based storage
│   ├── chats/           # Chat messages (JSON)
│   ├── notifications/   # User notifications (JSON)
│   └── sessions/        # Session preferences (JSON)
├── dist/                # Compiled JavaScript (production)
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-picture` - Upload profile picture

### Sessions
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create session booking
- `PUT /api/sessions/:id/confirm` - Confirm session
- `PUT /api/sessions/:id/cancel` - Cancel session
- `PUT /api/sessions/:id/complete` - Mark session complete

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID

### Tutors
- `GET /api/tutors/search` - Search tutors
- `GET /api/tutors/:id` - Get tutor profile
- `GET /api/tutors/:id/subjects` - Get tutor subjects
- `POST /api/tutors/subjects` - Add tutor subject

### Materials
- `GET /api/materials` - Get study materials
- `POST /api/materials/upload` - Upload material
- `DELETE /api/materials/:id` - Delete material
- `GET /api/materials/:id/download` - Download material

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/tutor/:id` - Get tutor feedback

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/messages/:userId` - Get messages with user
- `POST /api/chat/send` - Send message
- `PUT /api/chat/mark-read/:userId` - Mark messages as read

## 🔒 Environment Variables

Required environment variables (see `.env.example`):

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `ENCRYPTION_KEY` - Base64 encryption key for chat
- `ALLOWED_ORIGINS` - CORS allowed origins

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Environment Variables on Vercel

Set all environment variables from `.env` in Vercel dashboard.

## 🛠️ Development

### Code Style

- ESLint for linting
- Prettier for formatting

```bash
npm run lint
npm run format
```

## 📄 License

MIT
