# MC TUTOR DOCUMENTATION
## Cloud-Based Peer Tutoring Platform for Mabini College Inc.

---

# PART 4: SYSTEM FEATURES AND IMPLEMENTATION DETAILS

---

## TABLE OF CONTENTS

1. Authentication and User Management
2. Tutor Discovery and Matching
3. Session Management System
4. Study Materials Management
5. Feedback and Rating System
6. Messaging and Communication
7. Notification System
8. Administrative Dashboard
9. Search and Filtering Capabilities
10. File Upload and Storage

---

## 1. AUTHENTICATION AND USER MANAGEMENT

### 1.1 User Registration

**Implementation:** `authController.ts` - `register()`

**Features:**
- School ID validation (unique identifier)
- Email domain verification (@mabinicolleges.edu.ph)
- Role selection (admin, tutor, tutee)
- Course and year level assignment
- Password requirements (minimum 6 characters)

**Registration Flow:**
```
User fills form → Backend validates input → Check duplicate email/school_id 
→ Create user record → Generate JWT token → Return success + token
```

**Technical Details:**
- **Endpoint:** `POST /api/auth/register`
- **Validation:** Email format, school ID uniqueness, required fields
- **Security:** Plain text password (⚠️ bcrypt recommended)
- **Response:** User object + JWT access token

### 1.2 User Authentication

**Implementation:** `authController.ts` - `login()`

**Login Process:**
```
1. User enters email + password
2. Backend queries database for user
3. Password comparison (plain text currently)
4. If valid: Generate JWT token (7-day expiry)
5. Update last_active timestamp
6. Return user data + token
```

**JWT Token Structure:**
```typescript
{
  userId: number,
  email: string,
  role: 'admin' | 'tutor' | 'tutee',
  iat: timestamp,
  exp: timestamp (7 days)
}
```

**Session Management:**
- Stateless authentication (JWT-based)
- Token stored in localStorage and cookies
- Automatic logout on token expiry
- Multi-tab synchronization via storage events

### 1.3 Profile Management

**Implementation:** `userController.ts`

**Features:**
- Update personal information (name, phone, bio)
- Change password functionality
- Upload profile picture (image files, max 5MB)
- View profile statistics (for tutors)

**Profile Picture Upload:**
```
User selects image → Multer processes file → Validate type/size 
→ Upload to Supabase Storage → Update profile_picture URL → Return success
```

**Technical Details:**
- Allowed formats: JPG, JPEG, PNG, GIF
- Maximum size: 5MB
- Storage: Supabase Storage (public bucket)
- URL generation: Auto-generated public URL

---

## 2. TUTOR DISCOVERY AND MATCHING

### 2.1 Tutor Search System

**Implementation:** `tutorController.ts` - `searchTutors()`

**Search Capabilities:**
- Search by subject (120 subjects)
- Filter by course (BSA, BSBA, BSED, BSN, BSCS, BSCrim)
- Filter by rating (minimum rating threshold)
- Sort by rating, total sessions, or name

**Search Algorithm:**
```sql
SELECT users.*, tutor_stats.average_rating, tutor_stats.total_sessions
FROM users
JOIN tutor_subjects ON users.user_id = tutor_subjects.tutor_id
JOIN subjects ON tutor_subjects.subject_id = subjects.subject_id
WHERE users.role = 'tutor'
  AND subjects.subject_id = ? (if subject filter applied)
  AND subjects.course_code = ? (if course filter applied)
  AND tutor_stats.average_rating >= ? (if rating filter applied)
ORDER BY [rating DESC | total_sessions DESC | name ASC]
```

**Response Data:**
- Tutor profile (name, course, year level, profile picture)
- Teaching subjects with proficiency levels
- Performance statistics (average rating, total sessions)
- Availability status

### 2.2 Tutor Subject Management

**Implementation:** `tutorController.ts` - `addTutorSubject()`, `removeTutorSubject()`

**Adding Subjects:**
```
Tutor selects subject → Choose proficiency level → Submit 
→ Create tutor_subjects record → Update tutor_stats.subjects_taught
```

