# MC TUTOR DOCUMENTATION
## Cloud-Based Peer Tutoring Platform for Mabini College Inc.

---

# PART 2: SYSTEM OVERVIEW AND TECHNICAL ARCHITECTURE

---

## TABLE OF CONTENTS

1. System Overview
2. Architectural Design
3. Technology Stack
4. Database Architecture
5. Frontend Architecture
6. Backend Architecture
7. API Design and Endpoints
8. Security Architecture
9. Cloud Infrastructure
10. System Integration

---

## 1. SYSTEM OVERVIEW

### 1.1 Introduction

The MC Tutor platform is a comprehensive cloud-based peer tutoring system designed to facilitate academic collaboration among Mabini College Inc. students. The system implements a modern three-tier architecture comprising a responsive web frontend, a RESTful API backend, and a cloud-hosted PostgreSQL database, all deployed on scalable cloud infrastructure.

### 1.2 System Objectives

**Primary Objectives:**
1. Provide a centralized platform for connecting tutors and tutees
2. Enable efficient scheduling and management of tutoring sessions
3. Facilitate sharing of educational materials and resources
4. Implement quality assurance through comprehensive feedback mechanisms
5. Ensure secure, scalable, and reliable operation

**Secondary Objectives:**
1. Generate actionable analytics for institutional decision-making
2. Support multiple session types (online and physical)
3. Enable real-time communication between users
4. Provide role-based access control for different user types
5. Maintain comprehensive audit trails for accountability

### 1.3 System Scope

**Included in Scope:**
- User registration and authentication for students and administrators
- Tutor profile creation and subject expertise management
- Session booking, confirmation, and tracking workflow
- Study material upload, storage, and download functionality
- Comprehensive five-dimensional feedback system
- Direct messaging between tutors and students
- Administrative dashboard for system oversight
- Support for 120 subjects across 6 academic programs
- Multi-role access control (admin, tutor, tutee)

**Excluded from Scope:**
- Integration with existing Student Information Systems
- Payment processing for paid tutoring services
- Video conferencing functionality (future enhancement)
- Mobile native applications (web-responsive only)
- Automated AI-based tutor matching
- Integration with Learning Management Systems (LMS)

### 1.4 Target Users

**Students (Tutees)**
- All enrolled Mabini College Inc. students
- Seeking academic assistance in specific subjects
- Require flexible scheduling options
- Need access to study materials and resources

**Tutors (Student Tutors)**
- Academically proficient students willing to teach
- Subject matter experts in one or more areas
- Seeking to build teaching portfolios
- Available for scheduled tutoring sessions

**Administrators**
- Academic affairs staff
- Student services personnel
- IT administrators
- Faculty advisers overseeing peer tutoring programs

### 1.5 System Boundaries

**Internal Components:**
- Web application frontend (HTML/CSS/JavaScript)
- RESTful API backend (Node.js/TypeScript/Express)
- PostgreSQL database (Supabase-hosted)
- Cloud storage for files (Supabase Storage)
- Authentication and authorization system
- Notification engine

**External Interfaces:**
- User web browsers (Chrome, Firefox, Safari, Edge)
- Email service (SMTP for notifications)
- Cloud hosting provider (Vercel)
- Database hosting provider (Supabase)
- Git version control (GitHub)

---

## 2. ARCHITECTURAL DESIGN

### 2.1 Overall Architecture

The MC Tutor platform follows a **three-tier architecture** pattern, ensuring separation of concerns, maintainability, and scalability:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   HTML5    │  │   CSS3     │  │ JavaScript │            │
│  │   Pages    │  │  Styling   │  │   Logic    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         25 Pages | Responsive Design | Components           │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │          Node.js + Express.js + TypeScript         │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  Controllers  │  Services  │  Middleware  │ Routes │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  • Authentication    • Session Management          │     │
│  │  • User Management   • File Processing             │     │
│  │  • Authorization     • Notification Service        │     │
│  │  • Rate Limiting     • Encryption Service          │     │
│  └────────────────────────────────────────────────────┘     │
│                     60+ API Endpoints                        │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Supabase PostgreSQL Database               │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  11 Tables | Relationships | Indexes | Constraints │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  • users          • sessions      • notifications  │     │
│  │  • subjects       • materials     • chats          │     │
│  │  • courses        • feedback      • tutor_stats    │     │
│  │  • tutor_subjects • tutor_availability             │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │            Supabase Cloud Storage                  │     │
│  │      Profile Pictures | Study Materials            │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Patterns

**Model-View-Controller (MVC) Variant:**
- **Model:** Database schemas and business logic in services
- **View:** HTML pages and client-side JavaScript
- **Controller:** Express route handlers and controller functions

**Service Layer Pattern:**
- Separates business logic from HTTP handling
- Promotes code reusability and testability
- Services: AuthService, ChatService, MaterialsService, etc.

**Repository Pattern (Implicit):**
- Database access abstracted through Supabase client
- Query logic centralized in controller/service methods
- Enables easier database migration if needed

**Middleware Chain Pattern:**
- Request processing through middleware pipeline
- Authentication → Rate Limiting → Route Handler → Error Handler
- Cross-cutting concerns handled centrally

### 2.3 Design Principles

