# Supabase Storage Setup Guide

This guide explains how to set up and configure Supabase Storage buckets for the MC Tutor application.

## Storage Buckets

The application uses two storage buckets:

### 1. profile-pictures (Public Bucket)
- **Purpose**: Store user profile pictures
- **Access**: Public (anyone can view)
- **Max File Size**: 2MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Path Structure**: `profiles/{userId}_{timestamp}.{ext}`

### 2. study-materials (Private Bucket)
- **Purpose**: Store study materials uploaded by tutors
- **Access**: Private (requires authentication)
- **Max File Size**: 10MB
- **Allowed Types**: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR
- **Path Structure**: `materials/{tutorId}/{subjectId}/{filename}`

---

## Setup Instructions

### Option 1: Automatic Setup (Recommended)

Run the bucket creation script on first server start:

```typescript
import { StorageService } from './services/StorageService';

// In server.ts or a setup script
const storageService = StorageService.getInstance();
await storageService.createBuckets();
```

### Option 2: Manual Setup via Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `axrzqrzlnceaiuiyixif`
   - Click on "Storage" in the left sidebar

2. **Create profile-pictures Bucket**
   - Click "New bucket"
   - Name: `profile-pictures`
   - Public bucket: ✅ Yes
   - File size limit: `2097152` (2MB)
   - Allowed MIME types:
     ```
     image/jpeg
     image/png
     image/gif
     image/webp
     ```
   - Click "Create bucket"

3. **Create study-materials Bucket**
   - Click "New bucket"
   - Name: `study-materials`
   - Public bucket: ❌ No
   - File size limit: `10485760` (10MB)
   - Allowed MIME types:
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-powerpoint
     application/vnd.openxmlformats-officedocument.presentationml.presentation
     text/plain
     application/zip
     application/x-rar-compressed
     ```
   - Click "Create bucket"

4. **Set Bucket Policies**

   For **profile-pictures** (public access):
   ```sql
   -- Allow anyone to view profile pictures
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'profile-pictures' );

   -- Allow authenticated users to upload their own profile picture
   CREATE POLICY "Users can upload own profile picture"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'profile-pictures' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Allow users to update their own profile picture
   CREATE POLICY "Users can update own profile picture"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'profile-pictures'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Allow users to delete their own profile picture
   CREATE POLICY "Users can delete own profile picture"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'profile-pictures'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   For **study-materials** (authenticated access):
   ```sql
   -- Allow authenticated users to view materials
   CREATE POLICY "Authenticated users can view materials"
   ON storage.objects FOR SELECT
   TO authenticated
   USING ( bucket_id = 'study-materials' );

   -- Allow tutors to upload materials
   CREATE POLICY "Tutors can upload materials"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK ( bucket_id = 'study-materials' );

   -- Allow tutors to update their own materials
   CREATE POLICY "Tutors can update own materials"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING ( bucket_id = 'study-materials' );

   -- Allow tutors to delete their own materials
   CREATE POLICY "Tutors can delete own materials"
   ON storage.objects FOR DELETE
   TO authenticated
   USING ( bucket_id = 'study-materials' );
   ```

---

## Environment Variables

Ensure these are set in your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://axrzqrzlnceaiuiyixif.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## API Usage

### Upload Profile Picture

```typescript
POST /api/users/profile/picture
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- profile_picture: File (max 2MB, image only)
```

### Upload Study Material

```typescript
POST /api/materials/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File (max 10MB)
- subject_id: number
- title: string
- description: string (optional)
```

### Download Study Material

```typescript
GET /api/materials/:id/download
Authorization: Bearer {token}

Response:
- Signed URL with 1 hour expiry
- Or direct file download
```

---

## Fallback Mechanism

The `StorageService` includes automatic fallback to local filesystem if Supabase Storage is unavailable:

1. **Try Supabase Storage first** (preferred)
2. **Fallback to local uploads/** directory if Supabase fails
3. **Log errors** for monitoring

This ensures the application continues working even if:
- Supabase is temporarily down
- Bucket quotas are exceeded
- Network issues occur

---

## Storage Limits

### Supabase Free Tier:
- **Storage**: 1GB total
- **Bandwidth**: 2GB/month
- **File uploads**: Unlimited

### Upgrade Options:
If you exceed these limits:
1. Upgrade to Supabase Pro ($25/month)
   - 100GB storage
   - 200GB bandwidth
2. Or continue using local filesystem fallback

---

## Monitoring

Check storage usage in Supabase Dashboard:
1. Go to "Storage" section
2. Click on each bucket
3. View "Usage" tab for:
   - Total storage used
   - Number of files
   - Bandwidth consumed

---

## Migration from Local Storage

If you have existing files in `uploads/` directory:

1. **Profile Pictures**: `uploads/profiles/`
   ```bash
   # Upload to Supabase using CLI or dashboard
   ```

2. **Study Materials**: `uploads/study_materials/`
   ```bash
   # Migrate to Supabase Storage
   ```

3. **Update database URLs** to point to new Supabase URLs

---

## Troubleshooting

### Bucket doesn't exist error
- Run `createBuckets()` function
- Or create manually in dashboard

### Upload fails with 413 error
- File exceeds size limit (2MB for images, 10MB for materials)
- Compress file or reject upload

### Cannot download file
- Check if signed URL has expired
- Regenerate signed URL
- Verify bucket policies

### CORS errors
- Configure CORS in Supabase dashboard
- Add your frontend domain to allowed origins

---

## Security Best Practices

1. **Never expose Service Role Key** in frontend
2. **Use signed URLs** for private files
3. **Validate file types** before upload
4. **Scan for malware** (implement virus scanning if needed)
5. **Set short expiry** for signed URLs (1 hour recommended)
6. **Implement rate limiting** on upload endpoints
7. **Monitor storage usage** regularly

---

## Production Checklist

- [ ] Buckets created in Supabase
- [ ] Bucket policies configured
- [ ] Environment variables set
- [ ] File size limits configured
- [ ] MIME type restrictions set
- [ ] CORS configured
- [ ] Fallback to local storage tested
- [ ] Upload endpoints tested
- [ ] Download endpoints tested
- [ ] Delete functionality tested
- [ ] Monitoring alerts configured

---

**Last Updated**: December 3, 2025  
**Supabase Project**: axrzqrzlnceaiuiyixif.supabase.co
