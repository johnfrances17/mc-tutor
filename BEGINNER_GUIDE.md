# 🚀 MC Tutor - Quick Start Guide for Beginners

Welcome to MC Tutor! This guide will help you get started quickly and safely.

## 📋 Prerequisites

Before you begin, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **XAMPP** (for Apache server) - [Download here](https://www.apachefriends.org/)
- **Supabase Account** (free) - [Sign up here](https://supabase.com/)

## 🔧 Setup Steps

### 1. Install Dependencies

Open your terminal in the `server` folder and run:

```bash
cd server
npm install
```

This will install all required packages for the backend.

### 2. Configure Environment Variables

Create a `.env` file in the `server` folder with these settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration (Get from Supabase Dashboard)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Security Keys (Generate new ones!)
JWT_SECRET=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=your-base64-encryption-key-change-this

# Optional Settings
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./data
```

**⚠️ IMPORTANT SECURITY TIPS:**
- Never share your `.env` file
- Change the default `JWT_SECRET` to something unique
- Generate a new `ENCRYPTION_KEY` using the provided script

### 3. Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
npm run generate-key
```

Copy the output and paste it into your `.env` file as `ENCRYPTION_KEY`.

### 4. Setup Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `schema.sql`
4. Run the seed data from `seed.sql` (optional - for sample data)

### 5. Create Storage Buckets

In your Supabase dashboard:
1. Go to Storage
2. Create two buckets:
   - `profile-pictures` (Public)
   - `study-materials` (Private)

### 6. Start the Server

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm run build
npm start
```

You should see:
```
🚀 MC Tutor Server running on port 3000
✅ Supabase client initialized
🔌 Socket.IO enabled
```

### 7. Start the Frontend

1. Open XAMPP Control Panel
2. Start Apache server
3. Open browser and go to: `http://localhost/mc-tutor/`

## 🔐 Security Features

### Built-in Protection:
- ✅ **Rate Limiting** - Prevents abuse (100 requests per 15 min)
- ✅ **Input Sanitization** - Blocks XSS attacks
- ✅ **Password Hashing** - Uses bcrypt for secure storage
- ✅ **JWT Authentication** - Secure session management
- ✅ **Message Encryption** - AES-256-GCM for chat messages
- ✅ **CORS Protection** - Restricts cross-origin requests
- ✅ **Helmet.js** - Sets security headers

### Rate Limits:
- General API: 100 requests / 15 minutes
- Login attempts: 5 attempts / 15 minutes
- File uploads: 10 uploads / hour
- Chat messages: 30 messages / minute

## 📁 Project Structure

```
mc-tutor/
├── client/                 # Frontend (HTML, CSS, JS)
│   └── public/
│       ├── index.php      # Login page
│       ├── register.php   # Registration
│       └── messenger.html # Real-time chat
│
├── server/                # Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, validation, rate limiting
│   │   ├── routes/       # API endpoints
│   │   ├── sockets/      # WebSocket handlers
│   │   └── server.ts     # Main entry point
│   │
│   ├── data/             # File-based storage
│   │   ├── chats/        # Encrypted messages
│   │   ├── materials/    # Study materials metadata
│   │   ├── notifications/# User notifications
│   │   └── sessions/     # Session preferences
│   │
│   └── uploads/          # Uploaded files
│       ├── profiles/     # Profile pictures
│       └── study_materials/
```

## 🛠️ Common Issues & Solutions

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution:** Run `npm install` in the server folder

### Issue: "Port 3000 already in use"
**Solution:** 
- Stop any other Node.js processes
- Or change PORT in `.env` file

### Issue: "Supabase connection failed"
**Solution:**
- Check your SUPABASE_URL and SUPABASE_KEY
- Verify internet connection
- Check Supabase project status

### Issue: "JWT token invalid"
**Solution:**
- Clear browser cookies
- Log out and log in again
- Check if JWT_SECRET matches in .env

### Issue: "File upload fails"
**Solution:**
- Check Supabase storage buckets exist
- Verify file size (max 2MB for profiles, 10MB for materials)
- Check file type is allowed

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/picture` - Upload profile picture
- `PUT /api/users/password` - Change password

### Sessions
- `GET /api/sessions` - Get tutoring sessions
- `POST /api/sessions` - Book new session
- `PUT /api/sessions/:id/confirm` - Confirm session (tutor)
- `PUT /api/sessions/:id/complete` - Complete session (tutor)
- `DELETE /api/sessions/:id/cancel` - Cancel session

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/messages/:userId` - Get messages with user
- `POST /api/chat/send` - Send message
- `PUT /api/chat/read/:userId` - Mark as read

### Materials
- `GET /api/materials` - Browse study materials
- `POST /api/materials/upload` - Upload material (tutor)
- `DELETE /api/materials/:id` - Delete material (tutor)
- `GET /api/materials/:id/download` - Download material

### Feedback
- `POST /api/feedback` - Submit feedback (tutee)
- `GET /api/feedback/my` - My feedback (tutee)
- `GET /api/feedback/received` - Received feedback (tutor)
- `GET /api/feedback/tutor/:id` - Get tutor feedback

## 🔍 Testing Checklist

- [ ] Server starts without errors
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can view dashboard
- [ ] Can upload profile picture
- [ ] Can book a session
- [ ] Can send chat messages
- [ ] Can upload study materials (tutor)
- [ ] Can submit feedback (tutee)
- [ ] Real-time chat notifications work

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Guides](https://supabase.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 🆘 Getting Help

If you encounter issues:
1. Check the error message in terminal
2. Review this guide for common solutions
3. Check server logs in console
4. Verify all environment variables are set
5. Ensure Supabase is configured correctly

## 🎯 Next Steps

After setup:
1. Create test accounts (tutor and tutee)
2. Test booking a session
3. Try the real-time chat
4. Upload a study material
5. Submit feedback

**Happy Coding! 🚀**
