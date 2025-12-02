# Vercel & Supabase CLI Setup Guide

Complete guide for deploying MC Tutor to Vercel with Supabase CLI integration.

---

## 📦 Part 1: Install CLIs

### Install Vercel CLI

```powershell
npm install -g vercel
```

Verify installation:
```powershell
vercel --version
```

### Install Supabase CLI

```powershell
# Using npm
npm install -g supabase

# OR using Scoop (Windows package manager)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Verify installation:
```powershell
supabase --version
```

---

## 🔐 Part 2: Login to Services

### Login to Vercel

```powershell
vercel login
```

This will:
1. Open browser for authentication
2. Login with GitHub, GitLab, or Bitbucket
3. Confirm in terminal

### Login to Supabase

```powershell
supabase login
```

This will:
1. Open browser to generate access token
2. Copy token from browser
3. Paste into terminal

**Alternative: Use Access Token Directly**
```powershell
# Generate token at: https://supabase.com/dashboard/account/tokens
supabase login --token your-access-token
```

---

## 🔗 Part 3: Link Supabase Project

### Initialize Supabase in Your Project

```powershell
# Navigate to project directory
cd c:\xampp\htdocs\mc-tutor

# Initialize Supabase (creates supabase/ folder)
supabase init
```

### Link to Your Remote Project

```powershell
# Link to your existing Supabase project
supabase link --project-ref axrzqrzlnceaiuiyixif
```

You'll be prompted for database password (the one you set when creating the project).

### Verify Link

```powershell
supabase status
```

Should show:
```
API URL: https://axrzqrzlnceaiuiyixif.supabase.co
DB URL: postgresql://postgres:[YOUR-PASSWORD]@...
Studio URL: https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif
```

---

## 🚀 Part 4: Prepare for Vercel Deployment

### Create `vercel.json` Configuration

Create file: `c:\xampp\htdocs\mc-tutor\vercel.json`

```json
{
  "version": 2,
  "name": "mc-tutor",
  "builds": [
    {
      "src": "*.php",
      "use": "vercel-php@0.6.0"
    },
    {
      "src": "main/**/*.php",
      "use": "vercel-php@0.6.0"
    }
  ],
  "routes": [
    {
      "src": "/(.*)\\.php",
      "dest": "/$1.php"
    },
    {
      "src": "/main/(.*)",
      "dest": "/main/$1"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "/uploads/$1"
    },
    {
      "src": "/",
      "dest": "/index.php"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key",
    "ENCRYPTION_KEY": "@encryption_key"
  },
  "regions": ["sin1"]
}
```

### Create `.vercelignore`

Create file: `c:\xampp\htdocs\mc-tutor\.vercelignore`

```
node_modules
.git
.env
.env.local
vendor
composer.lock
*.log
.DS_Store
Thumbs.db
.vscode
.idea
supabase/.temp
supabase/logs
```

### Create `composer.json` (if not exists)

Create file: `c:\xampp\htdocs\mc-tutor\composer.json`

```json
{
  "name": "mc-tutor/platform",
  "description": "MC Peer Tutoring Platform",
  "type": "project",
  "require": {
    "php": "^8.0",
    "supabase/supabase-php": "^0.3"
  },
  "autoload": {
    "psr-4": {
      "App\\": "main/shared/"
    }
  }
}
```

---

## 🎯 Part 5: Deploy to Vercel

### Option A: Deploy with CLI

```powershell
# First time deployment
cd c:\xampp\htdocs\mc-tutor
vercel
```

Follow the prompts:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Select your account
3. **Link to existing project?** → No
4. **Project name?** → `mc-tutor` (or your choice)
5. **Directory?** → `.` (current directory)
6. **Override settings?** → No

### Add Environment Variables

After first deployment, add secrets:

```powershell
# Add Supabase URL
vercel env add SUPABASE_URL

# When prompted, paste:
https://axrzqrzlnceaiuiyixif.supabase.co

# Select environments: Production, Preview, Development (all)

# Add Supabase Anon Key
vercel env add SUPABASE_ANON_KEY

# When prompted, paste:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzUyMTksImV4cCI6MjA4MDI1MTIxOX0.utJg3rVhvn-D1JxUaIZS1szF5Gx7h_o3dc64ne0WhJg

# Add Service Role Key (for backend operations)
vercel env add SUPABASE_SERVICE_ROLE_KEY

# When prompted, paste:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NTIxOSwiZXhwIjoyMDgwMjUxMjE5fQ.lxpHNuYzfJFdJHAsvGj94N56mhL-JQYmuWvImaMvEtE

# Add Encryption Key
vercel env add ENCRYPTION_KEY

# When prompted, paste:
oSH0nFC0TQstyVRHZr45VaIpO9zPH0wVamNdOBZ3g84=
```

### Redeploy with Environment Variables

```powershell
vercel --prod
```

### Option B: Deploy with Git Integration (Recommended)

1. **Initialize Git** (if not already):
```powershell
cd c:\xampp\htdocs\mc-tutor
git init
git add .
git commit -m "Initial commit - MC Tutor Platform"
```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create repository: `mc-tutor`
   - Don't initialize with README

3. **Push to GitHub**:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/mc-tutor.git
git branch -M main
git push -u origin main
```

4. **Connect Vercel to GitHub**:
   - Go to https://vercel.com/new
   - Import your `mc-tutor` repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

---

## 🛠️ Part 6: Supabase CLI Useful Commands

### Database Management

```powershell
# Pull database schema from remote
supabase db pull

# Push local migrations to remote
supabase db push

# Reset remote database (DANGER!)
supabase db reset --linked

# Generate TypeScript types from database
supabase gen types typescript --linked > types/supabase.ts
```

### Run SQL Migrations

```powershell
# Create new migration file
supabase migration new add_new_feature

# Apply migration to remote
supabase db push
```

### View Database Logs

```powershell
# View real-time database logs
supabase logs db

# View API logs
supabase logs api
```

### Local Development (Optional)

```powershell
# Start local Supabase (Docker required)
supabase start

# Stop local Supabase
supabase stop
```

---

## 📊 Part 7: Verify Deployment

### Check Vercel Deployment

```powershell
# List all deployments
vercel ls

# Open deployment in browser
vercel --prod --open
```

### Test Your Application

Visit your Vercel URL (e.g., `https://mc-tutor.vercel.app`)

Test these endpoints:
- ✅ Homepage: `/`
- ✅ Login: `/index.php`
- ✅ Register: `/register.php`
- ✅ Student Dashboard: `/main/student/dashboard.php`
- ✅ Tutor Dashboard: `/main/tutor/dashboard.php`

### Check Environment Variables

```powershell
# List environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.production
```

---

## 🔄 Part 8: Continuous Deployment Workflow

### Automatic Deployments (with Git)

Every time you push to GitHub:

```powershell
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically:
1. ✅ Build your project
2. ✅ Run tests (if configured)
3. ✅ Deploy to preview URL
4. ✅ Deploy to production (on `main` branch)

### Manual Deployments

```powershell
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific directory
vercel --cwd c:\xampp\htdocs\mc-tutor
```

---

## 🔧 Part 9: Database Migrations with Supabase CLI

### Create Migration for Schema Changes

```powershell
# Example: Add new column to users table
supabase migration new add_auth_user_id_to_users
```

Edit the generated file in `supabase/migrations/`:

```sql
-- Add auth_user_id column to link Supabase Auth
ALTER TABLE users ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
```

Apply migration:

```powershell
supabase db push
```

### Generate Migration from Current Database

```powershell
# Pull current schema from Supabase
supabase db pull

# This creates a migration file with current state
```

---

## 📱 Part 10: Storage Management via CLI

### List Storage Buckets

```powershell
# Using Supabase CLI
supabase storage list
```

### Upload Files Programmatically

Create script: `upload_to_storage.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://axrzqrzlnceaiuiyixif.supabase.co',
  'YOUR_SERVICE_ROLE_KEY'
);

