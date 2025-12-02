# 🚀 Supabase Migration Setup Guide

Complete step-by-step instructions for migrating MC Tutor from XAMPP/MySQL to Supabase.

---

## 📋 Prerequisites

- ✅ Supabase account (free tier is sufficient)
- ✅ Node.js installed (for file migration scripts)
- ✅ Access to current MySQL database
- ✅ Backup of current database and files

---

## 🎯 Phase 1: Create Supabase Project

### Step 1.1: Create New Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **"New Project"**
4. Fill in details:
   - **Name:** `mc-tutor` (or your preferred name)
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to your users (e.g., Southeast Asia)
   - **Pricing Plan:** Free tier is fine for development

5. Wait 2-3 minutes for project creation

### Step 1.2: Save Project Credentials

After project is created, go to **Settings → API**:

```env
SUPABASE_URL=https://axrzqrzlnceaiuiyixif.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzUyMTksImV4cCI6MjA4MDI1MTIxOX0.utJg3rVhvn-D1JxUaIZS1szF5Gx7h_o3dc64ne0WhJg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NTIxOSwiZXhwIjoyMDgwMjUxMjE5fQ.lxpHNuYzfJFdJHAsvGj94N56mhL-JQYmuWvImaMvEtE
SUPABASE_JWT_SECRET=D4GiqVp68e9xPUYj25B/xzRMYJKrLhrztHEXdZCYZ3SJU+kIhwi03xz25tuXUT2Hb7TSkHp0USDRBir7GODM9Q==
```

**⚠️ Important:** 
- `ANON_KEY` - Safe for frontend/client use
- `SERVICE_ROLE_KEY` - NEVER expose to client, backend only
- Save these in a `.env` file (add to `.gitignore`)

---

## 🗄️ Phase 2: Database Migration

### Step 2.1: Run Migration SQL

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire content of `supabase_migration.sql`
4. Paste into the query editor
5. Click **"Run"** (bottom right)

**Expected Result:**
```
✅ Created 9 tables
✅ Created 8 ENUM types
✅ Inserted 62 subjects
✅ Created 30+ RLS policies
✅ Created triggers and functions
```

**⚠️ If you see errors:**
- Check if you copied the entire SQL file
- Look for syntax errors in the error message
- Common issue: Running twice (DROP existing tables first if needed)

### Step 2.2: Verify Database Schema

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - ✅ users
   - ✅ subjects (with 62 rows)
   - ✅ tutor_subjects
   - ✅ tutor_availability
   - ✅ sessions
   - ✅ feedback
   - ✅ notifications
   - ✅ study_materials
   - ✅ chat_messages (optional)

3. Click on `subjects` table → Should see 62 subjects loaded

### Step 2.3: Migrate Existing Data from MySQL

#### Option A: Export/Import via CSV (Recommended)

**Export from MySQL (phpMyAdmin):**

1. Open phpMyAdmin → Select `mc_tutor_db`
2. For each table (users, sessions, feedback, tutor_subjects):
   - Click table name
   - Click **"Export"** tab
   - Format: **CSV**
   - Download CSV file

**Import to Supabase:**

1. In Supabase Dashboard → **Table Editor**
2. Select table (e.g., `users`)
3. Click **"Insert"** → **"Import from CSV"**
4. Upload CSV file
5. Map columns (should auto-match)
6. Click **"Import"**

**⚠️ Important for Users Table:**
- Export users WITHOUT passwords initially
- Create users in Supabase Auth first (see Phase 3)
- Then link by `user_id`

#### Option B: SQL Export/Import (Advanced)

**Export from MySQL:**

```bash
# In PowerShell, navigate to MySQL bin directory
cd C:\xampp\mysql\bin

# Export data only (no schema)
.\mysqldump.exe -u root --no-create-info --complete-insert mc_tutor_db users sessions feedback tutor_subjects study_materials > data_export.sql
```

**Convert MySQL → PostgreSQL:**

Use online converter or manually edit:
- Change `AUTO_INCREMENT` → (remove, use SERIAL)
- Change `` backticks → `"` double quotes
- Change `NOW()` → `CURRENT_TIMESTAMP`
- Change enum values to match new types

**Import to Supabase:**

1. Copy converted SQL
2. Go to **SQL Editor** in Supabase
3. Paste and run

---

## 🔐 Phase 3: Authentication Migration

### Step 3.1: Create Test Admin User in Supabase Auth

1. In Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - **Email:** `admin@mabini.edu`
   - **Password:** Create new password
   - **Auto Confirm User:** ✅ (check this)
