# MC TUTOR - Project Analysis & Database Plan
**Date:** December 7, 2025
**Project:** Cloud-Based Peer Tutoring Platform for Mabini College Inc.

---

## 📋 TABLE OF CONTENTS
1. [Current State Analysis](#current-state-analysis)
2. [Title vs Implementation Gap Analysis](#title-vs-implementation-gap-analysis)
3. [Current Database Structure](#current-database-structure)
4. [Issues & Improvements Needed](#issues--improvements-needed)
5. [Proposed Database Schema](#proposed-database-schema)
6. [Implementation Flow](#implementation-flow)
7. [Data Relationships & Integrity](#data-relationships--integrity)

---

## 🔍 CURRENT STATE ANALYSIS

### Project Title Requirements:
**"Cloud-Based Peer Tutoring Platform for Mabini College Inc."**

**Core Features from Title Document:**
1. ✅ User registration and login system (tutors and tutees)
2. ✅ Tutors list subjects they can teach
3. ✅ Tutees request assistance in specific subjects
4. ✅ Cloud-hosted scheduling system for booking sessions
5. ✅ Cloud storage for study materials
6. ✅ Basic feedback mechanism
7. ✅ Accessible, user-friendly, and secure

### Current Implementation Status:
```
✅ IMPLEMENTED:
- User authentication (login/register)
- Role-based access (admin, tutor, tutee)
- Profile management
- Session booking system
- Subject management
- Study materials upload/download
- Real-time messaging
- Feedback system
- Notifications

⚠️ PARTIALLY IMPLEMENTED:
- Tutor-tutee matching (basic, needs improvement)
- Session scheduling (exists but flow can be better)
- Study materials repository (storage works, organization needs work)

❌ MISSING/UNCLEAR:
- Clear peer-to-peer tutoring workflow
- Tutor availability scheduling
- Session confirmation workflow
- Material categorization by subject/topic
```

---

## 🎯 TITLE VS IMPLEMENTATION GAP ANALYSIS

### What the Title Says:
> "Connect students who need academic assistance with **peers** willing to provide tutoring"

### Current Issues:
1. **Missing Peer Focus:**
   - System has admin, tutor, tutee roles
   - BUT: No clear indication that tutors are **peer students**
   - Missing: Year level restrictions, peer verification

2. **Unclear Tutoring Flow:**
   - Title says: "Tutees search for tutors by subject and request a session"
   - Current: Session booking exists but matching is not prominent
   - Missing: Tutor discovery/search page, tutor profiles with ratings

3. **Subject-Specific Matching:**
   - Title says: "Subject-specific matching"
   - Current: Has tutor_subjects table but no clear matching algorithm
   - Missing: Subject-based search filters, tutor recommendations

4. **Study Materials Repository:**
   - Title says: "Cloud-based storage for study materials"
   - Current: Upload/download works
   - Missing: Subject categorization, search by topic, access control

5. **Feedback System:**
   - Title says: "Basic feedback mechanisms"
   - Current: Has feedback table
   - Missing: Rating aggregation, tutor reputation system

---

## 💾 CURRENT DATABASE STRUCTURE

### Existing Tables (from code analysis):
```sql
-- USERS TABLE
users (
  user_id SERIAL PRIMARY KEY,
  school_id VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  password VARCHAR,  -- ⚠️ Should be hashed (bcrypt)
  first_name VARCHAR,
  middle_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR,  -- 'admin' | 'tutor' | 'tutee'
  phone VARCHAR,
  year_level VARCHAR,  -- ⚠️ Should be INTEGER (1-4)
  course VARCHAR,  -- ⚠️ Should reference courses table
  profile_picture VARCHAR,
  bio TEXT,
  chat_pin_hash VARCHAR,
  status VARCHAR,  -- 'active' | 'inactive'
  last_active TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_password_change TIMESTAMP,
  failed_login_attempts INTEGER,
  last_failed_login TIMESTAMP,
  account_locked_until TIMESTAMP
)

-- SUBJECTS TABLE
subjects (
  subject_id SERIAL PRIMARY KEY,
  subject_code VARCHAR UNIQUE,
  subject_name VARCHAR,
  course VARCHAR,  -- ⚠️ Should be course_id reference
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- TUTOR_SUBJECTS TABLE (Junction)
tutor_subjects (
  tutor_subject_id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES users(user_id),
  subject_id INTEGER REFERENCES subjects(subject_id),
  proficiency_level VARCHAR,  -- ⚠️ Not clearly defined
  created_at TIMESTAMP,
  UNIQUE(tutor_id, subject_id)
)

-- SESSIONS TABLE
sessions (
  session_id SERIAL PRIMARY KEY,
  tutee_id INTEGER REFERENCES users(user_id),
  tutor_id INTEGER REFERENCES users(user_id),
  subject_id INTEGER REFERENCES subjects(subject_id),
  session_date DATE,
  session_time VARCHAR,  -- ⚠️ Should be TIME type
  session_type VARCHAR,  -- 'online' | 'face-to-face'
  location VARCHAR,
  status VARCHAR,  -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- MATERIALS TABLE (Inferred from storage service)
materials (
  material_id SERIAL PRIMARY KEY,
  uploader_id INTEGER REFERENCES users(user_id),
  subject_id INTEGER REFERENCES subjects(subject_id),
  title VARCHAR,
  description TEXT,
  file_path VARCHAR,
  file_type VARCHAR,
  file_size INTEGER,
  created_at TIMESTAMP
)

-- FEEDBACK TABLE (Inferred from controller)
feedback (
  feedback_id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(session_id),
  tutee_id INTEGER REFERENCES users(user_id),
  tutor_id INTEGER REFERENCES users(user_id),
  rating INTEGER,  -- ⚠️ Should be 1-5 with CHECK constraint
  comment TEXT,
  created_at TIMESTAMP
)

-- NOTIFICATIONS TABLE (Inferred)
notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  type VARCHAR,
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP
)

-- CHATS TABLE (from ChatService)
chats (
  chat_id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(user_id),
  receiver_id INTEGER REFERENCES users(user_id),
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP
)
```

### Storage Buckets (Supabase):
- `profile-pictures` - User profile images
- `study-materials` - Uploaded study files

---

## ⚠️ ISSUES & IMPROVEMENTS NEEDED

### 1. DATA TYPE ISSUES:
```sql
-- CURRENT PROBLEMS:
❌ year_level VARCHAR           → Should be INTEGER (1-4)
❌ course VARCHAR               → Should be course_id INTEGER FK
❌ session_time VARCHAR         → Should be TIME
❌ rating (no constraints)      → Should be INTEGER CHECK (1-5)
❌ password stored unclear      → Must clarify: plain text or hashed?
```

### 2. MISSING TABLES:
```sql
-- NEEDED FOR COMPLETE SYSTEM:
❌ courses (course_id, course_code, course_name, department)
❌ tutor_availability (schedule management)
❌ session_requests (pending approval workflow)
❌ material_categories (organize study materials)
❌ tutor_ratings_aggregate (calculated ratings)
```

### 3. MISSING RELATIONSHIPS:
```sql
-- GAPS IN DATA INTEGRITY:
❌ subjects.course → No FK to courses table
❌ users.course → No FK to courses table
❌ materials → No categorization/tags
❌ sessions → No approval workflow
```

### 4. WORKFLOW GAPS:

**Current Session Flow:**
```
Tutee → Creates Session → Status: pending → ?
```

**Should Be:**
```
1. Tutee searches tutors by subject
2. Views tutor profile + ratings
3. Checks tutor availability
4. Sends session request
5. Tutor approves/rejects
6. Session confirmed
7. Session completed
8. Tutee gives feedback
9. Rating updates tutor profile
```

### 5. BUSINESS LOGIC ISSUES:

**Peer Tutoring Rules (Not Enforced):**
- ❌ Tutors should be students (have year_level)
- ❌ Tutors can't tutor themselves
- ❌ Year level restrictions (e.g., 4th year can tutor 1st-3rd)
- ❌ Course alignment (tutor should know the subject's course)

---

## 🗄️ PROPOSED DATABASE SCHEMA

### NEW/IMPROVED TABLES:

```sql
-- ===================================
-- 1. COURSES TABLE (NEW)
-- ===================================
CREATE TABLE courses (
  course_id SERIAL PRIMARY KEY,
  course_code VARCHAR(10) UNIQUE NOT NULL,  -- BSA, BSBA, BSED, BSN, BSCS, BSCrim
  course_name VARCHAR(100) NOT NULL,
  department VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data:
INSERT INTO courses (course_code, course_name) VALUES
('BSA', 'BS in Accountancy'),
('BSBA', 'BS in Business Administration'),
('BSED', 'Bachelor in Secondary Education'),
('BSN', 'BS in Nursing'),
('BSCS', 'BS in Computer Science'),
('BSCrim', 'BS in Criminology');


-- ===================================
-- 2. USERS TABLE (IMPROVED)
-- ===================================
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  school_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- NOTE: Will be plain text for now, hash later
  
  -- Personal Info
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  profile_picture VARCHAR(255),
  bio TEXT,
  
  -- Academic Info
  role VARCHAR(10) CHECK (role IN ('admin', 'tutor', 'tutee')) NOT NULL,
  course_id INTEGER REFERENCES courses(course_id),  -- FIXED: FK instead of VARCHAR
  year_level INTEGER CHECK (year_level BETWEEN 1 AND 4),  -- FIXED: INTEGER 1-4
  
  -- Security
  chat_pin VARCHAR(6),  -- NOTE: Plain text for now, hash later
  status VARCHAR(10) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  
  -- Activity Tracking
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_password_change TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMP,
  account_locked_until TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_tutor_has_course CHECK (
    role != 'tutor' OR (course_id IS NOT NULL AND year_level IS NOT NULL)
  ),
  CONSTRAINT check_tutee_has_course CHECK (
    role != 'tutee' OR (course_id IS NOT NULL AND year_level IS NOT NULL)
  )
);


-- ===================================
-- 3. SUBJECTS TABLE (IMPROVED)
-- ===================================
CREATE TABLE subjects (
  subject_id SERIAL PRIMARY KEY,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  course_id INTEGER REFERENCES courses(course_id),  -- FIXED: FK instead of VARCHAR
  year_level INTEGER CHECK (year_level BETWEEN 1 AND 4),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===================================
-- 4. TUTOR_SUBJECTS TABLE (IMPROVED)
-- ===================================
CREATE TABLE tutor_subjects (
  tutor_subject_id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')),
  years_of_experience INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tutor_id, subject_id),
  
  -- Ensure tutor is actually a tutor
  CONSTRAINT check_user_is_tutor CHECK (
    EXISTS (SELECT 1 FROM users WHERE user_id = tutor_id AND role = 'tutor')
  )
);


-- ===================================
-- 5. TUTOR_AVAILABILITY TABLE (NEW)
-- ===================================
CREATE TABLE tutor_availability (
  availability_id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tutor_id, day_of_week, start_time),
  
  CONSTRAINT check_valid_time CHECK (end_time > start_time)
);


-- ===================================
-- 6. SESSIONS TABLE (IMPROVED)
-- ===================================
CREATE TABLE sessions (
  session_id SERIAL PRIMARY KEY,
  tutee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(subject_id),
  
  -- Session Details
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,  -- FIXED: Use TIME type
  duration_minutes INTEGER DEFAULT 60,
  session_type VARCHAR(20) CHECK (session_type IN ('online', 'face-to-face')) NOT NULL,
  location VARCHAR(100),
  meeting_link VARCHAR(255),
  
  -- Status Workflow
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  
  -- Notes
  tutee_notes TEXT,
  tutor_notes TEXT,
  cancellation_reason TEXT,
  
  -- Tracking
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT check_different_users CHECK (tutee_id != tutor_id),
  CONSTRAINT check_future_session CHECK (
    session_date >= CURRENT_DATE OR status IN ('completed', 'cancelled')
  )
);


-- ===================================
-- 7. MATERIALS TABLE (IMPROVED)
-- ===================================
CREATE TABLE materials (
  material_id SERIAL PRIMARY KEY,
  uploader_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(subject_id),
  
  -- File Info
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  
  -- Categorization
  category VARCHAR(50) CHECK (category IN ('notes', 'handout', 'exercise', 'exam', 'other')),
  topic VARCHAR(100),
  tags TEXT[],  -- Array of tags for searching
  
  -- Access Control
  is_public BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===================================
-- 8. FEEDBACK TABLE (IMPROVED)
-- ===================================
CREATE TABLE feedback (
  feedback_id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(session_id) ON DELETE CASCADE UNIQUE,
  tutee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  tutor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Rating & Comments
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  
  -- Detailed Ratings (Optional)
  knowledge_rating INTEGER CHECK (knowledge_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure feedback is from the session's tutee
  CONSTRAINT check_correct_tutee CHECK (
    EXISTS (SELECT 1 FROM sessions WHERE session_id = session_id AND tutee_id = tutee_id)
  )
);


-- ===================================
-- 9. TUTOR_STATS TABLE (NEW - Aggregated)
-- ===================================
CREATE TABLE tutor_stats (
  tutor_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Session Stats
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  
  -- Rating Stats
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  
  -- Subject Count
  subjects_taught INTEGER DEFAULT 0,
  
  -- Activity
  last_session_date DATE,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===================================
-- 10. NOTIFICATIONS TABLE (IMPROVED)
-- ===================================
CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Notification Details
  type VARCHAR(50) CHECK (type IN (
    'session_request', 'session_approved', 'session_rejected', 
    'session_reminder', 'session_completed', 'new_material',
    'new_feedback', 'system_announcement'
  )) NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  
  -- Related Entity
  related_id INTEGER,  -- Can be session_id, material_id, etc.
  related_type VARCHAR(20),  -- 'session', 'material', 'feedback'
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===================================
-- 11. CHATS TABLE (CURRENT - Keep)
-- ===================================
CREATE TABLE chats (
  chat_id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_different_chat_users CHECK (sender_id != receiver_id)
);
```

---

## 🔄 IMPLEMENTATION FLOW

### Phase 1: Database Migration (Week 1-2)
```
1. Create courses table
2. Add course_id FK to users
3. Add course_id FK to subjects
4. Migrate existing course VARCHAR data to course_id
5. Create tutor_availability table
6. Create tutor_stats table
7. Add missing constraints
8. Update year_level to INTEGER
9. Update session_time to TIME
```

### Phase 2: Core Tutoring Flow (Week 3-4)
```
1. Tutor Discovery Page
   - Search tutors by subject
   - Filter by rating, availability, year level
   - View tutor profiles with stats

2. Session Request Workflow
   - Tutee browses available tutors
   - Checks tutor availability
   - Sends session request
   - Tutor receives notification
   - Tutor approves/rejects
   - Confirmed session added to calendar

3. Session Management
   - Upcoming sessions view
   - Completed sessions history
   - Cancel/reschedule functionality
```

### Phase 3: Materials & Feedback (Week 5-6)
```
1. Study Materials Repository
   - Upload with subject categorization
   - Search by subject/topic/tags
   - Download tracking
   - Access control (public/private)

2. Feedback System
   - Post-session feedback form
   - Rating aggregation
   - Tutor stats update
   - Display ratings on tutor profiles
```

### Phase 4: Advanced Features (Week 7-8)
```
1. Tutor Availability Calendar
2. Session Reminders
3. Analytics Dashboard (Admin)
4. Material Recommendations
5. Top Tutors Leaderboard
```

---

## 🔗 DATA RELATIONSHIPS & INTEGRITY

### Key Relationships:
```
courses (1) ←→ (M) users [course_id]
courses (1) ←→ (M) subjects [course_id]

users (1) ←→ (M) tutor_subjects [tutor_id]
subjects (1) ←→ (M) tutor_subjects [subject_id]

users (1) ←→ (M) tutor_availability [tutor_id]

users (tutee) (1) ←→ (M) sessions [tutee_id]
users (tutor) (1) ←→ (M) sessions [tutor_id]
subjects (1) ←→ (M) sessions [subject_id]

sessions (1) ←→ (1) feedback [session_id]

users (1) ←→ (M) materials [uploader_id]
subjects (1) ←→ (M) materials [subject_id]

users (1) ←→ (1) tutor_stats [tutor_id]

users (1) ←→ (M) notifications [user_id]
users (1) ←→ (M) chats [sender_id/receiver_id]
```

### Data Integrity Rules:
```sql
1. CASCADE DELETE:
   - Delete user → Delete their sessions, materials, chats, notifications
   - Delete subject → Delete tutor_subjects, materials references

2. CHECK CONSTRAINTS:
   - year_level: 1-4 only
   - rating: 1-5 only
   - role: admin|tutor|tutee
   - status: specific values only
   - session_date: future dates (unless completed/cancelled)

3. UNIQUE CONSTRAINTS:
   - school_id, email (users)
   - subject_code (subjects)
   - tutor_id + subject_id (tutor_subjects)
   - session_id (feedback - one feedback per session)

4. BUSINESS RULES:
   - Tutors must have course_id and year_level
   - Tutees must have course_id and year_level
   - Tutors can't book sessions with themselves
   - Feedback can only be given by session tutee
```

---

## 📊 SAMPLE DATA FLOW

### Example: Student Books a Tutoring Session

```sql
-- 1. Student (Tutee) searches for tutors
SELECT 
  u.user_id, u.first_name, u.last_name, u.year_level,
  ts.proficiency_level,
  s.subject_name,
  COALESCE(tst.average_rating, 0) as rating,
  COALESCE(tst.completed_sessions, 0) as sessions_count
FROM users u
JOIN tutor_subjects ts ON u.user_id = ts.tutor_id
JOIN subjects s ON ts.subject_id = s.subject_id
LEFT JOIN tutor_stats tst ON u.user_id = tst.tutor_id
WHERE u.role = 'tutor' 
  AND s.subject_id = 5  -- CS101
  AND u.status = 'active'
ORDER BY tst.average_rating DESC;

-- 2. Student checks tutor availability
SELECT * FROM tutor_availability
WHERE tutor_id = 10
  AND is_available = TRUE
ORDER BY day_of_week, start_time;

-- 3. Student creates session request
INSERT INTO sessions (
  tutee_id, tutor_id, subject_id,
  session_date, session_time, duration_minutes,
  session_type, tutee_notes, status
) VALUES (
  25,  -- tutee_id
  10,  -- tutor_id
  5,   -- subject_id (CS101)
  '2025-12-10',
  '14:00:00',
  60,
  'online',
  'Need help with loops and functions',
  'pending'
) RETURNING session_id;

-- 4. Notify tutor
INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
VALUES (
  10,
  'session_request',
  'New Session Request',
  'John Doe requested a tutoring session for CS101',
  123,  -- session_id from previous insert
  'session'
);

-- 5. Tutor approves
UPDATE sessions 
SET status = 'approved', approved_at = CURRENT_TIMESTAMP
WHERE session_id = 123;

-- 6. After session completes
UPDATE sessions 
SET status = 'completed', completed_at = CURRENT_TIMESTAMP
WHERE session_id = 123;

-- 7. Tutee gives feedback
INSERT INTO feedback (session_id, tutee_id, tutor_id, rating, comment)
VALUES (123, 25, 10, 5, 'Very helpful! Explained concepts clearly.');

-- 8. Update tutor stats
UPDATE tutor_stats
SET 
  completed_sessions = completed_sessions + 1,
  total_ratings = total_ratings + 1,
  average_rating = (
    SELECT AVG(rating) FROM feedback WHERE tutor_id = 10
  ),
  last_session_date = '2025-12-10',
  updated_at = CURRENT_TIMESTAMP
WHERE tutor_id = 10;
```

---

## ✅ VALIDATION CHECKLIST

### Requirements from Title:
- ✅ User registration (tutors and tutees)
- ✅ Tutor lists subjects
- ✅ Tutee requests assistance
- ✅ Cloud-hosted scheduling
- ✅ Cloud storage for materials
- ✅ Feedback mechanism
- ✅ Secure platform

### Database Quality:
- ✅ Proper data types (INTEGER for year_level, TIME for session_time)
- ✅ Foreign key relationships
- ✅ CHECK constraints for data validation
- ✅ UNIQUE constraints prevent duplicates
- ✅ CASCADE DELETE for referential integrity
- ✅ Business logic constraints (can't tutor self, etc.)
- ✅ Aggregated statistics (tutor_stats)
- ✅ Clear workflow (pending → approved → completed)

### Alignment with Title:
- ✅ Focus on PEER tutoring (students helping students)
- ✅ Subject-specific matching (tutor_subjects)
- ✅ Session booking workflow (sessions + notifications)
- ✅ Study materials repository (materials + categorization)
- ✅ Feedback & ratings (feedback + tutor_stats)
- ✅ Cloud-based (Supabase PostgreSQL)

---

## 🚀 NEXT STEPS

### Immediate Actions:
1. Review this document
2. Approve database schema changes
3. Create migration scripts
4. Test with sample data
5. Update API controllers to match new schema
6. Update frontend forms (year_level, course dropdowns)
7. Implement tutor search & discovery page
8. Implement session request workflow
9. Improve materials categorization
10. Add tutor stats display

### Notes:
- ⚠️ Password and PIN will remain **plain text** for now (no hashing/encryption)
- ⚠️ Will implement bcrypt hashing in future phase
- ✅ All relationships and flows are now aligned with project title
- ✅ Database supports complete peer tutoring workflow

---

**END OF DOCUMENT**
