# 🔧 TROUBLESHOOTING GUIDE

Solutions to common problems in MC Tutor platform.

---

## 🚀 QUICK FIXES

Try these first for most issues:

1. **Restart the server**
   ```bash
   # Stop: Ctrl+C
   # Start: npm run dev
   ```

2. **Clear browser cache**
   - Chrome: Ctrl+Shift+Delete → Clear cache
   - Or try Incognito/Private mode

3. **Check .env file exists**
   - Location: `server/.env`
   - Should contain: SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET, etc.

4. **Reinstall dependencies**
   ```bash
   cd server
   rm -rf node_modules
   npm install
   ```

---

## 🗄️ DATABASE ERRORS

### ❌ "Cannot connect to database"

**Symptoms:**
- Server crashes on startup
- Error: "Connection refused"

**Solutions:**

**1. Check Supabase credentials**
```bash
# In server/.env, verify:
SUPABASE_URL=https://xxxxx.supabase.co  # Should start with https://
SUPABASE_ANON_KEY=eyJ...                 # Long string starting with eyJ
```

**2. Test connection manually**
- Go to https://supabase.com/dashboard
- Select your project
- Click "SQL Editor"
- Run: `SELECT 1;`
- If error → Supabase project may be paused

**3. Check Supabase project status**
- Free tier projects pause after 1 week of inactivity
- Go to dashboard and click "Restore" if paused

---

### ❌ "Table does not exist"

**Symptoms:**
- Error: `relation "users" does not exist`

**Solution:**

**Re-import database schema:**
1. Go to Supabase SQL Editor
2. Copy content from `supabase_migration_safe.sql`
3. Paste and run
4. Wait for success message

---

### ❌ "Row Level Security policy violation"

**Symptoms:**
- Can't read/write data
- Error: "new row violates row-level security policy"

**Solution:**

