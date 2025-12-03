# Vercel Environment Variables Checklist

⚠️ **IMPORTANT**: These environment variables MUST be set in your Vercel Dashboard

## How to Set Environment Variables in Vercel:
1. Go to: https://vercel.com/johnfrances17/mc-tutor
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add each variable below

---

## Required Environment Variables

### Supabase Configuration
```
SUPABASE_URL=https://axrzqrzlnceaiuiyixif.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzUyMTksImV4cCI6MjA4MDI1MTIxOX0.utJg3rVhvn-D1JxUaIZS1szF5Gx7h_o3dc64ne0WhJg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NTIxOSwiZXhwIjoyMDgwMjUxMjE5fQ.lxpHNuYzfJFdJHAsvGj94N56mhL-JQYmuWvImaMvEtE
```

### JWT Configuration
```
JWT_SECRET=mc-tutor-jwt-secret-2025-change-in-production
JWT_EXPIRES_IN=7d
```

### Server Configuration
```
NODE_ENV=production
PORT=3000
```

### CORS Configuration
```
ALLOWED_ORIGINS=https://mc-tutor.vercel.app,https://mc-tutor-vercel.app
```

### Encryption Configuration
```
ENCRYPTION_KEY=oSH0nFC0TQstyVRHZr45VaIpO9zPH0wVamNdOBZ3g84=
```

### File Upload Configuration
```
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp
```

### Email Configuration (Optional - for email notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=ppwg kfea telm sktc
EMAIL_FROM=MC Tutor <noreply@mctutor.com>
```

---

## Verification Steps

After setting environment variables in Vercel:

1. ✅ **Redeploy**: Vercel should auto-deploy after push
2. ✅ **Check Deployment Log**: Look for build success
3. ✅ **Test API Health**: Visit `https://mc-tutor.vercel.app/api/health`
4. ✅ **Test System Status**: Visit `https://mc-tutor.vercel.app/html/system-status.html`

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Double-check SUPABASE_URL and SUPABASE_ANON_KEY are set

### Issue: "JWT_SECRET is not defined"
**Solution**: Add JWT_SECRET environment variable

### Issue: 404 on API routes
**Solution**: Verify vercel.json routes are correct (already fixed in latest commit)

### Issue: Database connection timeout
**Solution**: Check Supabase project is active and URL is correct

---

## Test Endpoints

Once deployed, test these URLs:

1. **Health Check**: `https://mc-tutor.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"...","environment":"production","version":"2.0.0"}`

2. **API Root**: `https://mc-tutor.vercel.app/api`
   - Should return: API information with endpoints list

3. **Subjects**: `https://mc-tutor.vercel.app/api/subjects/courses`
   - Should return: List of available courses

4. **System Status**: `https://mc-tutor.vercel.app/html/system-status.html`
   - Should show: All services online (Vercel ✅, Supabase ✅, Backend API ✅)

---

## Local Testing Verified ✅

Local connection test results:
- ✅ Subjects table: Accessible (5 subjects found)
- ✅ Sessions table: Accessible (0 sessions)
- ⚠️ Users table: RLS policy restricts anonymous access (expected behavior)

**Next Step**: Check Vercel Dashboard → Environment Variables → Ensure all variables above are set
