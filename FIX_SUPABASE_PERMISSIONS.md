# 🔧 FINAL FIX - SUPABASE STORAGE PERMISSIONS

## Problem
```
Error: Supabase upload failed: new row violates row-level security policy
```

This means the buckets exist but **Row Level Security (RLS)** is blocking uploads.

## ⚡ EASIEST SOLUTION - Use Dashboard (NO SQL NEEDED!)

### Method 1: Disable RLS (Simplest - 30 seconds)

1. Go to: https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif/auth/policies
2. Find **"storage"** schema in left sidebar
3. Click on **"objects"** table
4. You'll see "Row Level Security" toggle at the top
5. **Turn OFF** the RLS toggle (disable it)
6. Click "Save"

**Done!** 🎉 Uploads will now work immediately. This allows all operations on storage.

⚠️ Note: This disables RLS completely for storage. Fine for development and small apps.

---

## Method 2: Keep RLS but Add Policies (Via SQL - 2 minutes)

If you want to keep RLS enabled, use SQL Editor with proper permissions:

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif/sql
2. Click **"New query"** button

### Step 2: Copy & Paste This SQL
```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop old policies (if any)
DROP POLICY IF EXISTS "Allow public uploads to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to materials" ON storage.objects;

-- AVATARS bucket - allow everything
CREATE POLICY "Allow public uploads to avatars"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public access to avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Allow public deletes from avatars"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Allow public updates to avatars"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- MATERIALS bucket - allow everything
CREATE POLICY "Allow public uploads to materials"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Allow public access to materials"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'materials');

CREATE POLICY "Allow public deletes from materials"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'materials');

CREATE POLICY "Allow public updates to materials"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'materials')
WITH CHECK (bucket_id = 'materials');
```

**IMPORTANT:** Make sure you're logged in as the project owner. If you get permission errors, use Method 1 (disable RLS) instead.

### Step 3: Run the Query
Click **"Run"** button (or press F5)

You should see:
```
Success. No rows returned
```

If you get error "must be owner of table objects", your account doesn't have permission. **Use Method 1 instead** (disable RLS via dashboard).

---

## Method 3: Manual Policy Creation (Via Dashboard UI)

If SQL doesn't work and you want to keep RLS enabled:

1. Go to: https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif/auth/policies
2. Find **"storage"** > **"objects"** table in left sidebar
3. Click **"New Policy"** button
4. Choose **"Create a policy from scratch"**
5. Configure for AVATARS bucket:
   - **Policy name:** `Allow all operations on avatars`
   - **Allowed operation:** SELECT `All` (or create 4 separate policies for INSERT, SELECT, UPDATE, DELETE)
   - **Target roles:** `public`
   - **USING expression:** `bucket_id = 'avatars'`
   - **WITH CHECK expression:** `bucket_id = 'avatars'`
6. Click **"Review"** then **"Save policy"**
7. Repeat step 3-6 for MATERIALS bucket:
   - Change policy name to `Allow all operations on materials`
   - Change expressions to `bucket_id = 'materials'`

---

## ⚡ RECOMMENDED: Just Disable RLS (Method 1)

For most cases, **Method 1** (disable RLS) is the simplest and works perfectly fine for a tutoring platform where users upload their own content.

---

## Test Upload (After Any Method)

---

## Test Upload (After Any Method)

**Via Web Interface:**
1. Go to: https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif/storage/files/buckets/materials
2. Click **"Upload files"**
3. Select any file
4. Should upload successfully ✅

**Via Your App:**
1. Start server: `npm run dev` (in server folder)
2. Login to app
3. Upload profile picture OR study material
4. Check server console - should see:
   ```
   ☁️ [SUPABASE] Uploading to cloud...
   ✅ uploaded to Supabase: https://axrzqrzlnceaiuiyixif.supabase.co/...
   ```
5. Refresh Supabase dashboard - file should appear! 🎉

---

## Summary

**Quickest Fix:** Disable RLS (Method 1) - 30 seconds
**Most Secure:** Add policies (Method 2 or 3) - 2-5 minutes

Either way works! Choose what's easiest for you. 🚀
