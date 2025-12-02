# 🗄️ DATABASE SETUP GUIDE

## File Structure

```
mc-tutor/
├── schema.sql          ← PRODUCTION: Clean database structure
├── seed.sql            ← DEVELOPMENT: Test data (DO NOT use in production)
└── mc_tutor_db.sql     ← OLD: phpMyAdmin export (for reference only)
```

---

## 🚀 Quick Setup

### Development Environment
```sql
-- Step 1: Create database and structure
mysql -u root -p < schema.sql

-- Step 2: Load test data
mysql -u root -p < seed.sql
```

### Production/Cloud Deployment
```sql
-- ONLY run schema.sql (no test data!)
mysql -u root -p < schema.sql

-- Then create your admin user manually:
INSERT INTO users (student_id, email, password, full_name, role, status) 
VALUES ('000000', 'admin@yourdomain.com', '$2y$10$...', 'Admin', 'admin', 'active');
```

---

## 📋 What's Included

### schema.sql (PRODUCTION-READY)
- ✅ Clean database structure
- ✅ All tables with proper indexes
- ✅ Foreign key constraints
- ✅ Comments explaining fields
- ✅ File-based chat notes
- ✅ Meeting link architecture
- ❌ **NO test data** (clean slate)

### seed.sql (DEVELOPMENT ONLY)
- 🧪 Test users:
  - Admin: `000000` / `admin@mabini.edu` / password: `admin123`
  - Tutee: `230718` / Kimel
  - Tutors: `200458` (Jabbar), `231173` (Kreiss)
- 🧪 All 62 subjects (Accountancy, Criminology, Nursing, Education, Computer Science)
- 🧪 Sample tutor subjects (CS101, CS103, CS104 for Jabbar)
- 🧪 Sample confirmed session
- ⚠️ **DO NOT use in production!**

---

## 🔄 Migration from Old System

If you have existing `mc_tutor_db.sql`:

```bash
# Backup your current database
mysqldump mc_tutor_db > backup_$(date +%Y%m%d).sql

# Drop and recreate
mysql -u root -p -e "DROP DATABASE IF EXISTS mc_tutor_db;"

# Import clean schema
mysql -u root -p < schema.sql

# (Optional) Import test data for development
mysql -u root -p < seed.sql
```

---

## 🗂️ Key Differences

| Feature | Old (mc_tutor_db.sql) | New (schema.sql + seed.sql) |
|---------|----------------------|----------------------------|
| **Structure** | Mixed with test data | Separate files |
| **Production Ready** | ❌ No | ✅ Yes |
| **Test Data** | Embedded | Separate seed.sql |
| **Chat Storage** | ❌ SQL table | ✅ File-based (chats/) |
| **Meeting Link** | Student provides | Tutor provides |
| **Subject Display** | All sessions | Upcoming only |
| **Clean Import** | ❌ No | ✅ Yes |

---

## 📦 What Was Removed

Cleaned up repository:
- ❌ `docs/` folder (18 outdated files)
- ❌ `REFACTORING_SUMMARY.md` (replaced)
- ❌ `database_3nf_refactor.sql` (redundant)
- ❌ `migrate_to_3nf.sql` (redundant)
- ❌ `migrate_chat_unified.sql` (redundant)
- ❌ `update_database.sql` (redundant)
- ❌ `update_unified_chat.sql` (redundant)

---

## ✅ Best Practices

### For Development
1. Run `schema.sql` first
2. Run `seed.sql` for test data
3. Use test accounts to develop features
4. Reset database anytime: just re-run both files

### For Production
1. **ONLY** run `schema.sql`
2. Create admin user manually with secure password
3. Never import `seed.sql` (contains weak test passwords)
4. Set up proper backup schedule

### For Version Control
```bash
# Commit schema changes
git add schema.sql
git commit -m "Update database schema"

# Keep seed.sql in sync
git add seed.sql
git commit -m "Update test data"

# Keep old export for reference (optional)
git add mc_tutor_db.sql
```

---

## 🔐 Security Notes

- `seed.sql` has **weak passwords** for testing
- Production: Use strong, unique passwords
- Never commit production credentials
- Use environment variables for DB config

---

## 📞 Need Help?

**Schema issues?** → Check `schema.sql` comments
**Test data issues?** → Check `seed.sql` inserts
**Chat not working?** → See `FILE_BASED_CHAT_SYSTEM.md`
**Old database?** → Keep `mc_tutor_db.sql` as reference
