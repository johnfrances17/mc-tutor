# Supabase Storage Setup Guide

## 📦 Storage Buckets Required

The MC Tutor platform uses **Supabase Storage** to store uploaded files. You need to create these buckets:

### 1. **materials** bucket (Study Materials)
- **Name**: `materials`
- **Public**: ✅ Yes (students need to download materials)
- **File size limit**: 10MB
- **Allowed MIME types**: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR

### 2. **avatars** bucket (Profile Pictures)
- **Name**: `avatars`
- **Public**: ✅ Yes (profile pictures are displayed publicly)
- **File size limit**: 5MB
- **Allowed MIME types**: JPG, JPEG, PNG, GIF, WEBP

---

## 🚀 How to Create Buckets in Supabase

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **mc-tutor**
3. Click on **Storage** in the left sidebar

### Step 2: Create "materials" Bucket
1. Click **New Bucket** button
2. Fill in the form:
   - **Name**: `materials`
   - **Public bucket**: ✅ **Checked** (Important!)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: Leave empty for now (we validate on backend)
3. Click **Create bucket**

### Step 3: Create "avatars" Bucket
1. Click **New Bucket** button again
2. Fill in the form:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Checked** (Important!)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: Leave empty
3. Click **Create bucket**

### Step 4: Set Bucket Policies (Optional but Recommended)

For **materials** bucket:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materials');

-- Allow everyone to view/download materials (public bucket)
CREATE POLICY "Materials are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'materials');

-- Allow tutors to delete their own materials
CREATE POLICY "Tutors can delete their materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'materials' AND (storage.foldername(name))[1] = auth.uid()::text);
```

For **avatars** bucket:
```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update their avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## ✅ Verification

After creating the buckets, verify they exist:

1. In Supabase Dashboard > Storage
2. You should see:
   - ✅ **materials** (Public)
   - ✅ **avatars** (Public)

---

## 🔧 Local Development vs Production

### Local Development (XAMPP)
- Set `USE_LOCAL_STORAGE=true` in `.env`
- Files stored in: `c:\xampp\htdocs\mc-tutor\uploads\`
- No Supabase Storage needed for local testing

### Production (Vercel)
- Set `USE_LOCAL_STORAGE=false` (or remove from .env)
- Files stored in: Supabase Storage buckets
- Requires buckets to be created (see steps above)

---

## 📁 File Structure in Buckets

### materials bucket:
```
materials/
├── 200458/              # tutor school_id
│   ├── 81/             # subject_id
│   │   ├── 1733876232_abc123_Chapter1.pdf
│   │   └── 1733876345_def456_Midterm-Review.docx
│   └── 82/
│       └── ...
└── 230718/
    └── ...
```

### avatars bucket:
```
avatars/
├── profiles/
│   ├── 200458_1733876232.jpg
│   ├── 230718_1733876345.png
│   └── ...
```

---

## 🐛 Troubleshooting

### Error: "Bucket does not exist"
- **Solution**: Create the bucket in Supabase Dashboard (see steps above)

### Error: "Access denied" or "Unauthorized"
- **Solution**: Make sure the bucket is set to **Public**
- Check bucket policies (see Step 4)

### Error: "File too large"
- **Solution**: Check file size limits (10MB for materials, 5MB for avatars)

### Files upload but can't be accessed
- **Solution**: Verify bucket is marked as **Public**
- Check the public URL format: `https://[project].supabase.co/storage/v1/object/public/materials/...`

---

## 📝 Notes

- **Public buckets** allow anyone with the URL to access files
- Files are automatically served via Supabase CDN (fast global access)
- Use RLS policies for fine-grained access control
- Consider adding virus scanning for uploaded files in production

---

## 🔗 Useful Links

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
