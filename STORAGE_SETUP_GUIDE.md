# 🚀 Supabase Storage Setup - Quick Guide

## What Was Fixed

1. ✅ **Fixed file upload path errors** (`/var/uploads` → proper paths)
2. ✅ **Connected to Supabase Storage** (materials bucket)
3. ✅ **Updated database to store material metadata**
4. ✅ **Fixed frontend to display uploaded materials**

---

## 🔧 Required Setup (ONE TIME ONLY)

### Step 1: Create Supabase Storage Buckets

Go to: https://supabase.com/dashboard → Select your project → Storage

#### Create "materials" bucket:
1. Click **"New Bucket"**
2. **Bucket name**: `materials`
3. **Public bucket**: ✅ **CHECK THIS BOX** (Important!)
4. Click **"Create"**

#### Create "avatars" bucket (for profile pictures):
1. Click **"New Bucket"** again
2. **Bucket name**: `avatars`
3. **Public bucket**: ✅ **CHECK THIS BOX**
4. Click **"Create"**

### Step 2: Run Database Migration

Go to: https://supabase.com/dashboard → SQL Editor → New Query

Copy and paste this SQL:

```sql
-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    material_id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    category VARCHAR(50) CHECK (category IN ('lecture', 'assignment', 'quiz', 'reference', 'other')),
    tags TEXT[],
    download_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_materials_tutor ON materials(tutor_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_uploaded ON materials(uploaded_at DESC);
```

Click **"Run"**

---

## ✅ Testing

### Test File Upload:

1. **Login as Tutor**:
   - Go to: http://localhost/mc-tutor/public/html/auth/login.html
   - Email: (any tutor account)
   - Password: (your password)

2. **Go to Materials Page**:
   - Click **"Materials"** in the navigation

3. **Upload a Test File**:
   - Select a subject from dropdown
   - Enter title: "Test Material"
   - Enter description: "Testing upload"
   - Select a PDF or DOCX file (max 10MB)
   - Click **"Upload Material"**

4. **Check Console** (F12):
   - You should see: ✅ Upload successful
   - File should appear in "My Uploaded Materials" section

---

## 🔍 Verify Upload in Supabase

### Check Storage:
1. Go to: Supabase Dashboard → Storage → materials bucket
2. You should see folders: `{tutor_school_id}/{subject_id}/filename.pdf`

### Check Database:
1. Go to: Supabase Dashboard → Table Editor → materials
2. You should see a new row with:
   - title, description
   - file_url (Supabase public URL)
   - filename

---

## 🐛 Troubleshooting

### Error: "Bucket does not exist"
- **Fix**: Create the `materials` bucket (see Step 1 above)

### Error: "Row not found"
- **Fix**: Run the SQL migration (see Step 2 above)

### Files upload but don't show in list
- **Fix**: Check browser console (F12) for errors
- Make sure you're logged in as a tutor

### Error: "ENOENT: no such file or directory"
- **Fix**: This is now fixed! The code automatically uses Supabase Storage
- For local testing, set `USE_LOCAL_STORAGE=true` in `.env`

---

## 📝 How It Works Now

### Upload Flow:
1. **Frontend**: User selects file → FormData → POST `/api/materials/upload`
2. **Backend**: 
   - Receives file in memory (multer)
   - Uploads to Supabase Storage `materials` bucket
   - Saves metadata to `materials` table
   - Returns success response
3. **Frontend**: Displays uploaded material in list

### Storage Structure:
```
Supabase Storage (materials bucket):
  └── {tutor_school_id}/
      └── {subject_id}/
          └── 1733876232_abc123_filename.pdf

Database (materials table):
  - material_id
  - tutor_id
  - subject_id
  - title, description
  - file_url (public URL)
  - filename
  - file_size, file_type
```

---

## 🎉 Done!

Your file upload system is now fully connected to Supabase Storage!

- ✅ Files stored in cloud (accessible from anywhere)
- ✅ Metadata in database (fast queries)
- ✅ Public URLs for downloads
- ✅ Proper error handling
- ✅ Works on both localhost and Vercel

---

## 📚 Additional Resources

- Full setup guide: `server/migrations/SUPABASE_STORAGE_SETUP.md`
- SQL migration: `server/migrations/add-materials-table.sql`
