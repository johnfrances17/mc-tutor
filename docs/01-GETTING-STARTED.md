# 🚀 GETTING STARTED

Complete beginner-friendly guide to set up MC Tutor on your local computer.

**Time Required:** ~20 minutes
**Difficulty:** Beginner-friendly

---

## 📋 PREREQUISITES

Before you start, make sure you have these installed:

### 1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Choose the **LTS version** (recommended)
   - To check if installed: Open terminal and run `node --version`

### 2. **Git** (for downloading the code)
   - Download from: https://git-scm.com/
   - To check if installed: Run `git --version`

### 3. **Text Editor** (VS Code recommended)
   - Download from: https://code.visualstudio.com/

### 4. **Supabase Account** (free database)
   - Sign up at: https://supabase.com/
   - We'll use this for the database

---

## 📥 STEP 1: GET THE CODE (3 minutes)

### Option A: Download ZIP
1. Go to your GitHub repository
2. Click green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to a folder (e.g., `C:\Projects\mc-tutor`)

### Option B: Clone with Git
```bash
# Open terminal and run:
git clone https://github.com/YOUR_USERNAME/mc-tutor.git
cd mc-tutor
```

---

## 🗄️ STEP 2: SETUP DATABASE (10 minutes)

### 2.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click **"New project"**
3. Fill in:
   - **Name:** mc-tutor
   - **Database Password:** (create a strong password - save it!)
   - **Region:** Choose closest to you
4. Click **"Create new project"** (takes ~2 minutes)

### 2.2 Import Database Schema
1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"+ New query"**
3. Open file: `supabase_migration_safe.sql` from your project
4. Copy ALL the content
5. Paste into Supabase SQL Editor
6. Click **"Run"** button (bottom right)
7. Wait for success message ✅

### 2.3 Get Your Credentials
1. In Supabase dashboard, click **"Settings"** (left sidebar)
2. Click **"API"**
3. Copy these values (you'll need them soon):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (long string starting with `eyJ...`)

---

## ⚙️ STEP 3: CONFIGURE ENVIRONMENT (5 minutes)

### 3.1 Backend Configuration

1. Navigate to `server/` folder in your project
2. Create a file named `.env` (note the dot at the start!)
3. Add this content (replace with YOUR values):

```env
# Database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security
JWT_SECRET=mc-tutor-jwt-secret-change-this-in-production
ENCRYPTION_KEY=YourBase64EncodedEncryptionKey==

# Server
PORT=3000
NODE_ENV=development
```

### 3.2 Generate Encryption Key

Run this command to generate a secure encryption key:

**Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Mac/Linux:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and replace `YourBase64EncodedEncryptionKey==` in your `.env` file.

---

## 📦 STEP 4: INSTALL DEPENDENCIES (2 minutes)

### 4.1 Install Backend Dependencies

```bash
# Navigate to server folder
cd server

# Install packages
npm install
```

### 4.2 Install Frontend Dependencies (Optional)

Frontend uses plain HTML/CSS/JS - no installation needed!

---

## ▶️ STEP 5: START THE APPLICATION

### 5.1 Start Backend Server

```bash
# In server folder
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ Database connected
```

### 5.2 Open Frontend

1. Open your browser
2. Go to: `http://localhost:3000`
3. You should see the MC Tutor homepage! 🎉

---

## 🧪 STEP 6: TEST EVERYTHING (5 minutes)

### Test 1: Registration
1. Click **"Register"**
2. Fill in the form:
   - Student ID: `2021-12345`
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `Test User`
   - Role: `Student (Tutee)`
3. Click **"Register"**
4. You should be redirected to dashboard ✅

### Test 2: Login
1. Logout (top right)
2. Click **"Login"**
3. Enter same email/password
4. Should redirect to dashboard ✅

### Test 3: API Health Check
Open browser and go to: `http://localhost:3000/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🎯 NEXT STEPS

Congrats! Your app is running. Now you can:

### For Students (Tutees):
- Find tutors
- Book sessions
- View study materials
- Chat with tutors

### For Tutors:
- Add subjects you can teach
- Manage session requests
- Upload study materials
- Give feedback

### For Admins:
- Manage users
- Manage subjects
- View statistics

---

## 📂 PROJECT STRUCTURE

Here's what's in your project:

```
mc-tutor/
├── client/                 # Frontend (HTML/CSS/JS)
│   └── public/
│       ├── index.html     # Homepage
│       ├── login.html
│       ├── register.html
│       └── js/
│           └── api.js     # API calls
│
├── server/                 # Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Authentication, validation
│   │   └── server.ts      # Main server file
│   ├── package.json
│   └── .env              # Your secrets (don't share!)
│
├── docs/                   # Documentation (you're here!)
└── supabase_migration_safe.sql  # Database schema
```

---

## 🛠️ COMMON COMMANDS

### Development:
```bash
# Start backend in development mode (auto-reload)
cd server
npm run dev

# Build backend for production
npm run build

# Start production server
npm start
```

### Database:
```bash
# Reset database (WARNING: deletes all data!)
# 1. Go to Supabase SQL Editor
# 2. Run: DROP SCHEMA public CASCADE; CREATE SCHEMA public;
# 3. Re-import supabase_migration_safe.sql
```

### Testing:
```bash
# Test API endpoint with curl (Windows PowerShell)
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET

# Test API endpoint with curl (Mac/Linux)
curl http://localhost:3000/api/health
```

---

## 🔍 FILE LOCATIONS

### Where to find important files:

**Environment Variables:** `server/.env`
**API Endpoints:** `server/src/routes/`
**Business Logic:** `server/src/controllers/`
**Frontend Pages:** `client/public/*.html`
**API Client:** `client/public/js/api.js`
**Database Schema:** `supabase_migration_safe.sql`

---

## 🆘 TROUBLESHOOTING

### Problem: "Cannot find module"
**Solution:** Run `npm install` in the `server/` folder

### Problem: "Port 3000 already in use"
**Solution:** 
- Windows: Find and kill the process using port 3000
- Or change PORT in `.env` file to 3001

### Problem: "Database connection failed"
**Solution:** Check your `.env` file has correct SUPABASE_URL and SUPABASE_ANON_KEY

### Problem: "Unauthorized" errors
**Solution:** Your JWT token expired. Logout and login again.

### Problem: Frontend can't connect to backend
**Solution:** Make sure backend is running on `http://localhost:3000`

---

## 📚 LEARN MORE

- [API Reference](03-API-REFERENCE.md) - All API endpoints
- [Security Guide](04-SECURITY.md) - How we keep data safe
- [Troubleshooting](05-TROUBLESHOOTING.md) - Fix common issues
- [Deployment Guide](DEPLOYMENT.md) - Deploy to production

---

## 💡 TIPS FOR BEGINNERS

### What is an API?
An API (Application Programming Interface) is how the frontend (what you see) talks to the backend (where data is stored). Think of it like a waiter in a restaurant - you tell the waiter what you want, they bring it from the kitchen.

### What is TypeScript?
TypeScript is JavaScript with "types" - it helps catch errors before you run the code. Don't worry, it compiles to regular JavaScript.

### What is Supabase?
Supabase is a cloud database (PostgreSQL) with built-in authentication. Think of it like a spreadsheet in the cloud, but way more powerful.

### What is an Environment Variable?
Environment variables (in `.env` file) store secrets like passwords and API keys. Never share your `.env` file or commit it to GitHub!

---

**Need more help?** Check the [Troubleshooting Guide](05-TROUBLESHOOTING.md) or ask in the project issues!
