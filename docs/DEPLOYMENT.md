# 🚀 SIMPLE DEPLOYMENT GUIDE

## What You're Deploying:
- ✅ Node.js Backend (server/)
- ✅ HTML/CSS/JS Frontend (client/public/)
- ✅ Supabase Database (cloud)

---

## 📋 QUICK START CHECKLIST:

- [ ] Step 1: Setup Supabase Database (10 min)
- [ ] Step 2: Deploy to Vercel (5 min)
- [ ] Step 3: Add Environment Variables (3 min)
- [ ] Step 4: Test Your App (2 min)

**Total Time: ~20 minutes**

---

## STEP 1: Setup Supabase Database ⏱️ 10 minutes

### 1.1 Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project" button
3. Sign in with GitHub (easiest) or email

### 1.2 Create New Project
1. Click "New Project" button (top right)
2. Fill in:
   - **Name:** `mc-tutor`
   - **Database Password:** Create a strong password (SAVE IT!)
   - **Region:** Choose "Singapore" or "Tokyo" (closest to Philippines)
3. Click "Create new project"
4. ⏰ **Wait 2-3 minutes** while Supabase sets up your database

### 1.3 Import Database Schema
1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New query" button
3. Open your file: `supabase_migration_safe.sql`
4. Copy ALL content (Ctrl+A, then Ctrl+C)
5. Paste into Supabase SQL Editor (Ctrl+V)
6. Click "Run" button (bottom right)
7. ✅ You should see "Success" message

### 1.4 Verify Tables Created
1. Click "Table Editor" (left sidebar)
2. You should see these tables:
   - users
   - sessions
   - subjects
   - feedback
   - tutor_subjects
   - study_materials
   - notifications
   - chat_messages
3. ✅ If you see all these → Database is ready!

### 1.5 Get Your Credentials
1. Click "Project Settings" (⚙️ gear icon, bottom left)
2. Click "API" in the settings menu
3. Copy these values (you'll need them in Step 3):
   
   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   
   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```
   
   **service_role key:** (Click "Reveal" button first)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```

4. **IMPORTANT:** Save these in a text file temporarily!

---

## STEP 2: Deploy to Vercel ⏱️ 5 minutes

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up" (if first time) or "Log In"
3. Sign in with GitHub (recommended - easier)

### 2.2 Connect Your GitHub Repository
1. In Vercel dashboard, click "Add New..." button
2. Select "Project"
3. If your GitHub repo is already connected:
   - Find "mc-tutor" in the list
   - Click "Import"
4. If not connected:
   - Click "Import Git Repository"
   - Connect GitHub account
   - Select "mc-tutor" repository

### 2.3 Configure Deployment
1. **Framework Preset:** Select "Other"
2. **Root Directory:** Leave as "./" (root)
3. **Build Command:** Leave default
4. **Output Directory:** Leave default
5. **Don't add environment variables yet** (we'll do in next step)
6. Click "Deploy" button

⏰ **Wait 2-3 minutes** for first deployment...

---

## STEP 3: Add Environment Variables ⏱️ 3 minutes

### 3.1 Open Environment Variables Settings
1. After deployment, click "Settings" tab (top menu)
2. Click "Environment Variables" (left sidebar)

### 3.2 Add Each Variable ONE BY ONE

**Variable 1: Supabase URL**
- Name: `SUPABASE_URL`
- Value: Your Supabase URL from Step 1.5
- Click "Add"

**Variable 2: Supabase Anon Key**
- Name: `SUPABASE_ANON_KEY`
- Value: Your anon key from Step 1.5
- Click "Add"

**Variable 3: Supabase Service Key**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your service role key from Step 1.5
- Click "Add"

**Variable 4: JWT Secret**
- Name: `JWT_SECRET`
- Value: `mc-tutor-jwt-secret-2025-change-this-in-production`
- Click "Add"

**Variable 5: JWT Expiration**
- Name: `JWT_EXPIRES_IN`
- Value: `7d`
- Click "Add"

**Variable 6: Encryption Key** (Generate this!)
- Name: `ENCRYPTION_KEY`
- Value: Generate using one of these methods:

**Method A - Using Node.js:**
```bash
# In VS Code terminal (Ctrl + `)
cd server
node scripts/generate-key.js
# Copy the generated key
```

**Method B - Use this example:**
```
YourBase64EncodedEncryptionKey32Chars==
```
- Click "Add"

**Variable 7: Allowed Origins**
- Name: `ALLOWED_ORIGINS`
- Value: `https://your-vercel-url.vercel.app` (use your actual Vercel URL)
- Click "Add"

