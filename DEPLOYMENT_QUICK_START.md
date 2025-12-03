# 🚀 QUICK DEPLOYMENT GUIDE

**Version:** 2.0.0  
**Status:** Production Ready  
**Time Required:** 5 minutes

---

## ✅ PRE-FLIGHT CHECKLIST

Before deploying, verify:

- [ ] Code pushed to GitHub
- [ ] `server/.env` configured locally
- [ ] Supabase project created
- [ ] Database schema imported
- [ ] Local testing passed

---

## 🎯 DEPLOY TO VERCEL (5 MINUTES)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Import your `mc-tutor` repository

### Step 2: Configure Build Settings
Vercel will auto-detect settings from `vercel.json`, but verify:

```
Framework Preset: Other
Build Command: cd server && npm install && npm run build
Output Directory: server/dist
Install Command: cd server && npm install
```

### Step 3: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

```env
# Required
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-32-char-secret-here
ENCRYPTION_KEY=YourBase64Key==

# Optional
NODE_ENV=production
PORT=3000
```

**Get these values:**
- `SUPABASE_URL` & `SUPABASE_ANON_KEY`: From Supabase dashboard → Settings → API
- `JWT_SECRET`: Run `openssl rand -base64 32`
- `ENCRYPTION_KEY`: Run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### Step 4: Deploy!
Click **"Deploy"** button and wait ~2 minutes.

Your app will be live at: `https://your-project.vercel.app`

---

## 🗄️ SUPABASE SETUP (10 MINUTES)

### Step 1: Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Name: `mc-tutor`
4. Database Password: (create strong password - save it!)
5. Region: Choose closest to you
6. Click "Create new project" (takes ~2 min)

### Step 2: Import Database Schema
1. In Supabase dashboard → SQL Editor
2. Click "+ New query"
3. Copy all content from `supabase_migration_safe.sql`
4. Paste and click "Run"
5. Wait for success message

### Step 3: Create Storage Buckets
1. Go to Storage → Create bucket
2. Create two buckets:
   - Name: `profile-pictures`, Public: ✅
   - Name: `study-materials`, Public: ❌

### Step 4: Get API Credentials
1. Settings → API
2. Copy:
   - Project URL (`SUPABASE_URL`)
   - Anon public key (`SUPABASE_ANON_KEY`)
3. Add to Vercel environment variables

---

## 🧪 TEST DEPLOYMENT

### 1. Health Check
```bash
curl https://your-project.vercel.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Test Registration
Visit: `https://your-project.vercel.app/register.html`

Fill form and register a test user.

### 3. Test Login
Visit: `https://your-project.vercel.app/login.html`

Login with test account.

### 4. Test Dashboard
Should redirect to dashboard after login.

---

## 🔧 TROUBLESHOOTING

### "Build failed"
- Check `server/package.json` exists
- Verify `tsconfig.json` is valid
- Look at Vercel build logs for errors

### "Cannot connect to database"
- Verify `SUPABASE_URL` is correct (must start with https://)
- Verify `SUPABASE_ANON_KEY` is correct
- Check Supabase project is not paused (free tier pauses after 1 week inactivity)

### "Unauthorized" errors
- Check `JWT_SECRET` is set in Vercel
- Try logging out and logging in again
- Verify token hasn't expired (7 days default)

### "Function timeout"
- Free tier has 10-second limit
- Optimize slow database queries
- Add indexes to frequently queried columns
- Consider upgrading Vercel plan

---

## 📊 POST-DEPLOYMENT

### Monitor Performance
- Vercel Dashboard → Analytics
- Check response times
- Monitor error rates

### Setup Custom Domain (Optional)
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for DNS propagation (~24 hours)

### Enable Automatic Deployments
Already enabled! Every push to `main` branch auto-deploys.

---

## 🎉 YOU'RE LIVE!

Your MC Tutor platform is now running at:
`https://your-project.vercel.app`

### Share with users:
- Registration: `/register.html`
- Login: `/login.html`
- API: `/api` (all endpoints)

### Admin Panel:
Create first admin:
1. Register a test account
2. In Supabase → Table Editor → users
3. Find your user, change `role` to `'admin'`
4. Logout and login again
5. Access admin dashboard

---

## 📚 NEXT STEPS

1. ✅ Test all features thoroughly
2. ✅ Create admin accounts
3. ✅ Add initial subjects
4. ✅ Invite tutors to register
5. ✅ Monitor performance
6. ✅ Setup error alerts (Sentry)

---

**Need help?** Check `docs/DEPLOYMENT.md` for detailed guide!

**Questions?** Open an issue on GitHub.

**Congratulations! 🎊 Your app is LIVE!**