4. Click **"Create User"**
5. **Copy the User UUID** (e.g., `a1b2c3d4-e5f6-7890-1234-567890abcdef`)

### Step 3.2: Link Supabase Auth User to Database User

1. Go to **SQL Editor**
2. Run this query (replace UUID with actual UUID from Step 3.1):

```sql
-- Update existing admin user with Supabase Auth UUID
UPDATE users 
SET user_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'::text::integer
WHERE student_id = '000000';

-- OR if you want to keep integer IDs, create a new column:
ALTER TABLE users ADD COLUMN auth_user_id UUID;

UPDATE users 
SET auth_user_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
WHERE student_id = '000000';
```

**⚠️ Important Design Decision:**

**Option A: Use UUID for user_id (Recommended for Supabase)**
- Change `user_id` from `INTEGER` to `UUID`
- Use `auth.uid()` directly in RLS policies
- Cleaner integration with Supabase Auth

**Option B: Keep Integer IDs + Add auth_user_id column**
- Keep existing integer primary keys
- Add new `auth_user_id UUID` column
- Map between them in application code
- Easier migration but more complex

Choose Option A for new projects, Option B for minimal disruption.

### Step 3.3: Bulk Create Users in Supabase Auth

**For existing users, you have 3 options:**

**Option 1: Send Password Reset Emails (Recommended)**
1. Create users in Supabase Auth via Admin API
2. Don't set passwords initially
3. Send password reset email to each user
4. Users set their own passwords

**Option 2: Use Supabase Admin API (Node.js Script)**

Create file `migrate_users.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axrzqrzlnceaiuiyixif.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NTIxOSwiZXhwIjoyMDgwMjUxMjE5fQ.lxpHNuYzfJFdJHAsvGj94N56mhL-JQYmuWvImaMvEtE';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Your existing users from MySQL
const users = [
  {
    email: 'kimelmojico29@gmail.com',
    student_id: '230718',
    full_name: 'Kimel Jan S. Mojico',
    role: 'tutee'
  },
  // ... more users
];

async function migrateUsers() {
  for (const user of users) {
    try {
      // Create auth user (Supabase generates UUID)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: {
          student_id: user.student_id,
          full_name: user.full_name,
          role: user.role
        }
      });

      if (authError) {
        console.error(`Error creating ${user.email}:`, authError);
        continue;
      }

      console.log(`✅ Created ${user.email} with UUID: ${authUser.user.id}`);

      // Update users table with auth UUID
      const { error: dbError } = await supabase
        .from('users')
        .update({ auth_user_id: authUser.user.id })
        .eq('email', user.email);

      if (dbError) {
        console.error(`Error updating DB for ${user.email}:`, dbError);
      }

      // Send password reset email
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: user.email
      });

      if (resetError) {
        console.error(`Error sending reset email to ${user.email}:`, resetError);
      }

    } catch (err) {
      console.error(`Fatal error for ${user.email}:`, err);
    }
  }
}

migrateUsers();
```

Run with:
```bash
npm install @supabase/supabase-js
node migrate_users.js
```

**Option 3: Manual Entry (Small User Base)**
- If you have < 20 users, manually create each in Supabase Dashboard

---

## 📦 Phase 4: Storage Migration

### Step 4.1: Create Storage Buckets

1. In Supabase Dashboard → **Storage**
2. Click **"New Bucket"**

**Create these buckets:**

#### Bucket 1: `profile-pictures`
- **Name:** `profile-pictures`
- **Public:** ✅ Yes (images need public URLs)
- **File size limit:** 2 MB
- **Allowed MIME types:** `image/jpeg, image/png, image/jpg`

#### Bucket 2: `study-materials`
- **Name:** `study-materials`
- **Public:** ❌ No (authenticated access only)
- **File size limit:** 10 MB
- **Allowed MIME types:** 
  ```
  application/pdf
  application/msword
  application/vnd.openxmlformats-officedocument.wordprocessingml.document
  application/vnd.ms-powerpoint
  application/vnd.openxmlformats-officedocument.presentationml.presentation
  application/zip
  text/plain
  ```

#### Bucket 3: `chat-data` (Optional - for file-based chat system)
- **Name:** `chat-data`
- **Public:** ❌ No (private)
- **File size limit:** 5 MB
- **Allowed MIME types:** `application/json`

### Step 4.2: Set Storage Policies

For each bucket, set Row Level Security policies:

