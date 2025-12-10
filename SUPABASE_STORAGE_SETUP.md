# Supabase Storage Setup Guide

## 🎯 Quick Setup (5 minutes)

Your Supabase is configured but storage buckets are not yet created. Follow these simple steps:

---

## 📦 Storage Configuration

**Your Supabase Storage Endpoint:**
```
https://axrzqrzlnceaiuiyixif.storage.supabase.co/storage/v1/s3
Region: ap-southeast-1
```

---

## 🪣 Create Storage Buckets

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project: `axrzqrzlnceaiuiyixif`
3. Navigate to: **Storage** (left sidebar)

### Step 2: Create "materials" Bucket

1. Click **"New bucket"** button
2. Enter bucket name: `materials`
3. ✅ Check **"Public bucket"** (important!)
4. Click **"Create bucket"**

**Settings:**
- Name: `materials`
- Public: ✅ YES
- File size limit: 10 MB (default is fine)
- Allowed MIME types: Leave empty (allows all)

### Step 3: Create "avatars" Bucket

1. Click **"New bucket"** button again
2. Enter bucket name: `avatars`
3. ✅ Check **"Public bucket"** (important!)
4. Click **"Create bucket"**

**Settings:**
- Name: `avatars`
- Public: ✅ YES
- File size limit: 5 MB (default is fine)
- Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

---

## ✅ Verify Setup

After creating both buckets, you should see:

```
📦 Storage Buckets
├── 🪣 materials (Public)
└── 🪣 avatars (Public)
```

---

## 🧪 Test Upload

1. **Restart your server:**
   ```bash
   cd c:\xampp\htdocs\mc-tutor\server
   npm start
   ```

2. **Try uploading:**
   - As Tutor: Go to Materials page → Upload a file
   - Server will now upload to Supabase Storage ✅

3. **Check logs:**
   ```
   ☁️ [SUPABASE] Uploading study material to cloud...
   ✅ Study material uploaded to Supabase: https://...
   ```

---

## 🔄 Switch Between Local and Cloud Storage

### For Local Development (XAMPP):

**File:** `server/.env`
```env
# Use local filesystem (faster for testing)
USE_LOCAL_STORAGE=true
```

**Result:**
- Files saved to: `c:\xampp\htdocs\uploads\`
- No internet needed
- Fast uploads

### For Production (Vercel):

**File:** `server/.env`
```env
# Use Supabase Cloud Storage
USE_LOCAL_STORAGE=false
```

**Result:**
- Files saved to: Supabase Storage buckets
- Accessible from anywhere
- CDN-backed (fast downloads)
- Permanent storage

---

## 🛠️ Troubleshooting

### Error: "Bucket not found"

**Problem:** Bucket hasn't been created yet

**Solution:**
1. Go to Supabase Dashboard > Storage
2. Create the bucket (see steps above)
3. Make sure "Public" is checked
4. Restart server

**Note:** Server automatically falls back to local storage if bucket not found!

---

### Error: "Subject not found"

**Problem:** Trying to upload for a subject that doesn't exist

**Solution:**
1. Go to "My Subjects" page as tutor
2. Add the subject first
3. Then try uploading materials

---

### Files Not Showing in Browser

**Problem:** Bucket might be private

**Solution:**
1. Go to Supabase Dashboard > Storage
2. Click on bucket name
3. Go to **Configuration** tab
4. Ensure **"Public bucket"** is enabled
5. Save changes

---

## 📊 Storage URLs

### Materials Bucket:
```
Public URL format:
https://axrzqrzlnceaiuiyixif.supabase.co/storage/v1/object/public/materials/{tutorId}/{subjectId}/{filename}

Example:
https://axrzqrzlnceaiuiyixif.supabase.co/storage/v1/object/public/materials/2024-001/81/1733856234567_abc123_chapter1.pdf
```

### Avatars Bucket:
```
Public URL format:
https://axrzqrzlnceaiuiyixif.supabase.co/storage/v1/object/public/avatars/profiles/{userId}_{timestamp}.jpg

Example:
https://axrzqrzlnceaiuiyixif.supabase.co/storage/v1/object/public/avatars/profiles/123_1733856234567.jpg
```

---

## 🎨 Bucket Policies (Optional - Advanced)

By default, public buckets allow:
- ✅ Anyone can READ (download)
- ✅ Authenticated users can UPLOAD
- ✅ Owners can DELETE

To customize:
1. Go to Storage > Bucket > Policies
2. Add custom Row Level Security (RLS) policies

**Example: Only tutors can upload materials**
```sql
CREATE POLICY "Tutors can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materials' AND
  auth.jwt() ->> 'role' = 'tutor'
);
```

---

## 📈 Monitor Usage

**View storage usage:**
1. Supabase Dashboard > Settings > Usage
2. See: Storage size, bandwidth, API calls

**Free tier limits:**
- 1 GB storage
- 2 GB bandwidth/month
- 50 MB max file size

---

## 🚀 Production Checklist

Before deploying to Vercel:

- [ ] ✅ Both buckets created (materials, avatars)
- [ ] ✅ Both buckets set to PUBLIC
- [ ] ✅ Test upload works
- [ ] ✅ Test download works
- [ ] ✅ Set `USE_LOCAL_STORAGE=false` in production .env
- [ ] ✅ Add Supabase credentials to Vercel env vars

---

## 💡 Tips

1. **Local Development:** Keep `USE_LOCAL_STORAGE=true` for faster testing
2. **Production:** Set `USE_LOCAL_STORAGE=false` to use Supabase
3. **Automatic Fallback:** If Supabase fails, system automatically uses local storage
4. **No Data Loss:** Server logs show which storage is being used

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif
- **Storage Settings:** https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif/storage/buckets
- **Storage Docs:** https://supabase.com/docs/guides/storage
- **API Reference:** https://supabase.com/docs/reference/javascript/storage-from-upload

---

## ❓ Need Help?

Server logs will show helpful messages:

```
☁️ [SUPABASE] Uploading study material to cloud...
❌ Supabase upload error: Bucket not found
💡 Tip: Create "materials" bucket in Supabase Dashboard
🔄 Falling back to local storage...
📁 [LOCAL] Uploading study material to filesystem...
✅ Study material saved locally
```

**Everything will still work even without Supabase buckets!** 🎉