**Proficiency Levels:**
- Beginner (1-2 years experience)
- Intermediate (2-3 years experience)
- Advanced (3-4 years experience)
- Expert (mastery level)

**Business Rules:**
- Tutors can teach multiple subjects
- One proficiency level per subject
- Can update proficiency level anytime
- Removing subject doesn't delete associated materials

---

## 3. SESSION MANAGEMENT SYSTEM

### 3.1 Session Booking Workflow

**Implementation:** `sessionController.ts`

**Complete Workflow:**
```
1. PENDING: Tutee requests session
   - Selects tutor, subject, date, time, type (online/physical)
   - System creates session record (status: pending)
   - Notification sent to tutor

2. CONFIRMED: Tutor confirms session
   - Tutor reviews request details
   - Clicks confirm button
   - Status updated to 'confirmed'
   - Chat conversation auto-created
   - Both parties notified

3. COMPLETED: Session finished
   - Tutor marks session as completed
   - Status updated to 'completed'
   - Tutee can now submit feedback
   - Tutor stats updated

4. CANCELLED: Session cancelled
   - Either party can cancel
   - Cancellation reason required
   - Status updated to 'cancelled'
   - Both parties notified
```

### 3.2 Session Types

**Online Sessions:**
- Location field contains meeting URL (Zoom, Google Meet, etc.)
- Tutor provides link after confirmation
- No physical location needed

**Physical Sessions:**
- Location field contains campus building/room
- Common locations: Library, Study Halls, Computer Labs
- Face-to-face interaction

### 3.3 Session Tracking

**Session States:**
- `pending` - Awaiting tutor confirmation
- `confirmed` - Tutor accepted, session scheduled
- `completed` - Session finished successfully
- `cancelled` - Session cancelled by either party

**Session Data Captured:**
- Participants (tutor_id, tutee_id)
- Subject being taught
- Date and time (start_time, end_time)
- Session type and location
- Notes/special instructions
- Status and timestamps
- Cancellation reason (if applicable)

---

## 4. STUDY MATERIALS MANAGEMENT

### 4.1 Material Upload System

**Implementation:** `materialController.ts` - `uploadMaterial()`

**Upload Process:**
```
Tutor fills form (title, description, subject, category, file)
→ Multer processes file upload
→ Validate file type and size
→ Upload to Supabase Storage
→ Create material record in database
→ Generate public download URL
→ Return success
```

**Supported File Types:**
- Documents: PDF, DOC, DOCX
- Presentations: PPT, PPTX
- Text: TXT
- Archives: ZIP, RAR

**File Size Limit:** 10MB (10,485,760 bytes)

### 4.2 Material Categories

**Available Categories:**
- **Lecture** - Lecture notes, slides, recordings transcripts
- **Assignment** - Practice problems, exercises
- **Quiz** - Sample quizzes, exam questions
- **Reference** - Textbooks, research papers, articles
- **Other** - Miscellaneous educational content

### 4.3 Material Access and Download

**Implementation:** `materialController.ts` - `downloadMaterial()`

**Download Flow:**
```
User clicks download → System verifies authentication 
→ Increment download_count → Generate signed URL 
→ Redirect to file → File downloads
```

**Access Control:**
- All authenticated users can download
- Download tracking for analytics
- Material metadata visible to all
- Tutor can delete own materials

---

## 5. FEEDBACK AND RATING SYSTEM

### 5.1 Multi-Dimensional Rating

**Implementation:** `feedbackController.ts` - `submitFeedback()`

**Rating Categories (1-5 stars each):**
1. **Communication Rating** - Clarity, responsiveness, listening skills
2. **Knowledge Rating** - Subject expertise, accuracy, depth
3. **Punctuality Rating** - Timeliness, reliability, scheduling
4. **Teaching Style Rating** - Methodology, patience, engagement
5. **Overall Rating** - General satisfaction

**Feedback Submission:**
```
Session completed → Tutee navigates to feedback form 
→ Select session → Rate 5 dimensions → Add comments (optional) 
→ Submit → Store feedback → Update tutor average rating
```

