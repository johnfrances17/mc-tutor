# 🔴 SUPABASE CONNECTION ISSUE - FIX REQUIRED

## Problem
Login fails with "Invalid email or password" error even with correct credentials.

System Status shows: **Supabase Database: OFFLINE**

## Root Cause
Vercel deployment is missing required environment variables for Supabase connection.

## Current Status
- ✅ Local development: Works (uses server/.env file)
- ❌ Vercel production: Broken (no environment variables configured)

## Required Environment Variables

These must be added in Vercel Dashboard:

```env
SUPABASE_URL=https://axrzqr2hceaiujyixif.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcjJoY2VhaXVqeWl4aWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzM1OTYwNywiZXhwIjoyMDQ4OTM1NjA3fQ.0m1234567890abcdefghijklmnopqrstuvwxyz...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcjJoY2VhaXVqeWl4aWYiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzMzMzU5NjA3LCJleHAiOjIwNDg5MzU2MDd9.abcdef1234567890...
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=base64-encoded-32-byte-key
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./data
```

## How to Fix on Vercel

### Method 1: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select project: **mc-tutor**
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click "Add New"
   - Enter Variable Name (e.g., `SUPABASE_URL`)
   - Enter Value
   - Select "Production, Preview, Development"
   - Click "Save"
5. Repeat for all variables above
6. **Redeploy** the project

### Method 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Set environment variables
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add JWT_SECRET production
vercel env add JWT_EXPIRES_IN production
vercel env add ENCRYPTION_KEY production

# Redeploy
vercel --prod
```

## Getting Your Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project: **mc-tutor**
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

## Verification

After adding environment variables and redeploying:

1. Visit: https://mc-tutor.vercel.app/html/system-status.html
2. Check "Supabase Database" status
3. Should show: ✅ **Online** with green indicator
4. Try logging in at: https://mc-tutor.vercel.app/html/auth/login.html

## Test Credentials

Use these to test after fix:
```
Email: test@mctutor.com
Password: Test123!
Role: Student
```

## Security Notes

⚠️ **NEVER commit these keys to Git!**
- Keys are already in `.gitignore` via `server/.env`
- Only add them to Vercel environment variables
- Keep service_role key secret (admin access)

## Additional Info

- See: `server/.env.example` for full list of variables
- See: `docs/DEPLOYMENT.md` for complete deployment guide
- See: `server/src/config/database.ts` for Supabase client setup

---

**Status:** AWAITING FIX  
**Priority:** HIGH (Blocks all login functionality)  
**Estimated Fix Time:** 10 minutes
