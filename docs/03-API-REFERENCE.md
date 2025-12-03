# 📡 API REFERENCE

Complete documentation of all API endpoints in MC Tutor platform.

**Base URL (Local):** `http://localhost:3000/api`
**Base URL (Production):** `https://your-app.vercel.app/api`

---

## 🔐 AUTHENTICATION

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Token:
Use the login endpoint to get a token. Token expires in 7 days (configurable).

---

## 📚 TABLE OF CONTENTS

1. [Authentication](#authentication-endpoints)
2. [Users](#user-endpoints)
3. [Admin](#admin-endpoints)
4. [Subjects](#subject-endpoints)
5. [Tutors](#tutor-endpoints)
6. [Sessions](#session-endpoints)
7. [Materials](#materials-endpoints)
8. [Feedback](#feedback-endpoints)
9. [Chat](#chat-endpoints)
10. [Notifications](#notification-endpoints)

---

## 🔑 AUTHENTICATION ENDPOINTS

### Register New User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "studentId": "2021-12345",
  "email": "john@example.com",
  "password": "securepass123",
  "confirmPassword": "securepass123",
  "fullName": "John Doe",
  "role": "tutee",
  "phone": "09123456789",
  "yearLevel": "1st Year",
  "course": "BSIT"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "studentId": "2021-12345",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "tutee"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

---

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123",
  "role": "tutee"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user details */ },
    "token": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "message": "Login successful"
}
```

---

### Get Current User
```http
GET /api/auth/me
```

**Headers:** `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "studentId": "2021-12345",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "tutee",
      "course": "BSIT",
      "yearLevel": "1st Year"
    }
  }
}
```

---

### Refresh Token
```http
POST /api/auth/refresh
```

**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

---

### Logout
```http
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer TOKEN`

---

## 👤 USER ENDPOINTS

### Get User Profile
```http
GET /api/users/profile
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Update Profile
```http
PUT /api/users/profile
```

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "full_name": "John Updated",
  "phone": "09987654321",
  "course": "BSCS",
  "year_level": "2nd Year",
  "bio": "Computer Science student"
}
```

---

### Upload Profile Picture
```http
POST /api/users/profile/picture
```

**Headers:**
- `Authorization: Bearer TOKEN`
- `Content-Type: multipart/form-data`

**Form Data:**
- `profile_picture`: (file) Image file (max 2MB)

---

### Change Password
```http
PUT /api/users/password
```

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass456",
  "confirm_password": "newpass456"
}
```

---

## 👑 ADMIN ENDPOINTS

**All admin endpoints require admin role.**

### Get All Users
```http
GET /api/admin/users?role=tutor&status=active&search=john&page=1&limit=20
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Query Parameters:**
- `role` (optional): Filter by role (admin|tutor|tutee)
- `status` (optional): Filter by status (active|inactive)
- `search` (optional): Search by name, email, or student ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "user_id": 1,
      "student_id": "2021-12345",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "tutor",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### Create User (Admin)
```http
POST /api/admin/users
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Body:**
```json
{
  "student_id": "2021-99999",
  "email": "newuser@example.com",
  "password": "temppass123",
  "full_name": "New User",
  "role": "tutor",
  "phone": "09111111111",
  "year_level": "3rd Year",
  "course": "BSIT",
  "status": "active"
}
```

---

### Update User (Admin)
```http
PUT /api/admin/users/:id
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Body:** (all fields optional)
```json
{
  "full_name": "Updated Name",
  "email": "updated@example.com",
  "role": "tutor",
  "status": "inactive"
}
```

---

### Delete User (Admin)
```http
DELETE /api/admin/users/:id?permanent=false
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Query Parameters:**
- `permanent` (optional): If "true", permanently deletes user. Otherwise soft-deletes (sets status to inactive).

---

### Reset User Password (Admin)
```http
POST /api/admin/users/:id/reset-password
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Body:**
```json
{
  "new_password": "newtemp123"
}
```

---

### Create Subject (Admin)
```http
POST /api/admin/subjects
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Body:**
```json
{
  "subject_code": "IT-111",
  "subject_name": "Introduction to Programming",
  "course": "BSIT",
  "description": "Basic programming concepts"
}
```

---

### Update Subject (Admin)
```http
PUT /api/admin/subjects/:id
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

---

### Delete Subject (Admin)
```http
DELETE /api/admin/subjects/:id
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

---

### Get System Statistics (Admin)
```http
GET /api/admin/stats
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 150,
      "active": 145,
      "inactive": 5,
      "admins": 2,
      "tutors": 48,
      "tutees": 100
    },
    "sessions": {
      "total": 320,
      "pending": 15,
      "confirmed": 45,
      "completed": 250,
      "cancelled": 10
    },
    "subjects": 25,
    "materials": 120,
    "feedback": {
      "total": 180,
      "averageRating": "4.5"
    }
  }
}
```

---

### Get Activity Log (Admin)
```http
GET /api/admin/activity?limit=20
```

**Headers:** `Authorization: Bearer ADMIN_TOKEN`

---

## 📖 SUBJECT ENDPOINTS

### Get All Subjects
```http
GET /api/subjects?course=BSIT
```

**Query Parameters:**
- `course` (optional): Filter by course

---

### Get Subject by ID
```http
GET /api/subjects/:id
```

---

### Get Subjects by Course
```http
GET /api/subjects/course/:course
```

---

### Get Available Courses
```http
GET /api/subjects/courses
```

**Response (200):**
```json
{
  "success": true,
  "courses": ["BSIT", "BSCS", "BSIS", "ACT", "BSEMC"]
}
```

---

## 👨‍🏫 TUTOR ENDPOINTS

### Search Tutors
```http
GET /api/tutors/search?subject_id=1&course=BSIT&search=john&page=1&limit=20
```

**Query Parameters:**
- `subject_id` (optional): Filter by subject
- `course` (optional): Filter by course
- `search` (optional): Search by name or email
- `page`, `limit`: Pagination

---

### Get Tutor by ID
```http
GET /api/tutors/:id
```

**Response includes tutor info + subjects they teach**

---

### Get Tutor Subjects
```http
GET /api/tutors/:id/subjects
```

---

### Add Subject to Tutor (Tutor Only)
```http
POST /api/tutors/subjects
```

**Headers:** `Authorization: Bearer TUTOR_TOKEN`

**Body:**
```json
{
  "subject_id": 5
}
```

---

### Remove Subject from Tutor (Tutor Only)
```http
DELETE /api/tutors/subjects/:subjectId
```

**Headers:** `Authorization: Bearer TUTOR_TOKEN`

---

## 📅 SESSION ENDPOINTS

### Get My Sessions
```http
GET /api/sessions?status=pending&page=1&limit=20
```

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
- `status` (optional): Filter by status (pending|confirmed|completed|cancelled)
- `page`, `limit`: Pagination

**Response:** Returns sessions for current user (as tutor or tutee based on role)

---

### Create Session (Student Only)
```http
POST /api/sessions
```

**Headers:** `Authorization: Bearer TUTEE_TOKEN`

**Body:**
```json
{
  "tutor_id": 5,
  "subject_id": 10,
  "session_type": "online",
  "session_date": "2025-12-15",
  "start_time": "14:00",
  "end_time": "15:00",
  "location": "Google Meet",
  "notes": "Need help with loops"
}
```

---

### Confirm Session (Tutor Only)
```http
PUT /api/sessions/:id/confirm
```

**Headers:** `Authorization: Bearer TUTOR_TOKEN`

---

### Cancel Session
```http
PUT /api/sessions/:id/cancel
```

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "reason": "Schedule conflict"
}
```

---

### Complete Session (Tutor Only)
```http
PUT /api/sessions/:id/complete
```

**Headers:** `Authorization: Bearer TUTOR_TOKEN`

---

### Get Session Options (Tutor Availability)
```http
GET /api/sessions/options/:tutorStudentId/:subjectCode
```

**Response:** Returns tutor's availability preferences for booking

---

### Save Session Preferences (Tutor Only)
```http
POST /api/sessions/preferences
```

**Headers:** `Authorization: Bearer TUTOR_TOKEN`

**Body:**
```json
{
  "subject_code": "IT-111",
  "session_type": "both",
  "available_days": ["Monday", "Wednesday", "Friday"],
  "time_slots": ["14:00-16:00", "18:00-20:00"],
  "location": "Room 301 or Google Meet",
  "notes": "Prefer afternoon sessions"
}
```

---

## 📚 MATERIALS ENDPOINTS

### Get Materials
```http
GET /api/materials?subject_id=5&tutor_student_id=2021-12345&search=arrays
```

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
- `subject_id` (optional): Filter by subject
- `tutor_student_id` (optional): Filter by tutor
- `search` (optional): Search in title/description

---

### Upload Material (Tutor Only)
```http
POST /api/materials/upload
```

**Headers:**
- `Authorization: Bearer TUTOR_TOKEN`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: (file) PDF, DOC, PPT, ZIP, etc. (max 10MB)
- `subject_id`: (number) Subject ID
- `title`: (string) Material title
- `description`: (string) Optional description

---

### Download Material
```http
GET /api/materials/:id/download?tutor_student_id=2021-12345&subject_id=5
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Delete Material (Tutor Only - Own Materials)
```http
DELETE /api/materials/:id?subject_id=5
```

**Headers:** `Authorization: Bearer TUTOR_TOKEN`

---

## ⭐ FEEDBACK ENDPOINTS

### Submit Feedback (Student Only)
```http
POST /api/feedback
```

**Headers:** `Authorization: Bearer TUTEE_TOKEN`

**Body:**
```json
{
  "session_id": 42,
  "rating": 5,
  "comment": "Excellent tutor! Very helpful."
}
```

---

### Get Feedback for Tutor
```http
GET /api/feedback/tutor/:tutorId
```

**Response includes all feedback + average rating**

---

### Get My Submitted Feedback (Student)
```http
GET /api/feedback/my
```

**Headers:** `Authorization: Bearer TUTEE_TOKEN`

---

### Get Received Feedback (Tutor)
```http
GET /api/feedback/received
```

**Headers:** `Authorization: Bearer TUTOR_TOKEN`

---

## 💬 CHAT ENDPOINTS

### Get All Conversations
```http
GET /api/chat/conversations
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Get Messages in Conversation
```http
GET /api/chat/messages/:otherStudentId
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Send Message
```http
POST /api/chat/send
```

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "receiver_student_id": "2021-54321",
  "message": "Hello! When is our next session?"
}
```

---

### Mark Messages as Read
```http
PUT /api/chat/mark-read/:otherStudentId
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Get Unread Count
```http
GET /api/chat/unread/:otherStudentId
```

**Headers:** `Authorization: Bearer TOKEN`

---

## 🔔 NOTIFICATION ENDPOINTS

### Get All Notifications
```http
GET /api/notifications?unread_only=true
```

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
- `unread_only` (optional): If "true", returns only unread notifications

---

### Get Unread Count
```http
GET /api/notifications/unread/count
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Mark Notification as Read
```http
PUT /api/notifications/:id/read
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Mark All as Read
```http
PUT /api/notifications/read-all
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Delete Notification
```http
DELETE /api/notifications/:id
```

**Headers:** `Authorization: Bearer TOKEN`

---

### Delete All Notifications
```http
DELETE /api/notifications
```

**Headers:** `Authorization: Bearer TOKEN`

---

## 🚨 ERROR RESPONSES

### Standard Error Format:
```json
{
  "success": false,
  "error": {
    "message": "Error description here"
  }
}
```

### Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in or invalid token)
- `403` - Forbidden (wrong role/permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## 🔒 RATE LIMITING

Different limits for different endpoint types:

- **General API:** 100 requests per 15 minutes per IP
- **Authentication:** 5 attempts per 15 minutes per IP
- **File Upload:** 10 uploads per hour per IP
- **Chat:** 30 messages per minute per IP

---

## 🌐 WEBSOCKET EVENTS (Chat)

Connect to: `wss://your-app.vercel.app` or `ws://localhost:3000`

### Client → Server Events:
- `join_conversation`: Join a chat room
- `send_message`: Send a message
- `typing_start`: User started typing
- `typing_stop`: User stopped typing
- `mark_read`: Mark messages as read

### Server → Client Events:
- `new_message`: New message received
- `user_typing`: Other user is typing
- `messages_read`: Messages were read
- `user_online`: User came online
- `user_offline`: User went offline
- `message_notification`: New message notification

---

**Need more help?** Check the [Troubleshooting Guide](05-TROUBLESHOOTING.md) or [Getting Started](01-GETTING-STARTED.md).