async function uploadFile(bucketName, filePath, storagePath) {
  const fileBuffer = fs.readFileSync(filePath);
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Uploaded:', data);
  }
}

// Example: Upload profile picture
uploadFile('profile-pictures', './uploads/profiles/test.jpg', 'user123/profile.jpg');
```

Run:
```powershell
node upload_to_storage.js
```

---

## 🎨 Part 11: Custom Domain Setup (Optional)

### Add Custom Domain to Vercel

```powershell
# Add domain
vercel domains add yourdomain.com

# View domains
vercel domains ls

# Remove domain
vercel domains rm yourdomain.com
```

### Configure DNS

Add these records to your domain registrar:

**For root domain (yourdomain.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

---

## 📈 Part 12: Monitoring & Logs

### View Vercel Logs

```powershell
# Stream production logs
vercel logs --follow

# View specific deployment logs
vercel logs [deployment-url]
```

### View Supabase Logs

```powershell
# Database logs
supabase logs db --linked

# API logs
supabase logs api --linked

# Follow logs in real-time
supabase logs db --linked --follow
```

---

## 🐛 Troubleshooting

### Vercel CLI Issues

```powershell
# Clear Vercel cache
vercel --force

# Check Vercel version
vercel --version

# Update Vercel CLI
npm update -g vercel
```

### Supabase CLI Issues

```powershell
# Check link status
supabase status

