# 🔐 MC Tutor Security Guide

## Overview
This document explains the security measures implemented in MC Tutor and how to maintain them.

## Security Features

### 1. Authentication & Authorization

#### JWT (JSON Web Tokens)
- **Purpose**: Secure session management
- **Algorithm**: HS256
- **Expiration**: 7 days (configurable)
- **Storage**: HTTP-only cookies (not accessible via JavaScript)

**Implementation:**
```typescript
// Token generation
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

// Token verification
const decoded = jwt.verify(token, JWT_SECRET);
```

**Best Practices:**
- ✅ Use strong JWT_SECRET (min 32 characters)
- ✅ Rotate secrets periodically
- ✅ Never expose JWT_SECRET in client code
- ✅ Set appropriate expiration times

### 2. Password Security

#### Bcrypt Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Purpose**: One-way password hashing

**Implementation:**
```typescript
// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

**Requirements:**
- Minimum 6 characters
- Cannot be empty
- Stored as hash, never plain text

### 3. Message Encryption

#### AES-256-GCM
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits
- **Purpose**: End-to-end chat encryption
- **Features**: Authentication + Encryption

**How it works:**
1. Messages encrypted before storage
2. Decrypted only when displayed
3. Each message has unique IV (Initialization Vector)
4. Authentication tag prevents tampering

**Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Rate Limiting

Prevents abuse and DDoS attacks:

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| General API | 100 requests | 15 min | Prevent API abuse |
| Login | 5 attempts | 15 min | Prevent brute force |
| File Upload | 10 uploads | 1 hour | Prevent storage abuse |
| Chat | 30 messages | 1 min | Prevent spam |

**Implementation:**
```typescript
import { authLimiter } from './middleware/rateLimiter';
app.use('/api/auth/login', authLimiter);
```

### 5. Input Validation & Sanitization

#### XSS Prevention
Removes dangerous characters:
```typescript
// Before
const input = "<script>alert('XSS')</script>";

// After sanitization
const clean = "scriptalert('XSS')/script";
```

#### SQL Injection Prevention
- Using Supabase (built-in protection)
- Parameterized queries
- No raw SQL from user input

#### Validation Rules:
- **Email**: Valid email format
- **Phone**: Philippine format (09XXXXXXXXX)
- **Student ID**: 5-50 characters
- **Password**: Minimum 6 characters
- **File Size**: Max 2MB (profiles), 10MB (materials)
- **File Types**: Whitelisted extensions only

### 6. CORS (Cross-Origin Resource Sharing)

Restricts which domains can access the API:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://mc-tutor.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

**Configuration:**
- Set `ALLOWED_ORIGINS` in `.env`
- Separate multiple origins with commas
- Use `*` only in development (never production!)

### 7. Helmet.js Security Headers

Automatically sets security headers:

```typescript
app.use(helmet());
```

**Headers Set:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)

### 8. File Upload Security

#### Restrictions:
- **Profile Pictures**:
  - Max size: 2MB
  - Allowed types: JPEG, PNG, GIF
  - Stored in Supabase (public bucket)

- **Study Materials**:
  - Max size: 10MB
  - Allowed types: PDF, DOCX, PPTX, TXT
  - Stored in Supabase (private bucket)

#### Validation:
```typescript
if (!isValidFileSize(file.size, 2)) {
  throw new Error('File too large');
}

if (!isValidFileType(file.mimetype, ['image/jpeg', 'image/png'])) {
  throw new Error('Invalid file type');
}
```

### 9. Environment Variables

**Never commit these to Git:**
```env
# Security Keys
JWT_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=base64-encoded-32-bytes

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key

