# Database Migration Instructions

## Adding 'pending' Status to Users Table

### Issue
The registration system is failing with this error:
```
new row for relation "users" violates check constraint "users_status_check"
```

This happens because the database only allows these status values:
- `active`
- `inactive` 
- `suspended`

But the code now tries to create users with `status='pending'` for the admin approval workflow.

### Solution

Run the migration script to add 'pending' as a valid status value.

---

## How to Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of `add-pending-status.sql`
5. Paste into the editor
6. Click **Run** button

### Option 2: Using psql Command Line

```bash
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f add-pending-status.sql
```

### Option 3: Using Supabase CLI

```bash
supabase db push
```

---

## Migration Script

The migration does the following:

1. **Drops the old constraint** that only allowed: active, inactive, suspended
2. **Creates a new constraint** that allows: active, inactive, suspended, **pending**
3. **(Optional)** Changes the default status for new users from 'active' to 'pending'

---

## Verification

After running the migration, verify it worked:

### Check 1: Verify the constraint was updated
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'users_status_check';
```

Expected result:
```
CHECK (status::text = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text, 'pending'::text]))
```

### Check 2: Try creating a test user with pending status
```sql
-- This should work now (don't forget to delete after testing)
INSERT INTO users (school_id, email, password, first_name, last_name, role, status, course_code, year_level)
VALUES ('999999', 'test@mabinicolleges.edu.ph', 'test123', 'Test', 'User', 'tutee', 'pending', 'BSCS', 1);

-- Delete the test user
DELETE FROM users WHERE school_id = '999999';
```

### Check 3: Test the registration form
1. Go to the registration page
2. Fill out the form and submit
3. You should see: "Registration submitted successfully! Your account is pending admin approval."
4. Check the database - the new user should have `status='pending'`

---

## Rollback (If Needed)

If something goes wrong, you can rollback to the old constraint:

```sql
-- Remove the new constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Add back the old constraint (without 'pending')
ALTER TABLE users ADD CONSTRAINT users_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended'));

-- Reset default to 'active'
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active';
```

---

## What This Enables

After running the migration, the approval workflow will work:

1. ✅ **Registration**: Users can register with `status='pending'`
2. ✅ **Login Block**: Users with pending status cannot login (error: "Your account is pending admin approval")
3. ✅ **Admin Panel**: Shows "Unverified Users" table with pending accounts
4. ✅ **Approval**: Admin can approve (sets status='active') or reject (deletes account)
5. ✅ **Login Success**: After approval, user can login normally

---

## Notes

- **No data loss**: Existing users are not affected
- **Backward compatible**: All existing status values still work
- **Safe to run**: Can be run multiple times without issues (uses IF EXISTS)
- **No downtime**: Can be applied to a live database

---

## Support

If you encounter any issues:
1. Check the Supabase logs for detailed error messages
2. Verify you have admin privileges on the database
3. Make sure you're connected to the correct database/project