**Separation of Concerns:**
- Frontend handles presentation and user interaction
- Backend handles business logic and data management
- Database handles data persistence and integrity

**Modularity:**
- Components organized by feature/domain
- Reusable UI components (header, navigation, chat)
- Service modules for specific business capabilities

**Scalability:**
- Stateless API design enables horizontal scaling
- Cloud infrastructure supports auto-scaling
- Database connection pooling for concurrent requests

**Security:**
- JWT-based authentication for stateless security
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting to prevent abuse

---

## 3. TECHNOLOGY STACK

### 3.1 Frontend Technologies

**Core Technologies:**

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | Latest | Document structure and semantic markup |
| CSS3 | Latest | Styling, layouts, responsive design |
| JavaScript (ES6+) | ES2020+ | Client-side logic and interactivity |

**Libraries and Frameworks:**

| Library | Version | Purpose |
|---------|---------|---------|
| Font Awesome | 6.4.0 | Icon library for UI elements |
| Google Fonts | Latest | Montserrat font family |
| Fetch API | Native | HTTP requests to backend API |

**Design Approach:**
- **Vanilla JavaScript:** Zero dependencies, lightweight, fast loading
- **No Frontend Framework:** Direct DOM manipulation, full control
- **Responsive Design:** Mobile-first approach, flexible layouts
- **Component-Based:** Reusable components (header.js, nav.js, chat-button.js)

### 3.2 Backend Technologies

**Runtime and Framework:**

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | JavaScript runtime environment |
| Express.js | 4.18.2 | Web application framework |
| TypeScript | 5.3.3 | Type-safe JavaScript superset |

**Core Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | 2.86.0 | Supabase database client |
| jsonwebtoken | 9.0.2 | JWT token generation/validation |
| bcryptjs | 2.4.3 | Password hashing (planned) |
| multer | 1.4.5-lts.1 | File upload handling |
| cors | 2.8.5 | Cross-origin resource sharing |
| helmet | 8.1.0 | Security headers middleware |
| express-rate-limit | 8.2.1 | API rate limiting |
| nodemailer | 7.0.11 | Email sending functionality |
| socket.io | 4.6.0 | Real-time communication (disabled) |
| dotenv | 16.3.1 | Environment variable management |
| cookie-parser | 1.4.7 | Cookie parsing middleware |

**Development Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| ts-node-dev | 2.0.0 | TypeScript development server |
| @types/express | 4.17.21 | TypeScript type definitions |
| @types/node | 20.19.26 | Node.js type definitions |
| eslint | 8.56.0 | Code linting |
| prettier | 3.1.1 | Code formatting |
| @typescript-eslint/parser | 6.15.0 | TypeScript ESLint parser |

### 3.3 Database and Storage

**Database Management System:**

| Technology | Type | Purpose |
|------------|------|---------|
| PostgreSQL | 15.x | Relational database management |
| Supabase | Platform | Managed PostgreSQL hosting |

**Storage Solutions:**

| Storage Type | Provider | Purpose |
|--------------|----------|---------|
| Cloud Storage | Supabase Storage | Profile pictures, study materials |
| Local Storage | Filesystem | Development/fallback storage |

**Database Features:**
- ACID compliance for data integrity
- Row-level security policies
- Automatic timestamps (created_at, updated_at)
- Foreign key constraints
- Optimized indexes for performance
- JSON support for flexible data

### 3.4 Deployment and Infrastructure

**Hosting and Deployment:**

| Service | Provider | Purpose |
|---------|----------|---------|
| Serverless Functions | Vercel | Backend API hosting |
| Static Hosting | Vercel | Frontend file serving |
| Database Hosting | Supabase | PostgreSQL database |
| File Storage | Supabase | Cloud file storage |
| Version Control | GitHub | Source code management |

**DevOps Tools:**

| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub Actions | CI/CD pipeline (optional) |
| Vercel CLI | Deployment automation |
| npm/npm scripts | Package management and build automation |

### 3.5 Development Tools

**Code Quality:**
- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- TypeScript compiler for type checking
- VS Code for development environment

**Configuration Files:**
- `tsconfig.json` - TypeScript compiler options
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Code formatting rules
- `.env` - Environment variables
- `vercel.json` - Deployment configuration

---

## 4. DATABASE ARCHITECTURE

### 4.1 Database Schema Overview

The MC Tutor database consists of **11 interconnected tables** implementing a normalized relational design:

```
courses ──┐
          │
          ├─→ subjects ──┐
          │              │
users ────┼──────────────┼─→ tutor_subjects
          │              │
          ├─→ sessions ←─┤
          │      │       │
          │      └─→ feedback
          │              │
          ├─→ materials ←┘
          │
          ├─→ tutor_availability
          │
          ├─→ tutor_stats
          │
          ├─→ notifications
          │
          └─→ chats
```

### 4.2 Table Specifications

#### **4.2.1 courses Table**

Stores the six academic programs offered by Mabini College Inc.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| course_id | SERIAL | PRIMARY KEY | Auto-incrementing identifier |
| course_code | VARCHAR(10) | UNIQUE, NOT NULL | Short code (BSA, BSBA, etc.) |
| course_name | VARCHAR(255) | NOT NULL | Full course name |
| description | TEXT | NULL | Course description |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Sample Data:**
- BSA - Bachelor of Science in Accountancy
- BSBA - Bachelor of Science in Business Administration
- BSED - Bachelor of Secondary Education
- BSN - Bachelor of Science in Nursing
- BSCS - Bachelor of Science in Computer Science
- BSCrim - Bachelor of Science in Criminology

