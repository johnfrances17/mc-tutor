# Database Refactoring Guide: Name Fields & Security

## Overview

This migration refactors the `users` table to use structured name fields (`first_name`, `middle_name`, `last_name`) instead of `full_name`, and implements comprehensive security measures including Row Level Security (RLS), audit logging, and rate limiting.

## What's Changed

### 1. **Name Field Refactoring**
- ✅ **Old**: `full_name` (single VARCHAR field)
- ✅ **New**: `first_name`, `middle_name`, `last_name` (separate fields)
- ✅ **Backward Compatibility**: `full_name_computed` generated column

### 2. **Security Improvements**
- ✅ Row Level Security (RLS) policies on all tables
- ✅ Audit logging for sensitive operations
- ✅ Rate limiting table structure
- ✅ Password history tracking (prevents reuse)
- ✅ Account lockout after failed login attempts
- ✅ Comprehensive data validation constraints

### 3. **Performance Enhancements**
- ✅ Full-text search indexes on names
- ✅ Optimized indexes for RLS policies
- ✅ Helper functions for common queries

## Migration Steps

### Step 1: Backup Your Database

```bash
# For PostgreSQL/Supabase
pg_dump -h <your-host> -U <your-user> -d <your-db> > backup_$(date +%Y%m%d).sql
```

### Step 2: Run the Migration Script

**Option A: Via Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project: `axrzqrzlnceaiuiyixif`
3. Navigate to **SQL Editor**
4. Copy contents of `server/migrations/001_refactor_names_and_security.sql`
5. Click **Run** to execute

**Option B: Via Command Line**
```bash
cd server/migrations
psql -h db.axrzqrzlnceaiuiyixif.supabase.co -U postgres -d postgres -f 001_refactor_names_and_security.sql
```

### Step 3: Verify Migration

Run these queries to verify successful migration:

```sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('first_name', 'middle_name', 'last_name');

-- Check data was migrated
SELECT 
  school_id,
  first_name,
  middle_name,
  last_name,
  CASE 
    WHEN middle_name IS NOT NULL AND middle_name != '' THEN 
      CONCAT(first_name, ' ', middle_name, ' ', last_name)
    ELSE 
      CONCAT(first_name, ' ', last_name)
  END as computed_full_name
FROM users 
LIMIT 10;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'sessions', 'materials', 'feedback');

-- Check policies exist
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public';
```

### Step 4: Update Application Code

The following files have been updated automatically:
- ✅ `server/src/types/index.ts` - TypeScript interfaces
- ✅ `server/src/config/database.ts` - Database types
- ✅ `server/src/utils/jwt.ts` - JWT payload
- ✅ `server/src/middleware/authMiddleware.ts` - Auth middleware

**Still need manual updates:**
- ⚠️ `server/src/services/AuthService.ts` - Auth service methods
- ⚠️ `server/src/controllers/adminController.ts` - Admin controller
- ⚠️ `server/src/controllers/authController.ts` - Auth controller
- ⚠️ `server/src/sockets/chatSocket.ts` - Chat socket handlers
- ⚠️ `public/scripts/auth.js` - Frontend auth script
- ⚠️ All HTML forms (register, profile, admin panels)

### Step 5: Update Backend Services

**Pattern to Follow:**

```typescript
// OLD CODE:
const { full_name, email, password } = req.body;
await supabase.from('users').insert({
  full_name,
  email,
  password
});

// NEW CODE:
const { first_name, middle_name, last_name, email, password } = req.body;
await supabase.from('users').insert({
  first_name,
  middle_name: middle_name || null,
  last_name,
  email,
  password
});

// When returning user data, use helper:
import { getFullName } from '../types';
const fullName = getFullName(user); // Handles middle name automatically
```

### Step 6: Update Frontend Code

**Forms that need updates:**

1. **Registration Form** (`public/html/auth/register.html`):
```html
<!-- OLD -->
<input type="text" name="full_name" required>

<!-- NEW -->
<input type="text" name="first_name" placeholder="First Name" required>
<input type="text" name="middle_name" placeholder="Middle Name (Optional)">
<input type="text" name="last_name" placeholder="Last Name" required>
```

2. **Profile Display** (all pages with user info):
```javascript
// OLD
document.querySelector('[data-user-name]').textContent = user.full_name;

// NEW
const fullName = user.middle_name 
  ? `${user.first_name} ${user.middle_name} ${user.last_name}`
  : `${user.first_name} ${user.last_name}`;
document.querySelector('[data-user-name]').textContent = fullName;
```

3. **Admin User Management**:
- Update create user forms
- Update edit user forms
- Update user list displays

### Step 7: Test Authentication Flow

Test these scenarios:

1. **New User Registration**
   - ✅ Form accepts first, middle (optional), last names
   - ✅ Data saves correctly to database
   - ✅ JWT token includes all name fields
   - ✅ User display shows full name correctly

2. **Existing User Login**
   - ✅ Login works with migrated data
   - ✅ Profile displays name correctly
   - ✅ Name fields editable in profile