# Configuration
NODE_ENV=production
PORT=3000
```

**Best Practices:**
- ✅ Use `.gitignore` to exclude `.env`
- ✅ Use different keys for dev/prod
- ✅ Rotate keys periodically
- ✅ Never hardcode secrets in code

### 10. Role-Based Access Control (RBAC)

**Roles:**
- `admin`: Full system access
- `tutor`: Can upload materials, view sessions, receive feedback
- `tutee`: Can book sessions, send messages, submit feedback

**Middleware:**
```typescript
// Protect route
router.post('/upload', authMiddleware, roleMiddleware(['tutor']), uploadMaterial);
```

**Access Matrix:**

| Feature | Admin | Tutor | Tutee |
|---------|-------|-------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| Book Session | ❌ | ❌ | ✅ |
| Confirm Session | ❌ | ✅ | ❌ |
| Upload Materials | ✅ | ✅ | ❌ |
| Submit Feedback | ❌ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |

## Security Checklist for Production

### Before Deployment:

- [ ] Change all default secrets in `.env`
- [ ] Generate new JWT_SECRET (min 32 chars)
- [ ] Generate new ENCRYPTION_KEY
- [ ] Set `NODE_ENV=production`
- [ ] Configure HTTPS/SSL certificate
- [ ] Set proper CORS origins (no wildcards)
- [ ] Enable rate limiting on all routes
- [ ] Review and tighten CSP headers
- [ ] Setup database backups
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Configure proper file permissions
- [ ] Setup monitoring and logging
- [ ] Test all authentication flows
- [ ] Verify file upload restrictions work
- [ ] Check rate limits are enforced
- [ ] Test password reset flow

### Regular Maintenance:

- [ ] Rotate JWT_SECRET monthly
- [ ] Review access logs weekly
- [ ] Update dependencies monthly (`npm audit`)
- [ ] Monitor rate limit violations
- [ ] Check for suspicious activity
- [ ] Backup database weekly
- [ ] Test disaster recovery
- [ ] Review user permissions
- [ ] Update SSL certificates

## Common Security Vulnerabilities & Mitigations

### 1. SQL Injection
**Risk**: Attacker injects malicious SQL
**Mitigation**: 
- ✅ Using Supabase (built-in protection)
- ✅ No raw SQL from user input
- ✅ Parameterized queries only

### 2. XSS (Cross-Site Scripting)
**Risk**: Attacker injects malicious scripts
**Mitigation**:
- ✅ Input sanitization (`sanitizeInput()`)
- ✅ CSP headers via Helmet
- ✅ HTML entity encoding

### 3. CSRF (Cross-Site Request Forgery)
**Risk**: Unauthorized commands from trusted user
**Mitigation**:
- ✅ SameSite cookies
- ✅ CORS restrictions
- ✅ Token-based authentication

### 4. Brute Force Attacks
**Risk**: Password guessing attacks
**Mitigation**:
- ✅ Rate limiting (5 attempts / 15 min)
- ✅ Account lockout after failed attempts
- ✅ Strong password requirements

### 5. Man-in-the-Middle (MitM)
**Risk**: Traffic interception
**Mitigation**:
- ✅ HTTPS/TLS encryption
- ✅ HSTS headers
- ✅ Secure cookies (httpOnly, secure)

### 6. File Upload Vulnerabilities
**Risk**: Malicious file execution
**Mitigation**:
- ✅ File type whitelisting
- ✅ Size restrictions
- ✅ Virus scanning (recommended)
- ✅ Separate storage (Supabase)

## Incident Response

### If Security Breach Occurs:

1. **Immediate Actions**:
   - Rotate all secrets (JWT_SECRET, ENCRYPTION_KEY)
   - Invalidate all active sessions
   - Lock affected accounts
   - Take server offline if necessary

2. **Investigation**:
   - Review access logs
   - Identify attack vector
   - Assess damage scope
   - Document findings

3. **Recovery**:
   - Patch vulnerability
   - Restore from clean backup
   - Reset all user passwords
   - Re-enable services gradually

4. **Prevention**:
   - Update security measures
   - Conduct security audit
   - Train team on new procedures
   - Monitor for repeat attacks

## Security Contacts

### Report Security Issues:
- Email: security@mc-tutor.com
- Emergency: +63-XXX-XXX-XXXX
- Response Time: 24 hours

### Resources:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Supabase Security](https://supabase.com/docs/guides/auth)

## Conclusion

Security is an ongoing process, not a one-time setup. Regular audits, updates, and monitoring are essential to maintain a secure application. Always assume your system will be attacked and prepare accordingly.

**Remember:** The weakest link in security is often human error. Train your team, follow best practices, and stay vigilant.

---
*Last Updated: December 2025*
*Version: 2.0*