### 5.2 Rating Calculation

**Average Rating Formula:**
```typescript
overall_rating = (communication_rating + knowledge_rating + 
                  punctuality_rating + teaching_style_rating) / 4

tutor_average_rating = SUM(overall_rating) / COUNT(feedback)
```

**Rating Display:**
- 5.0 - Excellent
- 4.0-4.9 - Very Good
- 3.0-3.9 - Good
- 2.0-2.9 - Fair
- 1.0-1.9 - Poor

### 5.3 Feedback Visibility

**Public Information:**
- Average ratings per category
- Overall tutor rating
- Total number of reviews
- Recent comments (limited to 5 most recent)

**Private Information:**
- Individual feedback details (only visible to tutor and admin)
- Specific student feedback (anonymous to other students)

---

## 6. MESSAGING AND COMMUNICATION

### 6.1 Direct Messaging System

**Implementation:** `chatController.ts`

**Chat Features:**
- One-to-one conversations
- Message history persistence
- Unread message tracking
- Real-time updates (via polling, 5-second intervals)
- Optional message encryption (PIN-based)

**Messaging Flow:**
```
User composes message → POST /api/chat/send 
→ Store in chats table → Recipient receives notification 
→ Polling retrieves new messages → Display in chat interface
```

### 6.2 Message Encryption (Optional)

**Implementation:** `EncryptionService.ts`

**Encryption Process:**
- User sets 6-digit PIN during first chat
- Messages encrypted using AES-256
- PIN stored as hash (for verification)
- Decryption requires correct PIN
- End-to-end encryption simulation

**Note:** Currently implemented as optional feature, not enforced system-wide.

### 6.3 Conversation Management

**Features:**
- View all conversations with message previews
- Unread message count per conversation
- Mark messages as read
- Search conversations by participant name
- Delete conversations (future enhancement)

---

## 7. NOTIFICATION SYSTEM

### 7.1 Notification Types

**Implementation:** `notificationController.ts`

**Event-Triggered Notifications:**

1. **Session Notifications**
   - New session request (to tutor)
   - Session confirmed (to tutee)
   - Session cancelled (to both parties)
   - Session reminder (24 hours before)

2. **Material Notifications**
   - New material uploaded for subscribed subject
   - Popular material recommendations

3. **Feedback Notifications**
   - New feedback received (to tutor)
   - Feedback reminder (to tutee after completed session)

4. **System Notifications**
   - Account updates
   - Policy changes
   - Maintenance announcements

### 7.2 Notification Delivery

**Delivery Channels:**
- **In-App:** Real-time notification center
- **Email:** SMTP delivery (configured in .env)
- **SMS:** Future enhancement

**Notification Format:**
```typescript
{
  notification_id: number,
  user_id: number,
  type: 'session' | 'material' | 'feedback' | 'system',
  title: string,
  message: string,
  related_id: number (optional),
  is_read: boolean,
  created_at: timestamp
}
```

---

## 8. ADMINISTRATIVE DASHBOARD

### 8.1 System Statistics

**Implementation:** `adminController.ts` - `getStats()`

**Key Metrics Displayed:**
- Total users (breakdown by role)
- Active sessions (pending, confirmed, completed)
- Total study materials
- Average tutor rating
- Popular subjects (by session count)
- New registrations (last 7 days)
- Active users (last 24 hours)

### 8.2 User Management

**Admin Capabilities:**
- View all users with filters (role, course, status)
- Create new user accounts
- Edit user information
- Suspend/activate accounts
- Reset user passwords
- Delete user accounts (with cascade handling)

**User Management Interface:**
- Searchable, sortable table
- Pagination (50 users per page)
- Quick action buttons (edit, suspend, delete)
- Bulk operations (future enhancement)

### 8.3 Content Moderation

**Material Review:**
- View all uploaded materials
- Preview file metadata
- Delete inappropriate content
- Monitor download statistics
- Flag materials for review

**Session Oversight:**
- View all session details
- Intervene in disputes
- Cancel sessions if needed
- Generate session reports
- Export session data

---