**Check if RLS is properly configured:**
```sql
-- In Supabase SQL Editor, run:
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

If no policies shown, RLS may not be set up. Re-run migration SQL.

---

## 🔐 AUTHENTICATION ERRORS

### ❌ "Invalid credentials"

**Symptoms:**
- Can't login
- Error message: "Invalid email or password"

**Solutions:**

**1. Verify email and password**
- Check for typos
- Email is case-insensitive
- Password is case-sensitive

**2. Check user exists in database**
```sql
-- In Supabase SQL Editor:
SELECT email, role, status 
FROM users 
WHERE email = 'your@email.com';
```

**3. Check user status**
- If `status = 'inactive'`, account is disabled
- Admin must reactivate

**4. Reset password (as admin)**
```http
POST /api/admin/users/:id/reset-password
Body: { "new_password": "newpass123" }
```

---

### ❌ "Token expired" / "Unauthorized"

**Symptoms:**
- Logged out automatically
- Error: "Token expired" or "Unauthorized"

**Solutions:**

**1. Login again**
- Tokens expire after 7 days
- Just login normally

**2. Use refresh token (advanced)**
```javascript
// If you have a refresh token:
fetch('/api/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refreshToken: 'your_refresh_token' })
})
```

**3. Check JWT_SECRET hasn't changed**
- If server's JWT_SECRET changed, all tokens become invalid
- All users must login again

---

### ❌ "Forbidden: Insufficient permissions"

**Symptoms:**
- Error: "Forbidden" or "Access denied"

**Cause:**
You're trying to access an endpoint that requires a different role.

**Solutions:**

**1. Check your role**
```http
GET /api/auth/me
```

Response shows your role:
```json
{
  "user": {
    "role": "tutee"  // Your current role
  }
}
```

**2. Verify endpoint requirements**
- Admin endpoints: require `role = 'admin'`
- Tutor endpoints: require `role = 'tutor'`
- Student endpoints: require `role = 'tutee'`

**3. Contact admin to change role (if needed)**

---

## 🌐 FRONTEND ERRORS

### ❌ "Failed to fetch" / "Network error"

**Symptoms:**
- API calls fail
- Console error: "Failed to fetch" or "Network error"

**Solutions:**

**1. Check backend is running**
```bash
# Should see this in terminal:
🚀 Server running on http://localhost:3000
```

**2. Check API URL in browser console**
```javascript
// Open browser DevTools (F12)
// Console tab, run:
console.log(API_BASE_URL);
// Should show: http://localhost:3000/api
```

**3. Verify CORS settings**
Backend should allow frontend origin:
```typescript
// In server.ts:
app.use(cors({
  origin: 'http://localhost:3000',  // Must match frontend URL
  credentials: true
}));
```

**4. Check firewall/antivirus**
- Some antivirus software blocks localhost connections
- Temporarily disable and test

---

### ❌ "CORS policy blocked"

**Symptoms:**
- Error: "blocked by CORS policy"
- API calls fail from browser

**Solution:**

**Update CORS settings in server:**
```typescript
// server/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://your-vercel-app.vercel.app'  // Add production URL
  ],
  credentials: true
}));
```

---

### ❌ Blank page / White screen

**Symptoms:**
- Page loads but shows nothing
- No errors in browser console

**Solutions:**

**1. Check browser console for JavaScript errors**
- Press F12
- Look for red errors

**2. Verify HTML file exists**
```bash
# Check file exists:
ls client/public/index.html
```

**3. Clear browser cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## 📁 FILE UPLOAD ERRORS

### ❌ "File too large"

**Symptoms:**
- Upload fails
- Error: "File exceeds maximum size"

**Limits:**
- Profile pictures: 2 MB
- Study materials: 10 MB

**Solutions:**

**1. Compress file**
- Images: Use TinyPNG.com or similar
- PDFs: Use ilovepdf.com compressor

**2. Increase limit (if needed)**
```typescript
// server/src/middleware/uploadMiddleware.ts
const upload = multer({
  limits: {
    fileSize: 20 * 1024 * 1024  // Change to 20 MB
  }
});
```

---

### ❌ "Invalid file type"

**Symptoms:**
- Upload rejected
- Error: "File type not allowed"

**Allowed types:**

**Profile pictures:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

**Study materials:**
- PDF (.pdf)
- Word (.doc, .docx)
- PowerPoint (.ppt, .pptx)
- ZIP (.zip)

**Solution:**
Convert file to allowed format using online converter.

---

### ❌ Upload succeeds but file not showing

**Symptoms:**
- Upload completes
- File not visible in list

**Solutions:**

**1. Check Supabase Storage**
- Go to Supabase dashboard
- Click "Storage"
- Verify bucket exists and file is there

**2. Check storage policies**
```sql
-- In Supabase SQL Editor:
SELECT * FROM storage.buckets WHERE name = 'profiles';
SELECT * FROM storage.objects WHERE bucket_id = 'profiles';
```

**3. Check file path in database**
```sql
SELECT profile_picture FROM users WHERE user_id = 1;
-- Should show: profiles/uuid.jpg
```

---

## 💬 CHAT ERRORS

### ❌ Messages not sending

**Symptoms:**
- Message appears to send but doesn't show
- No error message

**Solutions:**

**1. Check WebSocket connection**
```javascript
// Browser console (F12):
// Should see:
Socket connected: XXXXX
```

**2. Verify ENCRYPTION_KEY is set**
```bash
# In server/.env:
ENCRYPTION_KEY=your_base64_key_here==
```

**3. Check chat storage directory**
```bash
# Should exist:
ls main/shared/chats/
# Should contain:
metadata.json
```

**4. Test encryption manually**
```bash
cd server
node test_encryption.php  # Tests encryption functions
```

---

### ❌ Can't see old messages

**Symptoms:**
- Chat loads but no message history
- Only new messages appear

**Solutions:**

**1. Check metadata.json exists**
```bash
ls main/shared/chats/metadata.json
```

**2. Verify file permissions**
```bash
# Windows PowerShell:
icacls "main\shared\chats\metadata.json"
# Should show read/write access