#### **4.2.2 users Table**

Central table storing all system users (admins, tutors, tutees).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | SERIAL | PRIMARY KEY | Unique user identifier |
| school_id | VARCHAR(50) | UNIQUE, NOT NULL | Student ID number |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| password | VARCHAR(255) | NOT NULL | User password (currently plain text) |
| pin | VARCHAR(6) | NULL | Chat encryption PIN |
| first_name | VARCHAR(100) | NOT NULL | First name |
| middle_name | VARCHAR(100) | NULL | Middle name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| role | VARCHAR(20) | NOT NULL, CHECK | admin, tutor, or tutee |
| phone | VARCHAR(20) | NULL | Contact number |
| year_level | INTEGER | CHECK (1-4) | Academic year level |
| course_code | VARCHAR(10) | CHECK | BSA, BSBA, BSED, BSN, BSCS, BSCrim |
| profile_picture | TEXT | NULL | URL to profile image |
| status | VARCHAR(20) | DEFAULT 'active' | active, inactive, suspended |
| last_active | TIMESTAMP | NULL | Last activity timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last profile update |

**Indexes:**
- `idx_users_email` on email
- `idx_users_school_id` on school_id
- `idx_users_role` on role
- `idx_users_course_code` on course_code

#### **4.2.3 subjects Table**

Catalog of 120 subjects across all programs (20 per course).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| subject_id | SERIAL | PRIMARY KEY | Unique subject identifier |
| subject_code | VARCHAR(20) | UNIQUE, NOT NULL | Subject code (ACC001, CC010, etc.) |
| subject_name | VARCHAR(255) | NOT NULL | Full subject name |
| course_code | VARCHAR(10) | NOT NULL, CHECK | Associated course |
| description | TEXT | NULL | Subject description |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Subject Distribution:**
- BSA: ACC001 - ACC020 (20 subjects)
- BSBA: BAM001 - BAM020 (20 subjects)
- BSED: ED001 - ED020 (20 subjects)
- BSN: NCM001 - NCM020 (20 subjects)
- BSCS: CC001 - CC020 (20 subjects)
- BSCrim: CRIM001 - CRIM020 (20 subjects)

**Index:**
- `idx_subjects_course_code` on course_code

#### **4.2.4 tutor_subjects Table**

Junction table linking tutors to subjects they teach.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| tutor_subject_id | SERIAL | PRIMARY KEY | Unique identifier |
| tutor_id | INTEGER | FK to users, NOT NULL | Tutor user reference |
| subject_id | INTEGER | FK to subjects, NOT NULL | Subject reference |
| proficiency_level | VARCHAR(20) | CHECK | beginner, intermediate, advanced, expert |
| created_at | TIMESTAMP | DEFAULT NOW() | Association date |

**Constraints:**
- UNIQUE(tutor_id, subject_id) - Prevents duplicate associations
- CASCADE DELETE on tutor_id
- CASCADE DELETE on subject_id

**Indexes:**
- `idx_tutor_subjects_tutor` on tutor_id
- `idx_tutor_subjects_subject` on subject_id

#### **4.2.5 tutor_availability Table**