3. **Admin Operations**
   - ✅ User list shows full names
   - ✅ Search works with new name fields
   - ✅ Create/edit user forms work

4. **Security Tests**
   - ✅ RLS policies prevent unauthorized access
   - ✅ Failed login attempts tracked
   - ✅ Account locks after 5 failed attempts
   - ✅ Audit logs record user actions

### Step 8: Environment Variables

Ensure these are set in `server/.env`:

```env
# Security
JWT_SECRET=mc-tutor-jwt-secret-2025-change-in-production
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=oSH0nFC0TQstyVRHZr45VaIpO9zPH0wVamNdOBZ3g84=

# Supabase with RLS
SUPABASE_URL=https://axrzqrzlnceaiuiyixif.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15 # minutes
```

## API Changes

### Old API Format:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com"
}
```

### New API Format:
```json
{
  "first_name": "John",
  "middle_name": "",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

### Backward Compatible Response:
```json
{
  "first_name": "John",
  "middle_name": null,
  "last_name": "Doe",
  "full_name": "John Doe",  // Computed field
  "email": "john@example.com"
}
```

## Security Features Explained

### 1. Row Level Security (RLS)

**What it does**: Database-level access control. Users can only see/modify their own data (unless admin).

**Example**:
- Student can only see their own sessions
- Tutor can only modify their own materials
- Admin can see everything

### 2. Audit Logging

**What it does**: Records all changes to sensitive tables.

**View logs**:
```sql
SELECT * FROM audit_logs 
WHERE user_id = 123 
ORDER BY created_at DESC 
LIMIT 20;
```

### 3. Rate Limiting

**What it does**: Prevents brute force attacks and API abuse.

**Configuration**:
- Max 5 login attempts per 15 minutes
- Account locks after 5 failed attempts
- Automatic unlock after timeout

### 4. Password Security

**What it does**: Tracks password history to prevent reuse.

**Features**:
- Stores last 5 passwords
- Prevents password reuse
- Tracks last password change date

## Helper Functions

### Get Full Name

```typescript
import { getFullName } from './types';

const user = {
  first_name: 'John',
  middle_name: 'Paul',
  last_name: 'Doe'
};

const fullName = getFullName(user); // "John Paul Doe"
```

### Search by Name

```sql
SELECT * FROM search_users_by_name('John');
```

## Rollback Plan

If something goes wrong:

```sql
-- Restore old full_name column from computed
ALTER TABLE users ADD COLUMN full_name_backup VARCHAR(255);
UPDATE users SET full_name_backup = 
  CASE 
    WHEN middle_name IS NOT NULL THEN 
      CONCAT(first_name, ' ', middle_name, ' ', last_name)
    ELSE 
      CONCAT(first_name, ' ', last_name)
  END;

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Restore from backup
-- psql ... < backup_YYYYMMDD.sql
```

## Performance Considerations

### Indexes Created:
- `idx_users_names` - Faster name lookups
- `idx_users_full_name_search` - Full-text search
- `idx_users_school_id` - Fast authentication
- `idx_users_role_status` - Admin queries
- Plus 10+ more for related tables

### Query Optimization:

**Before**:
```sql
SELECT * FROM users WHERE full_name LIKE '%John%';
```

**After**:
```sql
SELECT * FROM search_users_by_name('John');
-- OR
SELECT * FROM users 
WHERE first_name ILIKE '%John%' 
   OR last_name ILIKE '%John%';
```

## Monitoring

### Check RLS Policy Performance:
```sql
EXPLAIN ANALYZE 
SELECT * FROM users WHERE role = 'tutor';
```

### Check Audit Log Size:
```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('audit_logs')) as size,
  count(*) as log_count
FROM audit_logs;
```

### Check Failed Logins:
```sql
SELECT 
  school_id,
  failed_login_attempts,
  last_failed_login,
  account_locked_until
FROM users 
WHERE failed_login_attempts > 0 
ORDER BY last_failed_login DESC;
```

## Support

If you encounter issues:

1. **Check migration status**:
   ```sql
   SELECT * FROM pg_stat_user_tables WHERE relname = 'users';
   ```

2. **Verify RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

3. **Test with service role**:
   Use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for testing

4. **Review audit logs**:
   ```sql
   SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50;
   ```

## Next Steps

After successful migration:

1. ✅ Update all backend services (Step 5)
2. ✅ Update all frontend forms (Step 6)
3. ✅ Test authentication flows (Step 7)
4. ✅ Monitor performance and logs
5. ✅ Consider removing old `full_name` column after 30 days:
   ```sql
   ALTER TABLE users DROP COLUMN IF EXISTS full_name;
   ```

## Security Best Practices

1. **Never use service role key in frontend**
2. **Always validate input on backend**
3. **Use parameterized queries**
4. **Enable HTTPS only in production**
5. **Rotate JWT secret regularly**
6. **Monitor audit logs daily**
7. **Set up alerts for suspicious activity**

---

**Migration created**: December 7, 2025
**Database**: Supabase PostgreSQL
**Project**: MC Tutor Learning Management System