# Re-link project
supabase link --project-ref axrzqrzlnceaiuiyixif

# Check CLI version
supabase --version

# Update CLI
npm update -g supabase
```

### Common Errors

**Error: "PHP runtime not found"**
- Make sure `vercel-php@0.6.0` is specified in `vercel.json`

**Error: "Environment variables not found"**
```powershell
vercel env pull
vercel --prod
```

**Error: "Database connection failed"**
- Check `.env` file has correct Supabase credentials
- Verify RLS policies allow access

---

## 📚 Quick Reference Commands

### Vercel Commands
```powershell
vercel                    # Deploy to preview
vercel --prod             # Deploy to production
vercel ls                 # List deployments
vercel logs --follow      # View logs
vercel env ls             # List environment variables
vercel domains ls         # List domains
vercel --version          # Check version
```

### Supabase Commands
```powershell
supabase status           # Check project status
supabase db pull          # Pull database schema
supabase db push          # Push migrations
supabase migration new    # Create new migration
supabase logs db          # View database logs
supabase storage list     # List storage buckets
supabase link             # Link to remote project
```

---

## ✅ Post-Deployment Checklist

- [ ] Vercel CLI installed and logged in
- [ ] Supabase CLI installed and logged in
- [ ] Project linked to Supabase remote
- [ ] `vercel.json` configured
- [ ] `.vercelignore` created
- [ ] Environment variables added to Vercel
- [ ] Git repository initialized (optional)
- [ ] GitHub repository created and pushed (optional)
- [ ] First deployment successful
- [ ] Application accessible via Vercel URL
- [ ] Database connections working
- [ ] File uploads working
- [ ] Authentication working
- [ ] Custom domain configured (optional)

---

## 🎉 You're All Set!

Your MC Tutor platform is now deployed with:
- ✅ Vercel hosting (automatic HTTPS, CDN, serverless)
- ✅ Supabase database (PostgreSQL with RLS)
- ✅ Supabase Storage (file uploads)
- ✅ Supabase Auth (JWT authentication)
- ✅ CLI tools for easy management
- ✅ Automatic deployments (if using Git)

**Your Production URL:** `https://mc-tutor.vercel.app` (or your custom domain)

**Supabase Dashboard:** https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif

---

**Need help?** Check:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Vercel CLI: https://vercel.com/docs/cli
- Supabase CLI: https://supabase.com/docs/reference/cli

*Last Updated: December 2, 2025*