Stores tutor scheduling preferences by day and time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| availability_id | SERIAL | PRIMARY KEY | Unique identifier |
| tutor_id | INTEGER | FK to users, NOT NULL | Tutor reference |
| day_of_week | VARCHAR(10) | NOT NULL, CHECK | Monday-Sunday |
| start_time | TIME | NOT NULL | Availability start |
| end_time | TIME | NOT NULL | Availability end |
| is_available | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_tutor_availability_tutor` on tutor_id
- `idx_tutor_availability_day` on day_of_week

#### **4.2.6 tutor_stats Table**

Aggregated performance metrics for tutors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| stats_id | SERIAL | PRIMARY KEY | Unique identifier |
| tutor_id | INTEGER | FK to users, UNIQUE | Tutor reference |
| total_sessions | INTEGER | DEFAULT 0 | Total session count |
| completed_sessions | INTEGER | DEFAULT 0 | Completed sessions |
| average_rating | DECIMAL(3,2) | DEFAULT 0.00 | Average rating (1-5) |
| total_hours | DECIMAL(10,2) | DEFAULT 0.00 | Total tutoring hours |
| subjects_taught | INTEGER | DEFAULT 0 | Number of subjects |
| students_helped | INTEGER | DEFAULT 0 | Unique students count |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last statistics update |

**Indexes:**
- `idx_tutor_stats_rating` on average_rating DESC
- `idx_tutor_stats_sessions` on total_sessions DESC

#### **4.2.7 sessions Table**

Core table for tutoring session bookings and tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| session_id | SERIAL | PRIMARY KEY | Unique session identifier |
| tutee_id | INTEGER | FK to users, NOT NULL | Student requesting tutoring |
| tutor_id | INTEGER | FK to users, NOT NULL | Tutor providing service |
| subject_id | INTEGER | FK to subjects | Subject being taught |
| session_date | DATE | NOT NULL | Scheduled date |
| start_time | TIME | NOT NULL | Session start time |
| end_time | TIME | NOT NULL | Session end time |
| session_type | VARCHAR(20) | CHECK | online or physical |
| location | TEXT | NULL | Meeting location/URL |
| notes | TEXT | NULL | Additional notes |
| status | VARCHAR(20) | CHECK | pending, confirmed, completed, cancelled |
| cancellation_reason | TEXT | NULL | Reason if cancelled |
| created_at | TIMESTAMP | DEFAULT NOW() | Booking timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last status update |

**Indexes:**
- `idx_sessions_tutee` on tutee_id
- `idx_sessions_tutor` on tutor_id
- `idx_sessions_subject` on subject_id
- `idx_sessions_status` on status
- `idx_sessions_date` on session_date

#### **4.2.8 materials Table**

Study materials uploaded by tutors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| material_id | SERIAL | PRIMARY KEY | Unique material identifier |
| tutor_id | INTEGER | FK to users, NOT NULL | Uploader reference |
| subject_id | INTEGER | FK to subjects | Associated subject |
| title | VARCHAR(255) | NOT NULL | Material title |
| description | TEXT | NULL | Material description |
| file_url | TEXT | NOT NULL | Storage location URL |
| filename | VARCHAR(255) | NULL | Original filename |
| file_size | BIGINT | NULL | File size in bytes |
| file_type | VARCHAR(100) | NULL | MIME type |
| category | VARCHAR(50) | CHECK | lecture, assignment, quiz, reference, other |
| tags | TEXT[] | NULL | Searchable tags array |
| download_count | INTEGER | DEFAULT 0 | Download tracking |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last modification |

**Allowed File Types:**
- PDF (.pdf)
- Word Documents (.doc, .docx)
- PowerPoint (.ppt, .pptx)
- Text Files (.txt)
- Archives (.zip, .rar)

**Maximum File Size:** 10 MB (10,485,760 bytes)

**Indexes:**
- `idx_materials_tutor` on tutor_id
- `idx_materials_subject` on subject_id
- `idx_materials_category` on category

#### **4.2.9 feedback Table**

Multi-dimensional ratings and comments for completed sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| feedback_id | SERIAL | PRIMARY KEY | Unique feedback identifier |
| session_id | INTEGER | FK to sessions, NOT NULL | Session reference |
| tutee_id | INTEGER | FK to users, NOT NULL | Student giving feedback |
| tutor_id | INTEGER | FK to users, NOT NULL | Tutor receiving feedback |
| communication_rating | INTEGER | CHECK (1-5) | Communication effectiveness |
| knowledge_rating | INTEGER | CHECK (1-5) | Subject expertise |
| punctuality_rating | INTEGER | CHECK (1-5) | Timeliness |
| teaching_style_rating | INTEGER | CHECK (1-5) | Teaching methodology |
| overall_rating | INTEGER | CHECK (1-5) | Overall experience |
| comments | TEXT | NULL | Written feedback |
| created_at | TIMESTAMP | DEFAULT NOW() | Submission timestamp |

**Rating Scale:**
- 1 = Poor
- 2 = Below Average
- 3 = Average
- 4 = Good
- 5 = Excellent

**Indexes:**
- `idx_feedback_session` on session_id
- `idx_feedback_tutor` on tutor_id
- `idx_feedback_tutee` on tutee_id

#### **4.2.10 notifications Table**

In-app notification system for user alerts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | SERIAL | PRIMARY KEY | Unique notification identifier |
| user_id | INTEGER | FK to users, NOT NULL | Recipient user |
| type | VARCHAR(50) | CHECK | session, material, feedback, system, other |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification content |
| related_id | INTEGER | NULL | Related entity ID |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Notification Types:**
- `session` - Session requests, confirmations, cancellations
- `material` - New study materials uploaded
- `feedback` - Feedback received
- `system` - System announcements
- `other` - Miscellaneous notifications

**Indexes:**
- `idx_notifications_user` on user_id
- `idx_notifications_read` on is_read
- `idx_notifications_created` on created_at DESC

#### **4.2.11 chats Table**

Direct messaging between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| chat_id | SERIAL | PRIMARY KEY | Unique message identifier |
| sender_id | INTEGER | FK to users, NOT NULL | Message sender |
| receiver_id | INTEGER | FK to users, NOT NULL | Message recipient |
| message | TEXT | NOT NULL | Message content |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT NOW() | Message timestamp |

**Features:**
- Message encryption support (optional with PIN)
- Conversation threading by sender-receiver pairs
- Unread message tracking
- Message history persistence

**Indexes:**
- `idx_chats_sender` on sender_id
- `idx_chats_receiver` on receiver_id
- `idx_chats_created` on created_at DESC
- `idx_chats_read` on is_read

### 4.3 Database Relationships

**One-to-Many Relationships:**
- users → tutor_subjects (one tutor teaches many subjects)
- users → sessions (as tutor - one tutor has many sessions)
- users → sessions (as tutee - one student books many sessions)
- users → materials (one tutor uploads many materials)
- users → notifications (one user receives many notifications)
- subjects → tutor_subjects (one subject taught by many tutors)
- subjects → sessions (one subject in many sessions)
- subjects → materials (one subject has many materials)
- sessions → feedback (one session gets one feedback)

**Many-to-Many Relationships:**
- users ↔ subjects (through tutor_subjects)
- users ↔ users (through chats - bidirectional messaging)

**Self-Referencing:**
- chats table (sender_id and receiver_id both reference users)

### 4.4 Data Integrity Constraints

**Primary Keys:**
- All tables have auto-incrementing SERIAL primary keys
- Ensures unique identification of records

**Foreign Keys:**
- CASCADE DELETE on tutor_subjects when tutor or subject deleted
- CASCADE DELETE on sessions when tutee or tutor deleted
- SET NULL on sessions when subject deleted (preserves session history)

**Check Constraints:**
- role IN ('admin', 'tutor', 'tutee')
- status IN ('active', 'inactive', 'suspended')
- year_level BETWEEN 1 AND 4
- course_code IN ('BSA', 'BSBA', 'BSED', 'BSN', 'BSCS', 'BSCrim')
- session_type IN ('online', 'physical')
- session_status IN ('pending', 'confirmed', 'completed', 'cancelled')
- proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')
- ratings BETWEEN 1 AND 5

**Unique Constraints:**
- users.school_id (student ID must be unique)
- users.email (email must be unique)
- subjects.subject_code (subject codes unique)
- courses.course_code (course codes unique)
- tutor_subjects(tutor_id, subject_id) (no duplicate tutor-subject pairs)

### 4.5 Indexing Strategy

**Performance Optimization:**
- Primary keys automatically indexed
- Foreign keys indexed for JOIN performance
- Frequently queried columns indexed (email, school_id, role, status)
- Date columns indexed for temporal queries
- Composite indexes on common query patterns

**Index Types:**
- B-tree indexes (default) for equality and range queries
- Partial indexes on is_read flags for unread filtering
- DESC indexes on rating and session counts for leaderboards

---

## 5. FRONTEND ARCHITECTURE

### 5.1 Frontend Structure

The frontend follows a **component-based architecture** with separation of concerns:

```
public/
├── index.html                    # Landing page
├── css/
│   └── style.css                 # Unified stylesheet (2208 lines)
├── html/
│   ├── auth/                     # Authentication pages (4 files)
│   ├── tutee/                    # Student pages (7 files)
│   ├── tutor/                    # Tutor pages (4 files)
│   ├── admin/                    # Admin pages (6 files)
│   ├── shared/                   # Shared pages (2 files)
│   └── system-status.html        # Health check page
└── scripts/
    ├── api.js                    # API client wrapper
    ├── auth.js                   # Authentication utilities
    ├── app.js                    # Application initialization
    ├── utils.js                  # Helper functions
    ├── socket.js                 # Socket.IO client (disabled)
    └── components/               # Reusable UI components
        ├── header.js             # Page header
        ├── nav.js                # Main navigation
        ├── nav-menu.js           # Navigation menu
        ├── chat-button.js        # Floating chat button
        └── floatingChat.js       # Chat interface