## 9. SEARCH AND FILTERING CAPABILITIES

### 9.1 Global Search

**Implementation:** `searchRoutes.ts`

**Search Scope:**
- Tutor names and profiles
- Subject names and codes
- Study material titles
- User accounts (admin only)

**Search Algorithm:**
```sql
-- Tutor search
WHERE LOWER(first_name || ' ' || last_name) LIKE '%search_term%'

-- Subject search
WHERE LOWER(subject_name) LIKE '%search_term%' 
   OR LOWER(subject_code) LIKE '%search_term%'

-- Material search
WHERE LOWER(title) LIKE '%search_term%' 
   OR LOWER(description) LIKE '%search_term%'
```

### 9.2 Advanced Filtering

**Filter Options:**

**Tutor Filters:**
- Course (BSA, BSBA, BSED, BSN, BSCS, BSCrim)
- Subject expertise
- Minimum rating (1-5 stars)
- Availability status
- Year level

**Material Filters:**
- Subject category
- File type (PDF, DOC, PPT, etc.)
- Upload date range
- Tutor/uploader
- Download popularity

**Session Filters:**
- Status (pending, confirmed, completed, cancelled)
- Date range
- Subject
- Tutor/Tutee
- Session type (online/physical)

---

## 10. FILE UPLOAD AND STORAGE

### 10.1 Storage Architecture

**Dual Storage System:**

**Development (Local Storage):**
```
uploads/
├── profiles/           # Profile pictures
└── study_materials/    # Study materials
    ├── 200405/         # Organized by tutor user_id
    └── 200458/
```

**Production (Cloud Storage):**
- **Provider:** Supabase Storage
- **Buckets:** 
  - `profile-pictures` (public)
  - `study-materials` (public)
- **CDN:** Automatic global distribution
- **Capacity:** Unlimited (pay-as-you-grow)

### 10.2 File Upload Process

**Implementation:** `StorageService.ts`

**Upload Workflow:**
```typescript
1. Multer receives file from FormData
2. Validate file:
   - Check file type against whitelist
   - Verify file size < 10MB
   - Sanitize filename
3. Determine storage mode (env: USE_LOCAL_STORAGE)
4. If cloud:
   - Upload to Supabase Storage
   - Get public URL
5. If local:
   - Save to uploads/ directory
   - Generate relative path
6. Return file URL for database storage
```

**File Validation:**
```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

### 10.3 File Access Control

**Public Access:**
- All uploaded study materials are publicly accessible
- Profile pictures are publicly viewable
- Download tracking for analytics

**Security Measures:**
- File type validation (prevents executable uploads)
- File size limits (prevents storage abuse)
- Filename sanitization (prevents path traversal)
- Virus scanning (future enhancement)

---

## IMPLEMENTATION SUMMARY

### Key Technologies Used

| Feature | Primary Technology | Supporting Libraries |
|---------|-------------------|---------------------|
| Authentication | JWT (jsonwebtoken) | bcryptjs (planned) |
| File Upload | Multer | Supabase Storage SDK |
| Database Access | Supabase Client | PostgreSQL |
| Real-time Features | Polling | Socket.IO (disabled) |
| Email | Nodemailer | SMTP |
| Encryption | Crypto (Node.js) | AES-256 |
| Validation | Express-validator | Custom validators |
| Rate Limiting | express-rate-limit | - |
| Security Headers | Helmet.js | - |

### Code Organization

```
Controllers → Handle HTTP requests/responses
    ↓
Services → Implement business logic
    ↓
Database → Data persistence (Supabase)
    ↓
Storage → File management (Supabase Storage)
```

### Performance Optimizations

1. **Database Indexing** - Strategic indexes on frequently queried columns
2. **Query Optimization** - Efficient JOINs, avoid N+1 queries
3. **Caching** - Browser caching for static assets
4. **CDN** - Global content delivery via Vercel
5. **Connection Pooling** - Managed by Supabase (PgBouncer)
6. **Lazy Loading** - Load data on-demand, paginate results

---

**END OF PART 4**

*Continue to Part 5: Testing Results and Bug Logs*
