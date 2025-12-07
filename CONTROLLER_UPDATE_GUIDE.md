# Database Migration & Controller Update Guide

## Overview
The database schema has been updated to improve data integrity and align with project requirements. This guide explains how to update controllers and services to work with the new schema.

## Key Schema Changes

### 1. Users Table
```typescript
// OLD
user.course: string         // e.g., "BSA", "BSBA"
user.year_level: string     // e.g., "1", "2nd Year"
user.chat_pin_hash: string

// NEW  
user.course_id: number      // Foreign key to courses table
user.year_level: number     // 1, 2, 3, or 4
user.chat_pin: string       // Plain text (no hashing yet)
```

### 2. Subjects Table
```typescript
// OLD
subject.course: string      // e.g., "BSCS"

// NEW
subject.course_id: number   // Foreign key to courses table
subject.year_level: number  // 1, 2, 3, or 4
```

### 3. Sessions Table
```typescript
// OLD
session.session_time: string    // e.g., "2:00 PM"
session.status: 'pending' | 'confirmed' | 'completed' | 'cancelled'

// NEW
session.session_time: TIME      // e.g., "14:00:00"
session.status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'completed' | 'cancelled'
session.duration_minutes: number
session.meeting_link: string
session.tutee_notes: string
session.tutor_notes: string
```

## Migration Strategy

### Phase 1: Run Database Migrations
✅ Already completed - migrations created in `server/migrations/`

### Phase 2: Update TypeScript Types
✅ Already completed - `server/src/types/index.ts` updated

### Phase 3: Update Controllers (THIS PHASE)

## Controller Update Instructions

### A. Course-Related Updates

#### Before (OLD):
```typescript
// In authController.ts, userController.ts, etc.
const { course } = req.body;
// Direct assignment
course: course
```

#### After (NEW):
```typescript
import { getCourseIdByCode } from './courseController.js';

const { course } = req.body;  // Still receives course_code from frontend
const course_id = await getCourseIdByCode(course);

if (!course_id) {
  return res.status(400).json({
    success: false,
    error: { message: 'Invalid course code' }
  });
}

// Use course_id in database operations
course_id: course_id
```

### B. Year Level Updates

#### Before (OLD):
```typescript
year_level: req.body.year_level  // string: "1", "2nd Year", etc.
```

#### After (NEW):
```typescript
// Convert string to integer
const year_level = parseInt(req.body.year_level);

// Validate
if (!year_level || year_level < 1 || year_level > 4) {
  return res.status(400).json({
    success: false,
    error: { message: 'Year level must be 1, 2, 3, or 4' }
  });
}

year_level: year_level
```

### C. Session Time Updates

#### Before (OLD):
```typescript
session_time: "2:00 PM"  // string
```

#### After (NEW):
```typescript
// Convert to 24-hour TIME format
function convertTo24Hour(time: string): string {
  // If already in 24-hour format (HH:MM or HH:MM:SS)
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
    return time.includes(':') ? time : `${time}:00`;
  }
  
  // Convert 12-hour to 24-hour
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  }
  
  return time;
}

session_time: convertTo24Hour(req.body.session_time)
```

## Specific Controller Updates

### 1. authController.ts

```typescript
// register function
export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      school_id, email, password, confirm_password,
      first_name, middle_name, last_name, role,
      phone, year_level, course,  // course is course_code from frontend
    } = req.body;

    // Validate year_level as number
    const yearLevelInt = parseInt(year_level);
    if (!yearLevelInt || yearLevelInt < 1 || yearLevelInt > 4) {
      return res.status(400).json({
        success: false,
        error: { message: 'Year level must be 1, 2, 3, or 4' },
      });
    }

    // Get course_id from course_code
    const course_id = await getCourseIdByCode(course);
    if (!course_id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid course code' },
      });
    }

    const result = await authService.register({
      school_id,
      email,
      password,
      first_name,
      middle_name,
      last_name,
      role,
      phone,
      year_level: yearLevelInt,
      course_id: course_id,  // Use course_id instead of course
    });

    // ... rest of code
  }
};
```