# Mac/Linux:
ls -la main/shared/chats/metadata.json
# Should show rw-r--r--
```

**3. Check decryption works**
- If messages are encrypted, ENCRYPTION_KEY must match
- If key changed, old messages can't be decrypted

---

## 🔄 SESSION/BOOKING ERRORS

### ❌ "Session time conflict"

**Symptoms:**
- Can't book session
- Error: "Tutor already has session at this time"

**Cause:**
Tutor already has a confirmed session at that time.

**Solution:**
Choose different time slot or different tutor.

---

### ❌ Can't confirm session (as tutor)

**Symptoms:**
- Confirm button doesn't work
- Error: "Cannot confirm session"

**Solutions:**

**1. Verify you're the session's tutor**
```http
GET /api/sessions
# Check if you're the tutor_id
```

**2. Check session status**
- Only `pending` sessions can be confirmed
- Can't confirm `completed` or `cancelled` sessions

**3. Verify role**
```http
GET /api/auth/me
# role should be "tutor"
```

---

## 🔢 DEVELOPMENT ERRORS

### ❌ "Cannot find module"

**Symptoms:**
- Error: `Cannot find module 'express'` or similar

**Solution:**
```bash
cd server
npm install
```

---

### ❌ "Port 3000 already in use"

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3000`

**Solutions:**

**Option 1: Kill existing process (Windows)**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Option 2: Kill existing process (Mac/Linux)**
```bash
# Find and kill
lsof -ti:3000 | xargs kill -9
```

**Option 3: Use different port**
```bash
# In server/.env:
PORT=3001
```

---

### ❌ TypeScript compilation errors

**Symptoms:**
- Error: `TS2304: Cannot find name 'xxx'`
- Build fails

**Solutions:**

**1. Install type definitions**
```bash
npm install --save-dev @types/node @types/express
```

**2. Check tsconfig.json**
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**3. Restart TypeScript server (VS Code)**
- Press Ctrl+Shift+P
- Type "TypeScript: Restart TS Server"
- Press Enter

---

## 🚀 DEPLOYMENT ERRORS (Vercel)

### ❌ "Build failed"

**Symptoms:**
- Vercel deployment fails
- Error in build logs

**Solutions:**

**1. Test build locally first**
```bash
cd server
npm run build
# Should complete without errors
```

**2. Check vercel.json configuration**
```json
{
  "builds": [
    { "src": "server/package.json", "use": "@vercel/node" }
  ]
}
```

**3. Verify Node version**
```json
// In server/package.json:
"engines": {
  "node": "18.x"
}
```

---

### ❌ "Function timeout"

**Symptoms:**
- API requests fail on Vercel
- Error: "Function execution timeout"

**Cause:**
Free tier has 10-second timeout limit.

**Solutions:**

**1. Optimize slow queries**
```typescript
// Add indexes to frequently queried columns
// In Supabase SQL Editor:
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_tutor ON sessions(tutor_id);
```

**2. Upgrade Vercel plan** (if needed)

---

### ❌ Environment variables not working

**Symptoms:**
- App works locally but not on Vercel
- Error: "Cannot read properties of undefined"

**Solution:**

**Check environment variables in Vercel:**
1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from your `.env` file
5. Redeploy

---

## 📊 DEBUGGING TIPS

### View Server Logs

**Local:**
```bash
# In terminal where server is running
# All console.log() output appears here
```

**Production (Vercel):**
1. Go to Vercel dashboard
2. Select your project
3. Click "Logs" tab
4. Filter by timeframe

---

### Test API Endpoints

**Using curl (Mac/Linux):**
```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","role":"tutee"}'
```

**Using PowerShell (Windows):**
```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3000/api/health"

# Login
$body = @{
  email = "test@example.com"
  password = "pass123"
  role = "tutee"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

### Browser DevTools

**Open DevTools:** Press F12

**Network Tab:**
- See all API requests
- Check request/response data
- Look for failed requests (red)

**Console Tab:**
- See JavaScript errors
- View console.log() output
- Run JavaScript commands

**Application Tab:**
- View localStorage (tokens stored here)
- Clear storage if needed

---

## 🆘 STILL NEED HELP?

### Before asking for help, collect:

1. **Error message** (full text)
2. **What you were doing** when error occurred
3. **Browser console screenshot** (F12 → Console tab)
4. **Server terminal output** (if applicable)

### Where to get help:

- Check [API Reference](03-API-REFERENCE.md) for endpoint details
- Review [Getting Started](01-GETTING-STARTED.md) for setup steps
- Check [Security Guide](04-SECURITY.md) for auth issues
- Create GitHub issue with details above

---

## 📚 COMMON ERROR CODES

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Not logged in / token expired |
| 403 | Forbidden | Wrong role/permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g., email exists) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side bug |

---

**Happy troubleshooting! 🎉**