**profile-pictures policies:**

```sql
-- Anyone can view profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Users can upload their own profile picture
CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own profile picture
CREATE POLICY "Users can update own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**study-materials policies:**

```sql
-- Anyone authenticated can view study materials
CREATE POLICY "Authenticated users can view materials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'study-materials');

-- Tutors can upload materials
CREATE POLICY "Tutors can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'study-materials');

-- Tutors can delete their own materials
CREATE POLICY "Tutors can delete own materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'study-materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Step 4.3: Upload Existing Files to Supabase Storage

Create Node.js migration script `upload_files.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://axrzqrzlnceaiuiyixif.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NTIxOSwiZXhwIjoyMDgwMjUxMjE5fQ.lxpHNuYzfJFdJHAsvGj94N56mhL-JQYmuWvImaMvEtE';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Upload profile pictures
async function uploadProfilePictures() {
  const profilesDir = './uploads/profiles/';
  const files = fs.readdirSync(profilesDir);

  for (const file of files) {
    if (file === '.htaccess') continue;

    const filePath = path.join(profilesDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    // Extract user_id from filename (e.g., profile_5_1732456789.jpg)
    const match = file.match(/profile_(\d+)_/);
    const userId = match ? match[1] : 'unknown';

    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(`${userId}/${file}`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error(`❌ Error uploading ${file}:`, error);
    } else {
      console.log(`✅ Uploaded ${file} → ${data.path}`);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path);

      // Update database
      await supabase
        .from('users')
        .update({ profile_picture: urlData.publicUrl })
        .eq('user_id', userId);
    }
  }
}

// Upload study materials
async function uploadStudyMaterials() {
  const materialsDir = './uploads/study_materials/';
  const files = fs.readdirSync(materialsDir);

  // Get existing materials from database
  const { data: materials } = await supabase
    .from('study_materials')
    .select('*');

  for (const material of materials) {
    const fileName = material.file_name;
    const filePath = path.join(materialsDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${fileName}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const uploadPath = `${material.tutor_id}/${material.subject_id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('study-materials')
      .upload(uploadPath, fileBuffer, {
        contentType: material.file_type,
        upsert: true
      });

    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error);
    } else {
      console.log(`✅ Uploaded ${fileName} → ${data.path}`);

      // Get signed URL (for private buckets)
      const { data: urlData } = await supabase.storage
        .from('study-materials')
        .createSignedUrl(data.path, 3600); // 1 hour expiry

      // Update database with new path
      await supabase
        .from('study_materials')
        .update({ file_path: data.path }) // Store path, generate URL on demand
        .eq('material_id', material.material_id);
    }
  }
}

// Run migrations
async function migrate() {
  console.log('🚀 Starting file migration...\n');
  
  console.log('📸 Uploading profile pictures...');
  await uploadProfilePictures();
  
  console.log('\n📚 Uploading study materials...');
  await uploadStudyMaterials();
  
  console.log('\n✅ Migration complete!');
}

migrate();
```

Run with:
```bash
npm install @supabase/supabase-js
node upload_files.js
```

---

## 🔧 Phase 5: Update Application Code

### Step 5.1: Install Supabase Client Library

**For PHP Projects:**
```bash
composer require supabase/supabase-php
```

**For JavaScript/Node.js:**
```bash
npm install @supabase/supabase-js
```

### Step 5.2: Create Supabase Configuration File

Create `config/supabase.php`:

```php
<?php
require 'vendor/autoload.php';

use Supabase\CreateClient;