### 3.3 Redeploy with New Variables
1. Go to "Deployments" tab
2. Click the "..." menu on latest deployment
3. Click "Redeploy"
4. Click "Redeploy" to confirm
5. ⏰ Wait 1-2 minutes for redeployment

---

## STEP 4: Test Your App ⏱️ 2 minutes

### 4.1 Open Your Live App
1. In Vercel, you'll see your URL:
   ```
   https://mc-tutor-xxxxxx.vercel.app
   ```
2. Click on it to open your app in browser

### 4.2 Test Registration
1. Go to `/client/public/register.html` or click "Register"
2. Fill in test data:
   - **Student ID:** `TEST-001`
   - **Email:** `test@example.com`
   - **Password:** `test123`
   - **Full Name:** `Test User`
   - **Role:** Select "Student (Tutee)"
   - **Phone:** `09123456789`
   - **Year Level:** `1st Year`
   - **Course:** `BSIT`
3. Click "Register" button
4. ✅ Should redirect to login page with success message

### 4.3 Test Login
1. Enter:
   - **Email:** `test@example.com`
   - **Password:** `test123`
   - **Role:** Select "Student"
2. Click "Login"
3. ✅ Should redirect to student dashboard

### 4.4 Test Dashboard Features
1. Click around the dashboard
2. Try:
   - View subjects
   - Find tutors
   - View materials
   - Check profile
3. ✅ Everything should load without errors!

---

## 🎉 SUCCESS! You're Live!

Your app is now running on:
- **Frontend:** Vercel CDN (fast worldwide)
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL cloud)

---

## 🚨 TROUBLESHOOTING

### Error: "Cannot connect to database"
**Cause:** Environment variables not set correctly

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Double-check `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Make sure there are no extra spaces
4. Redeploy

### Error: "401 Unauthorized" when logging in
**Cause:** JWT_SECRET mismatch or not set

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Make sure `JWT_SECRET` is set
3. Try setting it to a new random string
4. Redeploy

### Error: "Failed to fetch" or "Network error"
**Cause:** API URL not configured correctly

**Fix:**
1. Check `client/public/js/api.js` - should auto-detect URL
2. Make sure `vercel.json` routes are correct
3. Redeploy

### Error: Page shows blank or "Cannot GET /"
**Cause:** Routes not configured correctly

**Fix:**
1. Check `vercel.json` - should route `/` to `client/public/`
2. Make sure `client/public/index.html` exists
3. Redeploy

### Check Logs for Errors
1. Go to Vercel → Deployments
2. Click on latest deployment
3. Click "View Function Logs"
4. Look for error messages in red

---

## 📞 STILL STUCK?

### Check These:
1. **Browser Console** (Press F12 → Console tab)
   - Look for red error messages
   - Shows JavaScript errors

2. **Vercel Logs** (Deployments → Click deployment → Logs)
   - Shows server errors
   - Shows API request errors

3. **Supabase Logs** (Project → Logs)
   - Shows database query errors
   - Shows authentication errors

### Common Issues:
- ❌ "Module not found" → Redeploy (dependencies not installed)
- ❌ "Cannot read property" → Check environment variables
- ❌ "CORS error" → Add your domain to ALLOWED_ORIGINS
- ❌ "Rate limit exceeded" → Wait a few minutes, try again

---

## 🎓 WHAT YOU JUST LEARNED:

✅ How to deploy a Node.js + TypeScript backend
✅ How to use Supabase (cloud database)
✅ How to deploy frontend to Vercel
✅ How to set environment variables
✅ How to debug deployment issues

**Congratulations! Your tutoring platform is LIVE! 🎉**

---

## 📊 NEXT STEPS:

### For Development:
1. Test all features thoroughly
2. Add more tutors and subjects
3. Invite users to test
4. Gather feedback

### For Production:
1. Get a custom domain (optional)
2. Set up monitoring (Vercel Analytics)
3. Enable HTTPS (automatic on Vercel)
4. Set up backups (Supabase has auto-backups)

### For Growth:
1. Add email notifications
2. Add SMS notifications (via Twilio)
3. Add payment integration
4. Add video call feature

---

## 🔐 SECURITY REMINDERS:

- ✅ Never share your `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Never commit `.env` files to GitHub
- ✅ Change `JWT_SECRET` to a strong random value
- ✅ Generate proper `ENCRYPTION_KEY` (don't use example)
- ✅ Enable 2FA on Supabase and Vercel accounts

---

**Need help? Check the Troubleshooting section above!** 🚀
