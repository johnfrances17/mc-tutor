# Quick Migration Guide

## What This Does
✅ Fetches your **actual Supabase database schema**  
✅ Creates migration based on **what you currently have**  
✅ Splits `full_name` into `first_name`, `middle_name`, `last_name`  
✅ Adds **Row Level Security (RLS)** for better protection  
✅ Keeps `full_name` working for backward compatibility

## How to Apply (Super Easy!)

### Option 1: Via Supabase Dashboard (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select project: `axrzqrzlnceaiuiyixif`

2. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open: `server/migrations/001_refactor_names_and_security_v2.sql`
   - Select all (Ctrl+A) and copy (Ctrl+C)

4. **Paste and Run**
   - Paste in SQL Editor
   - Click **"Run"** button
   - Wait for "Success" message

5. **Verify**
   ```sql
   -- Check new columns exist
   SELECT user_id, first_name, middle_name, last_name 
   FROM users LIMIT 5;
   
   -- Check RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'users';
   ```

### Option 2: Via Script (if RPC enabled)

```bash
cd server/scripts
node apply-migration.js
```

## What Gets Changed

### Before Migration:
```
users table:
- full_name: "Kimel Jan S. Mojico"
```

### After Migration:
```
users table:
- first_name: "Kimel"
- middle_name: "Jan S."
- last_name: "Mojico"
- full_name: still works! (computed from new fields)
```

## Example Migrated Data

```
Original: "Kimel Jan S. Mojico"
  ↓
first_name:  "Kimel"
middle_name: "Jan S."
last_name:   "Mojico"
```

## Safety Features

✅ **Transaction-based**: If anything fails, nothing changes  
✅ **Data preserved**: Original `full_name` kept as backup  
✅ **Backward compatible**: Old queries still work  
✅ **Rollback ready**: Can revert if needed

## After Migration

### Test These Queries

```sql
-- 1. Check names migrated correctly
SELECT 
  user_id,
  first_name,
  middle_name,
  last_name,
  full_name  -- This still works!
FROM users 
LIMIT 10;

-- 2. Search by name (new function)
SELECT * FROM search_users_by_name('Kimel');

-- 3. Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'users';
```

### Update Backend Code

Files to update (we'll do this together):
- `server/src/services/AuthService.ts`
- `server/src/controllers/authController.ts`
- `server/src/controllers/adminController.ts`

### Update Frontend Forms

Register form needs:
```html
<input name="first_name" placeholder="First Name" required>
<input name="middle_name" placeholder="Middle Name (Optional)">
<input name="last_name" placeholder="Last Name" required>
```

## If Something Goes Wrong

### Rollback Query:
```sql
BEGIN;
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS middle_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
COMMIT;
```

## Security Benefits

After migration you get:
- 🔒 **RLS** - Users can only see their own data
- 📝 **Audit logs** - Track all changes
- 🚫 **Account lockout** - After 5 failed logins
- 🔐 **Better access control** - Proper permissions

## Questions?

Run this to see current schema:
```bash
cd server/scripts
node fetch-schema.js
```

---

**Ready?** Just copy the SQL file into Supabase Dashboard → SQL Editor → Run!