// Load environment variables
$supabaseUrl = getenv('SUPABASE_URL') ?: 'https://axrzqrzlnceaiuiyixif.supabase.co';
$supabaseKey = getenv('SUPABASE_ANON_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzUyMTksImV4cCI6MjA4MDI1MTIxOX0.utJg3rVhvn-D1JxUaIZS1szF5Gx7h_o3dc64ne0WhJg';

$supabase = CreateClient($supabaseUrl, $supabaseKey);

return $supabase;
?>
```

Create `.env` file in root:
```env
SUPABASE_URL=https://axrzqrzlnceaiuiyixif.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzUyMTksImV4cCI6MjA4MDI1MTIxOX0.utJg3rVhvn-D1JxUaIZS1szF5Gx7h_o3dc64ne0WhJg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cnpxcnpsbmNlYWl1aXlpeGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NTIxOSwiZXhwIjoyMDgwMjUxMjE5fQ.lxpHNuYzfJFdJHAsvGj94N56mhL-JQYmuWvImaMvEtE
SUPABASE_JWT_SECRET=D4GiqVp68e9xPUYj25B/xzRMYJKrLhrztHEXdZCYZ3SJU+kIhwi03xz25tuXUT2Hb7TSkHp0USDRBir7GODM9Q==
ENCRYPTION_KEY=oSH0nFC0TQstyVRHZr45VaIpO9zPH0wVamNdOBZ3g84=
```

### Step 5.3: Update Database Connection

**Old (`config/database.php`):**
```php
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
```

**New:**
```php
$supabase = require_once 'config/supabase.php';
```

### Step 5.4: Convert Query Patterns

**Example: Login Page**

**Old MySQL Query:**
```php
$sql = "SELECT * FROM users WHERE email = ? AND status = 'active'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['user_id'];
    // ... login successful
}
```

**New Supabase (Using Supabase Auth):**
```php
// Login with Supabase Auth
$response = $supabase->auth->signInWithPassword([
    'email' => $email,
    'password' => $password
]);

if ($response->error) {
    // Login failed
    $error = "Invalid credentials";
} else {
    // Login successful
    $user = $response->user;
    $_SESSION['access_token'] = $response->access_token;
    $_SESSION['user_id'] = $user->id;
    
    // Get additional user data from database
    $userData = $supabase->from('users')
        ->select('*')
        ->eq('auth_user_id', $user->id)
        ->single()
        ->execute();
    
    $_SESSION['role'] = $userData->data->role;
    $_SESSION['full_name'] = $userData->data->full_name;
}
```

**Example: Fetching Sessions**

**Old MySQL:**
```php
$sql = "SELECT s.*, u.full_name as tutor_name, subj.subject_name 
        FROM sessions s
        JOIN users u ON s.tutor_id = u.user_id
        JOIN subjects subj ON s.subject_id = subj.subject_id
        WHERE s.tutee_id = ?
        ORDER BY s.session_date DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