```

### 5.2 Page Organization

**Authentication Pages (4 pages):**
1. `login.html` - User login form
2. `register.html` - New user registration
3. `forgot-password.html` - Password reset request
4. `reset-password.html` - Password reset form

**Student/Tutee Pages (7 pages):**
1. `student-dashboard.html` - Overview, stats, upcoming sessions
2. `student-find-tutors.html` - Search and browse tutors
3. `student-book-session.html` - Session booking form
4. `student-my-sessions.html` - Session history and management
5. `student-study-materials.html` - Browse and download materials
6. `student-give-feedback.html` - Submit feedback form
7. `student-my-feedback.html` - Feedback history

**Tutor Pages (4 pages):**
1. `tutor-dashboard.html` - Pending requests, upcoming sessions
2. `tutor-my-subjects.html` - Manage teaching subjects
3. `tutor-sessions.html` - All sessions management
4. `tutor-upload-materials.html` - Upload study materials

**Admin Pages (6 pages):**
1. `admin-dashboard.html` - System statistics and overview
2. `admin-manage-users.html` - User CRUD operations
3. `admin-manage-subjects.html` - Subject catalog management
4. `admin-manage-sessions.html` - Session oversight
5. `admin-view-sessions.html` - Detailed session analytics
6. `admin-view-materials.html` - Material moderation

**Shared Pages (2 pages):**
1. `profile.html` - User profile management
2. `messenger.html` - Direct messaging interface

**Utility Pages (1 page):**
1. `system-status.html` - API health and system diagnostics

### 5.3 JavaScript Module System

**Core Modules:**

**api.js** - Centralized API communication
```javascript
const API = {
  auth: { register, login, logout, getCurrentUser },
  users: { getProfile, updateProfile, uploadProfilePicture },
  sessions: { getAll, create, confirm, cancel, complete },
  tutors: { search, getById, getSubjects },
  subjects: { getAll, getByCourse },
  materials: { getAll, upload, download, delete },
  feedback: { submit, getMy, getReceived },
  chat: { getConversations, getMessages, send },
  admin: { getUsers, createUser, updateUser, deleteUser, getStats }
}
```

**auth.js** - Authentication state management
```javascript
- checkAuth() - Verify user authentication
- getUser() - Get current user data
- logout() - Clear session and redirect
- isRole(role) - Check user role
- redirectIfNotAuthenticated()
- redirectIfAuthenticated()
```

**utils.js** - Utility functions
```javascript
- formatDate(date) - Date formatting
- formatTime(time) - Time formatting
- showNotification(message, type) - Toast notifications
- validateEmail(email) - Email validation
- validateForm(formData) - Form validation
- debounce(func, delay) - Function debouncing
- formatFileSize(bytes) - Human-readable file sizes
```

**app.js** - Application initialization
```javascript
- DOMContentLoaded event handler
- Global error handling
- Component initialization
- Route-based page logic
```

### 5.4 Component Architecture

**Reusable Components:**

**header.js** - Dynamic page header
- Displays user name and role
- Profile picture
- Logout functionality
- Responsive design

**nav.js / nav-menu.js** - Navigation system
- Role-based menu items
- Active page highlighting
- Mobile responsive menu
- Dropdown submenus

**chat-button.js** - Floating chat launcher
- Persistent across pages
- Unread message counter
- Click to open messenger
- Conditional visibility

**floatingChat.js** - Chat interface
- Message display
- Real-time updates (polling)
- Send message form
- Conversation switching

### 5.5 Responsive Design

**Breakpoints:**
```css
/* Mobile-first approach */
Mobile: < 768px (default)
Tablet: 768px - 1024px
Desktop: > 1024px
```

**Techniques:**
- Flexbox for layouts
- CSS Grid for complex layouts
- Media queries for responsiveness
- Viewport meta tag
- Relative units (rem, em, %)
- Mobile-optimized forms

### 5.6 State Management

**Client-Side Storage:**

**localStorage:**
- `token` - JWT access token
- `user` - User profile data
- `theme` - UI theme preference (future)

**sessionStorage:**
- Temporary form data
- Search filters
- Pagination state

**In-Memory State:**
- Current page data
- API response cache
- UI component state

---

## 6. BACKEND ARCHITECTURE

### 6.1 Backend Structure

```
server/src/
├── server.ts                     # Application entry point
├── config/
│   └── database.ts               # Supabase client configuration
├── controllers/                  # Request handlers (11 files)
│   ├── adminController.ts
│   ├── authController.ts
│   ├── chatController.ts
│   ├── courseController.ts
│   ├── feedbackController.ts
│   ├── materialController.ts
│   ├── notificationController.ts
│   ├── sessionController.ts
│   ├── subjectController.ts
│   ├── tutorController.ts
│   └── userController.ts
├── routes/                       # API route definitions (13 files)
│   ├── adminRoutes.ts
│   ├── authRoutes.ts
│   ├── chatRoutes.ts
│   ├── courseRoutes.ts
│   ├── feedbackRoutes.ts
│   ├── materialRoutes.ts
│   ├── notificationRoutes.ts
│   ├── searchRoutes.ts
│   ├── sessionRoutes.ts
│   ├── subjectRoutes.ts
│   ├── testRoutes.ts
│   ├── tutorRoutes.ts
│   └── userRoutes.ts
├── middleware/                   # Express middleware
│   ├── authMiddleware.ts         # JWT verification
│   ├── errorHandler.ts           # Global error handler
│   ├── notFoundHandler.ts        # 404 handler
│   └── rateLimiter.ts            # Rate limiting
├── services/                     # Business logic (9 files)
│   ├── AuthService.ts
│   ├── ChatService.ts
│   ├── emailService.ts
│   ├── EncryptionService.ts
│   ├── MaterialsService.ts
│   ├── NotificationService.ts
│   ├── SessionPreferencesService.ts
│   └── StorageService.ts
├── sockets/
│   └── chatSocket.ts             # Socket.IO handlers (disabled)
├── types/
│   └── index.ts                  # TypeScript type definitions
└── utils/                        # Utility functions
    ├── fileSystem.ts             # File operations
    ├── jwt.ts                    # JWT utilities
    ├── schemaHelpers.ts          # Database helpers
    └── validation.ts             # Input validation