### 2. userController.ts

```typescript
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user?.user_id;
    const { first_name, middle_name, last_name, phone, course, year_level, bio } = req.body;

    const updateData: any = { updated_at: new Date().toISOString() };

    if (first_name) updateData.first_name = sanitizeInput(first_name);
    if (middle_name !== undefined) updateData.middle_name = middle_name ? sanitizeInput(middle_name) : null;
    if (last_name) updateData.last_name = sanitizeInput(last_name);
    if (phone) updateData.phone = sanitizeInput(phone);
    if (bio !== undefined) updateData.bio = bio ? sanitizeInput(bio) : null;

    // Handle course_id
    if (course) {
      const course_id = await getCourseIdByCode(course);
      if (!course_id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid course code' },
        });
      }
      updateData.course_id = course_id;
    }

    // Handle year_level as integer
    if (year_level) {
      const yearLevelInt = parseInt(year_level);
      if (!yearLevelInt || yearLevelInt < 1 || yearLevelInt > 4) {
        return res.status(400).json({
          success: false,
          error: { message: 'Year level must be 1, 2, 3, or 4' },
        });
      }
      updateData.year_level = yearLevelInt;
    }

    // ... rest of update logic
  }
};
```

### 3. subjectController.ts

```typescript
// Update getCourses to use new courses table
export const getCourses = async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('course_id, course_code, course_name')
      .order('course_code');

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch courses' });
    }

    res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

// Update getSubjectsByCourse
export const getSubjectsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { course } = req.params;  // This is course_code

    // Get course_id
    const course_id = await getCourseIdByCode(course);
    if (!course_id) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('course_id', course_id)
      .order('subject_code');

    // ... rest of code
  }
};
```

### 4. sessionController.ts

```typescript
export const createSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const tuteeId = req.user?.user_id;
    const {
      tutor_id,
      subject_id,
      session_date,
      session_time,  // Will be in 12-hour or 24-hour format
      duration_minutes = 60,
      session_type,
      location,
      meeting_link,
      tutee_notes
    } = req.body;

    // Convert session_time to TIME format
    const sessionTime = convertTo24Hour(session_time);

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        tutee_id: tuteeId,
        tutor_id,
        subject_id,
        session_date,
        session_time: sessionTime,
        duration_minutes,
        session_type,
        location,
        meeting_link,
        tutee_notes,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    // ... rest of code
  }
};
```

## Frontend Updates Required

### 1. Registration/Profile Forms
The frontend still sends `course` as course_code (e.g., "BSA"), which is fine.
Backend will convert to course_id.

### 2. Year Level Dropdowns
Update to send numeric values:
```html
<select name="year_level">
  <option value="1">1st Year</option>
  <option value="2">2nd Year</option>
  <option value="3">3rd Year</option>
  <option value="4">4th Year</option>
</select>
```

### 3. Display Course Names
When displaying user data, you'll need to join with courses table or fetch course details:

```typescript
// In API response, include course details
SELECT users.*, courses.course_code, courses.course_name
FROM users
LEFT JOIN courses ON users.course_id = courses.course_id
```

## Testing Checklist

- [ ] User registration with new course_id
- [ ] User profile update with course and year_level
- [ ] Subject filtering by course
- [ ] Session creation with TIME format
- [ ] Tutor search with course filter
- [ ] Admin user management
- [ ] Frontend dropdowns send correct values

## Rollback Plan

If issues occur:
1. Database: Restore from Supabase backup
2. Code: Revert to previous commit
3. Types: Comment out new type definitions

## Notes

- Password field remains plain text (no bcrypt yet)
- chat_pin field remains plain text (no hashing yet)
- All existing data should be migrated automatically by migration scripts
- Foreign key relationships maintain data integrity