```

**New Supabase:**
```php
$sessions = $supabase->from('sessions')
    ->select('
        *,
        tutor:users!tutor_id(full_name),
        subject:subjects(subject_name, subject_code)
    ')
    ->eq('tutee_id', $user_id)
    ->order('session_date', ['ascending' => false])
    ->execute();

foreach ($sessions->data as $session) {
    echo $session->tutor->full_name;
    echo $session->subject->subject_name;
}
```

### Step 5.5: Update File Upload Code

**Old File Upload:**
```php
$upload_dir = '../uploads/profiles/';
$new_filename = 'profile_' . $user_id . '_' . time() . '.' . $ext;
move_uploaded_file($_FILES['profile_picture']['tmp_name'], $upload_dir . $new_filename);

// Update database
$sql = "UPDATE users SET profile_picture = ? WHERE user_id = ?";
```

**New Supabase Storage:**
```php
// Read uploaded file
$file = $_FILES['profile_picture'];
$fileContent = file_get_contents($file['tmp_name']);
$fileName = 'profile_' . $user_id . '_' . time() . '.' . $ext;
$uploadPath = $user_id . '/' . $fileName;

// Upload to Supabase Storage
$response = $supabase->storage
    ->from('profile-pictures')
    ->upload($uploadPath, $fileContent, [
        'contentType' => $file['type'],
        'upsert' => true
    ]);

if (!$response->error) {
    // Get public URL
    $publicUrl = $supabase->storage
        ->from('profile-pictures')
        ->getPublicUrl($uploadPath);
    
    // Update database
    $supabase->from('users')
        ->update(['profile_picture' => $publicUrl])
        ->eq('user_id', $user_id)
        ->execute();
}
```

---

## 🧪 Phase 6: Testing

### Step 6.1: Test Authentication

1. **Test Login:**
   - Try logging in with admin account
   - Verify JWT token is set
   - Check session data

2. **Test Registration:**
   - Create new test user
   - Verify user appears in Supabase Auth
   - Verify user data in `users` table

3. **Test RLS Policies:**
   - Login as student → Should only see own sessions
   - Login as tutor → Should only see tutoring sessions
   - Login as admin → Should see everything

### Step 6.2: Test Database Operations

1. **Book a Session (Student):**
   - Find tutor
   - Book session
   - Verify session appears in database
   - Check notification created

2. **Confirm Session (Tutor):**
   - View pending sessions
   - Confirm session
   - Check status updated
   - Verify notification sent

3. **Upload Study Material:**
   - Upload PDF file
   - Verify file in Supabase Storage
   - Check metadata in database
   - Try downloading file

### Step 6.3: Test File Access

1. **Profile Pictures:**
   - Upload new profile picture
   - Verify public URL works
   - Check old pictures migrated

2. **Study Materials:**
   - Upload material
   - Download material
   - Verify authentication required

3. **Chat Files (if using):**
   - Send message
   - Check JSON file created in Supabase Storage
   - Verify encryption works

---

## 🚀 Phase 7: Deployment

### Option A: Deploy to Vercel (with PHP)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Create `vercel.json`:**
```json
{
  "functions": {
    "api/*.php": {
      "runtime": "vercel-php@0.6.0"
    }
  },
  "routes": [
    {
      "src": "/(.*)\\.php",
      "dest": "/$1.php"
    }
  ]
}
```

3. **Deploy:**
```bash
vercel
```

### Option B: Traditional PHP Hosting

1. Upload files to hosting (cPanel, FTP, etc.)
2. Update `.env` with production values
3. Ensure PHP 8.0+ and Composer installed
4. Run `composer install`
5. Set file permissions (755 for directories, 644 for files)

### Environment Variables on Production

Make sure these are set:
```env
SUPABASE_URL=your-production-url
SUPABASE_ANON_KEY=your-production-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
ENCRYPTION_KEY=your-encryption-key
```

---

## 📊 Phase 8: Monitor & Optimize

### Step 8.1: Monitor Database Performance

1. In Supabase Dashboard → **Database** → **Query Performance**
2. Look for slow queries
3. Add indexes if needed:

```sql
-- Example: Add index for frequently queried columns
CREATE INDEX idx_sessions_date_status 
ON sessions(session_date, status);
```

### Step 8.2: Monitor Storage Usage

1. **Storage** → Check bucket sizes
2. Set up cleanup policies for old files
3. Consider CDN for frequently accessed files

### Step 8.3: Set Up Backups

Supabase Free Tier includes:
- ✅ Daily automated backups (7 days retention)
- ✅ Point-in-time recovery (last 24 hours)

**For additional backups:**
1. **Database** → **Backups** → **Create Backup**
2. Download backup files periodically
3. Store in separate location (Google Drive, S3, etc.)

---

## 🔒 Security Checklist

Before going live:

- [ ] All RLS policies tested and working
- [ ] Service role key never exposed to frontend
- [ ] `.env` file in `.gitignore`
- [ ] HTTPS enabled on production
- [ ] Password policies enforced
- [ ] File upload size limits set
- [ ] CORS configured properly
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize outputs)
- [ ] Rate limiting on authentication endpoints
- [ ] Email verification enabled
- [ ] Strong password requirements
- [ ] Session timeout configured

---

## 🆘 Troubleshooting

### Issue: "RLS policy violation"
**Solution:** Check if user is authenticated and has proper role. Verify RLS policies in SQL Editor.

### Issue: "Storage bucket not found"
**Solution:** Make sure bucket name matches exactly (case-sensitive). Check if bucket is created.

### Issue: "File upload fails"
**Solution:** 
- Check file size limits
- Verify MIME types allowed
- Check storage policies
- Ensure authenticated

### Issue: "Cannot connect to Supabase"
**Solution:**
- Verify URL and keys in `.env`
- Check internet connection
- Verify Supabase project is not paused (free tier pauses after 1 week inactivity)

### Issue: "User cannot see their data"
**Solution:**
- Check RLS policies
- Verify `auth.uid()` matches `user_id` in table
- Use SQL Editor to test queries with RLS

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase PHP Client:** https://github.com/supabase-community/supabase-php
- **Row Level Security Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide:** https://supabase.com/docs/guides/storage

---

## 🎉 Success Criteria

Migration is successful when:

- ✅ All users can login with Supabase Auth
- ✅ Students can book sessions
- ✅ Tutors can confirm/cancel sessions
- ✅ File uploads work (profiles, materials)
- ✅ Chat system functional (if file-based, ensure Storage API works)
- ✅ Notifications sent correctly
- ✅ Admin dashboard shows all data
- ✅ RLS policies prevent unauthorized access
- ✅ No data loss from migration
- ✅ Performance equal or better than MySQL

---

## 📞 Support

If you encounter issues:

1. Check Supabase Dashboard logs
2. Review this guide's troubleshooting section
3. Consult Supabase documentation
4. Ask in Supabase Discord community

---

**Good luck with your migration! 🚀**

*Last Updated: December 2, 2025*