```

### 6.2 Request Processing Flow

```
Client Request
    ↓
Express.js Middleware Pipeline
    ↓
├── CORS Middleware (allow origins)
├── Helmet (security headers)
├── Body Parser (JSON/URL-encoded)
├── Cookie Parser
├── Rate Limiter (API protection)
    ↓
Route Matching
    ↓
Authentication Middleware (if protected route)
    ├── Extract JWT from Authorization header
    ├── Verify token signature
    ├── Decode user payload
    ├── Attach user to request object
    └── Check user role (if role-specific)
    ↓
Controller Function
    ├── Validate request parameters
    ├── Call Service Layer
    └── Format response
    ↓
Service Layer
    ├── Business logic execution
    ├── Database queries (Supabase)
    ├── External service calls
    └── Data transformation
    ↓
Response
    ├── Success (200, 201, etc.)
    ├── Client Error (400, 401, 403, 404)
    └── Server Error (500)
    ↓
Error Handler Middleware (if error thrown)
    ├── Log error details
    ├── Format error response
    └── Send to client
    ↓
Response sent to Client
```

### 6.3 Controller Layer

Controllers handle HTTP requests and responses:

**Responsibilities:**
- Parse request parameters (body, query, params)
- Validate input data
- Call appropriate service methods
- Format and send responses
- Handle controller-specific errors

**Example Structure:**
```typescript
export const exampleController = async (req: Request, res: Response) => {
  try {
    // 1. Extract and validate input
    const { param1, param2 } = req.body;
    
    // 2. Call service layer
    const result = await ExampleService.performOperation(param1, param2);
    
    // 3. Send success response
    res.status(200).json({
      success: true,
      data: result,
      message: 'Operation successful'
    });
  } catch (error) {
    // 4. Handle errors
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

### 6.4 Service Layer

Services contain business logic and database interactions:

**Responsibilities:**
- Implement business rules
- Execute database queries
- Coordinate between multiple data sources
- Perform data transformations
- Handle service-specific logic

**Key Services:**

**AuthService:**
- User registration
- Login authentication
- Password reset
- Token generation
- Session management

**ChatService:**
- Message encryption/decryption
- Conversation management
- Unread count calculation
- Message history retrieval

**MaterialsService:**
- File upload processing
- Material metadata management
- Download tracking
- File validation

**NotificationService:**
- Notification creation
- Delivery management
- Read status tracking
- Bulk notifications

**StorageService:**
- Cloud file upload (Supabase)
- Local file storage (development)
- File deletion
- URL generation

### 6.5 Middleware Components

**authMiddleware.ts:**
```typescript
- verifyToken() - JWT validation
- requireAuth() - Protect routes
- requireRole(role) - Role-based access
- optionalAuth() - Attach user if authenticated
```

**rateLimiter.ts:**
```typescript
- apiLimiter - General API rate limit (100 req/15min)
- authLimiter - Strict auth endpoint limit (5 req/15min)
- uploadLimiter - File upload limit (10 req/hour)
```

**errorHandler.ts:**
```typescript
- Global error catching
- Error logging
- Standardized error responses
- Environment-specific error details
```

**notFoundHandler.ts:**
```typescript
- 404 error for undefined routes
- Helpful error messages
- Route suggestion (future)
```

### 6.6 TypeScript Type System

**Type Definitions:**
```typescript
interface User {
  user_id: number;
  school_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'tutor' | 'tutee';
  course_code: string;
  year_level: number;
  // ... additional fields
}

interface Session {
  session_id: number;
  tutee_id: number;
  tutor_id: number;
  subject_id: number;
  session_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  // ... additional fields
}

interface Material {
  material_id: number;
  tutor_id: number;
  subject_id: number;
  title: string;
  file_url: string;
  file_type: string;
  // ... additional fields
}
```

**Request/Response Types:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  message?: string;
}

interface AuthRequest extends Request {
  user?: User;
}
```

---

## 7. API DESIGN AND ENDPOINTS

### 7.1 API Design Principles

**RESTful Architecture:**
- Resource-based URLs
- HTTP method semantics (GET, POST, PUT, DELETE)
- Stateless communication
- Standard HTTP status codes

**Response Format:**
```json
{
  "success": true|false,
  "data": { /* response data */ },
  "message": "Success message",
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

**Status Code Standards:**
- 200 OK - Successful GET, PUT requests
- 201 Created - Successful POST (resource created)
- 400 Bad Request - Invalid input
- 401 Unauthorized - Authentication required
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource doesn't exist
- 500 Internal Server Error - Server-side error

### 7.2 Authentication Endpoints

**Base Path:** `/api/auth`

| Method | Endpoint | Description | Auth | Request Body |
|--------|----------|-------------|------|--------------|
| POST | `/register` | Create new account | No | school_id, email, password, first_name, last_name, role, course_code, year_level |
| POST | `/login` | User login | No | email, password |
| GET | `/me` | Get current user | Yes | - |
| POST | `/logout` | Logout user | Yes | - |
| POST | `/forgot-password` | Request password reset | No | email |
| POST | `/reset-password` | Reset password | No | token, newPassword |
| POST | `/heartbeat` | Update last_active | Yes | - |

### 7.3 User Management Endpoints

**Base Path:** `/api/users`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/profile` | Get user profile | Yes | All |
| PUT | `/profile` | Update profile | Yes | All |
| PUT | `/change-password` | Change password | Yes | All |
| POST | `/profile/picture` | Upload profile pic | Yes | All |

### 7.4 Session Management Endpoints

**Base Path:** `/api/sessions`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | Get user sessions | Yes | All |
| POST | `/` | Create session booking | Yes | Tutee |
| PUT | `/:id/confirm` | Confirm session | Yes | Tutor |
| PUT | `/:id/cancel` | Cancel session | Yes | All |
| PUT | `/:id/complete` | Mark completed | Yes | Tutor |
| GET | `/booking-options` | Get booking options | Yes | All |
| POST | `/preferences` | Save tutor preferences | Yes | Tutor |

### 7.5 Complete API Reference

Due to length constraints, the complete 60+ endpoint documentation is available in the system. Key endpoint categories include:

- **Tutor Endpoints** (`/api/tutors`) - Search, profiles, subjects
- **Subject Endpoints** (`/api/subjects`) - Catalog browsing
- **Material Endpoints** (`/api/materials`) - Upload, download, manage
- **Feedback Endpoints** (`/api/feedback`) - Ratings and reviews
- **Chat Endpoints** (`/api/chat`) - Messaging functionality
- **Notification Endpoints** (`/api/notifications`) - Alert management
- **Admin Endpoints** (`/api/admin`) - System administration
- **Course Endpoints** (`/api/courses`) - Course information

---

## 8. SECURITY ARCHITECTURE

### 8.1 Authentication Mechanism

**JWT (JSON Web Tokens):**
- Stateless authentication
- Token-based session management
- 7-day token expiration
- Signed with secret key

**Token Structure:**
```json
{
  "userId": 12345,
  "email": "student@mabinicolleges.edu.ph",
  "role": "tutee",
  "iat": 1702233600,
  "exp": 1702838400
}
```

**Token Flow:**
1. User logs in with credentials
2. Server validates and generates JWT
3. Token sent to client
4. Client stores token (localStorage + cookie)
5. Client includes token in subsequent requests
6. Server verifies token on protected routes

### 8.2 Authorization System

**Role-Based Access Control (RBAC):**

**Roles:**
- `admin` - Full system access
- `tutor` - Teaching capabilities
- `tutee` - Learning capabilities

**Permission Matrix:**

| Feature | Admin | Tutor | Tutee |
|---------|-------|-------|-------|
| User Management | ✅ | ❌ | ❌ |
| Subject Management | ✅ | ❌ | ❌ |
| View All Sessions | ✅ | ❌ | ❌ |
| Manage Own Subjects | ❌ | ✅ | ❌ |
| Upload Materials | ❌ | ✅ | ❌ |
| Confirm Sessions | ❌ | ✅ | ❌ |
| Book Sessions | ❌ | ❌ | ✅ |
| Submit Feedback | ❌ | ❌ | ✅ |
| View Materials | ✅ | ✅ | ✅ |
| Messaging | ✅ | ✅ | ✅ |

### 8.3 Security Measures

**Implemented:**
- ✅ JWT-based authentication
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Rate limiting (API protection)
- ✅ File type validation
- ✅ File size restrictions (10MB)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (input sanitization)

**Pending Implementation:**
- ⚠️ Password hashing (bcrypt) - **CRITICAL**
- ⚠️ Email verification
- ⚠️ Account lockout after failed logins
- ⚠️ CSRF protection
- ⚠️ Two-factor authentication

### 8.4 Data Protection

**In Transit:**
- HTTPS encryption (production)
- Secure cookie flags
- TLS 1.2+ requirement

**At Rest:**
- Database encryption (Supabase managed)
- Optional message encryption (PIN-based)
- Secure file storage (Supabase Storage)

**Privacy:**
- User data access controls
- Profile visibility settings
- Message privacy (point-to-point)

---

## 9. CLOUD INFRASTRUCTURE

### 9.1 Deployment Architecture

```
GitHub Repository
    ↓ (git push)
Vercel Platform
    ├── Build Process
    │   ├── Install dependencies
    │   ├── TypeScript compilation
    │   └── Generate serverless functions
    ├── Deployment
    │   ├── Frontend (static files) → CDN
    │   ├── Backend (API) → Serverless Functions
    │   └── Environment variables injection
    └── Production URLs
        ├── https://mc-tutor.vercel.app
        └── Custom domain (if configured)

Supabase Platform
    ├── PostgreSQL Database (managed)
    ├── Cloud Storage (files)
    ├── Row-Level Security
    └── Automatic backups
```

### 9.2 Vercel Configuration

**vercel.json:**
```json
{
  "version": 2,
  "buildCommand": "cd server && npm install && npm run build",
  "functions": {
    "api/index.js": { "maxDuration": 10 }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/", "destination": "/public/html/index.html" }
  ]
}
```

**Features:**
- Automatic deployments on git push
- Environment variable management
- Custom domain support
- SSL certificate automation
- Global CDN for static files
- Serverless function auto-scaling

### 9.3 Supabase Integration

**Database:**
- Managed PostgreSQL 15.x
- Connection pooling (PgBouncer)
- Automatic backups
- Point-in-time recovery
- Row-level security policies

**Storage:**
- S3-compatible object storage
- Public/private buckets
- CDN-accelerated delivery
- Automatic file optimization
- 50GB free tier storage

**Authentication (not used - custom JWT):**
- Available but not implemented
- Using custom authentication system instead

---

## 10. SYSTEM INTEGRATION

### 10.1 Internal Component Integration

**Frontend ↔ Backend:**
- RESTful API communication
- JSON data exchange
- JWT authentication
- CORS-enabled requests

**Backend ↔ Database:**
- Supabase JavaScript client
- Parameterized queries
- Connection pooling
- Transaction support

**Backend ↔ Storage:**
- Supabase Storage SDK
- File upload/download
- URL generation
- Access control

### 10.2 External Service Integration

**Email Service:**
- SMTP configuration (Gmail/custom)
- Password reset emails
- Notification emails
- HTML email templates

**Version Control:**
- GitHub repository
- Branch management
- Pull request workflow
- Issue tracking

**Monitoring (Future):**
- Error logging
- Performance metrics
- User analytics
- Uptime monitoring

---

**END OF PART 2**

*Continue to Part 3: Comparative Analysis*
