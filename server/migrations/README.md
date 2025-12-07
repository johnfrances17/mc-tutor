# Database Migrations

## Overview
This directory contains SQL migration files to update the MC Tutor database schema according to the project analysis and requirements.

## Migration Files

### Order of Execution:
1. **001_create_courses_table.sql** - Create courses reference table
2. **002_update_users_table.sql** - Update users table (add course_id FK, change year_level to INTEGER)
3. **003_update_subjects_table.sql** - Update subjects table (add course_id FK, add year_level)
4. **004_create_tutor_availability.sql** - Create tutor availability schedule table
5. **005_create_tutor_stats.sql** - Create tutor statistics aggregation table
6. **006_update_sessions_table.sql** - Update sessions table (improve workflow, add TIME type)
7. **007_update_materials_table.sql** - Update materials table (add categorization)
8. **008_update_feedback_table.sql** - Update feedback table (add detailed ratings)
9. **009_update_notifications_table.sql** - Update notifications table (add types and tracking)
10. **010_update_chats_table.sql** - Update chats table (add read tracking)
11. **011_update_tutor_subjects_table.sql** - Update tutor_subjects table (add proficiency tracking)

## How to Run

### Option 1: Combined Migration (Recommended)
Run the PowerShell script to create a combined migration file:

```powershell
cd server/migrations
.\run-migrations.ps1
```

This creates `combined_migration.sql` which contains all migrations in one file.

Then:
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Copy the entire content of `combined_migration.sql`
5. Paste into SQL Editor
6. Click **RUN**

### Option 2: Individual Files
Execute each SQL file manually in Supabase SQL Editor in the order listed above.

### Option 3: Using psql (if you have direct PostgreSQL access)
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f combined_migration.sql
```

## Key Changes

### Data Type Updates:
- `users.year_level`: VARCHAR → INTEGER (1-4)
- `users.course`: VARCHAR → course_id INTEGER (FK to courses)
- `users.chat_pin_hash`: → chat_pin VARCHAR(6) (plain text for now)
- `subjects.course`: VARCHAR → course_id INTEGER (FK to courses)
- `sessions.session_time`: VARCHAR → TIME

### New Tables:
- `courses` - Reference table for BSA, BSBA, BSED, BSN, BSCS, BSCrim
- `tutor_availability` - Weekly availability schedule for tutors
- `tutor_stats` - Aggregated tutor performance metrics

### New Columns:
- `subjects.year_level` - Recommended year level (1-4)
- `sessions.duration_minutes`, `meeting_link`, `tutee_notes`, `tutor_notes`, etc.
- `materials.category`, `topic`, `tags`, `is_public`, `download_count`
- `feedback.knowledge_rating`, `communication_rating`, `punctuality_rating`
- `notifications.title`, `related_id`, `related_type`
- `tutor_subjects.years_of_experience`, `is_active`

### Constraints Added:
- Foreign keys for course_id references
- CHECK constraints for ratings (1-5)
- CHECK constraints for year_level (1-4)
- CHECK constraints for role, status, session_type, etc.
- UNIQUE constraints (session feedback, tutor schedule)
- Business logic constraints (can't tutor yourself, tutors must have academic info)

## Verification

After running migrations, verify with:

```sql
-- Check courses table
SELECT * FROM courses;

-- Check users table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check if course_id FK exists
SELECT * FROM users LIMIT 5;

-- Verify tutor_stats
SELECT * FROM tutor_stats LIMIT 5;

-- Check all new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Rollback

If you need to rollback, you can:
1. Restore from Supabase backup
2. Or manually reverse changes (drop new tables, revert column types)

**Note:** Always backup your database before running migrations!

## Notes

- Password and chat_pin fields remain **plain text** (no hashing/encryption yet)
- All migrations are designed to be non-destructive (data migration included)
- Existing data is preserved and converted to new format
- Foreign key relationships maintain referential integrity

## Support

For issues or questions, refer to:
- `PROJECT_ANALYSIS_AND_DATABASE_PLAN.md` in project root
- Supabase Documentation: https://supabase.com/docs
