# 🚀 Quick Fix for Upload Issues

## ⚡ Immediate Solution

Your uploads are failing because Supabase Storage buckets aren't created yet. **Don't worry - the app automatically falls back to local storage!**

---

## 🎯 Two Options:

### Option 1: Use Local Storage (Quick - Recommended for Testing)

**Already configured!** Just make sure in `.env`:
```env
USE_LOCAL_STORAGE=true
```

✅ Files save to: `c:\xampp\htdocs\uploads\`  
✅ Works immediately  
✅ No setup needed  

---

### Option 2: Setup Supabase Storage (For Production)

**5-Minute Setup:**

1. **Go to:** https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif/storage/buckets

2. **Create 2 buckets:**
   - Name: `materials` → ✅ Check "Public bucket"
   - Name: `avatars` → ✅ Check "Public bucket"

3. **Restart server:**
   ```bash
   npm start
   ```

4. **Done!** Uploads now go to cloud ☁️

---

## 🔍 Current Error: "Subject not found"

This is because the subject ID (81) doesn't exist in your database or the query is failing.

**To fix:**

1. **Check if subject exists:**
   - Login as tutor
   - Go to "My Subjects" page
   - Make sure the subject you're uploading for is added

2. **If subject is missing:**
   - Add it via "Add New Subject" form
   - Select subject from dropdown
   - Add proficiency and location
   - Then try uploading again

---

## 🛠️ Debug Steps

**Run these queries in Supabase SQL Editor:**

```sql
-- Check if subjects table has data
SELECT * FROM subjects LIMIT 10;

-- Check subject ID 81 specifically
SELECT * FROM subjects WHERE subject_id = 81;

-- Check tutor's subjects
SELECT * FROM tutor_subjects WHERE tutor_id = YOUR_USER_ID;
```

---

## 📋 Server Logs Will Show:

```
📤 Upload request: { tutorStudentId: '2024-001', subject_id: '81', title: 'intro', hasFile: true }
🔍 Looking up subject: 81
✅ Subject found: CC001 - Introduction to Computing
☁️ [SUPABASE] Uploading study material to cloud...
✅ Study material uploaded to Supabase
```

**OR if buckets not created:**

```
❌ Supabase upload error: Bucket not found
💡 Tip: Create "materials" bucket in Supabase Dashboard
🔄 Falling back to local storage...
✅ Study material saved locally
```

---

## 🎉 Quick Test

1. **As Tutor:**
   - Go to "My Subjects"
   - Add subject: "CC001 - Introduction to Computing"
   - Set proficiency: Intermediate
   - Set location: Online

2. **Then go to Materials:**
   - Select the subject you just added
   - Fill in title and description
   - Upload a file
   - Should work! ✅

---

## 📞 Still Having Issues?

Check server console for these helpful messages:
- ✅ Subject found
- ✅ File uploaded successfully  
- ❌ Subject not found (means subject doesn't exist in DB)
- ❌ Bucket not found (means need to create Supabase buckets)

**Everything is logged clearly!** 🎯
