# ✅ MC Tutor - Pre-Deployment Checklist

Use this checklist before deploying to production.

## 🔐 Security Configuration

### Environment Variables
- [ ] Changed `JWT_SECRET` from default (minimum 32 characters)
- [ ] Generated new `ENCRYPTION_KEY` using `npm run generate-key`
- [ ] Set `NODE_ENV=production`
- [ ] Updated `ALLOWED_ORIGINS` to production URLs only
- [ ] Removed any development URLs from CORS
- [ ] Verified `SUPABASE_URL` and `SUPABASE_KEY` are correct

### Authentication
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Tested JWT token refresh
- [ ] Verified logout clears cookies
- [ ] Tested password change functionality
- [ ] Verified unauthorized access is blocked

### Rate Limiting
- [ ] Tested login rate limit (5 attempts / 15 min)
- [ ] Tested general API rate limit (100 req / 15 min)
- [ ] Tested file upload rate limit (10 uploads / hour)
- [ ] Verified rate limit messages are user-friendly
- [ ] Confirmed rate limits reset after time window

## 📊 Database & Storage

### Supabase Setup
- [ ] Created PostgreSQL database
- [ ] Ran `schema.sql` successfully
- [ ] (Optional) Ran `seed.sql` for sample data
- [ ] Enabled Row Level Security (RLS) policies
- [ ] Created database indexes for performance
- [ ] Setup automated backups
- [ ] Verified connection pooling is enabled

### Storage Buckets
- [ ] Created `profile-pictures` bucket (PUBLIC)
- [ ] Created `study-materials` bucket (PRIVATE)
- [ ] Set storage limits (2MB for profiles, 10MB for materials)
- [ ] Tested file upload to both buckets
- [ ] Verified file download works
- [ ] Configured bucket CORS if needed

## 🚀 Server Configuration

### Build & Compilation
- [ ] Run `npm run build` - No errors
- [ ] Verified `dist/` folder created
- [ ] Tested production build with `npm start`
- [ ] Checked server starts without crashes
- [ ] Verified all routes are accessible

### Dependencies
- [ ] Run `npm audit` - No critical vulnerabilities
- [ ] Updated outdated packages
- [ ] Verified all dev dependencies are in devDependencies
- [ ] Checked package.json scripts are correct

### File System
- [ ] Created `data/` directory structure
- [ ] Set proper file permissions (readable/writable)
- [ ] Verified uploads directory exists
- [ ] Tested file-based chat storage
- [ ] Confirmed notification storage works

## 🌐 Frontend Configuration

### XAMPP Setup
- [ ] Apache server starts without errors
- [ ] PHP version is 7.4 or higher
- [ ] mod_rewrite is enabled
- [ ] SSL certificate installed (production)
- [ ] Tested all frontend pages load

### Client Files
- [ ] Updated API endpoints in JavaScript files
- [ ] Configured Socket.IO connection URL
- [ ] Tested login page
- [ ] Tested registration page
- [ ] Tested messenger page
- [ ] Verified mobile responsiveness

## 🧪 Functionality Testing

### User Management
- [ ] Register new tutor account
- [ ] Register new tutee account
- [ ] Login as tutor
- [ ] Login as tutee
- [ ] Update user profile
- [ ] Upload profile picture
- [ ] Change password
- [ ] Logout successfully

### Session Management
- [ ] Tutee: Book a session
- [ ] Tutor: Confirm session
- [ ] Tutor: Complete session
- [ ] View session history
- [ ] Cancel session
- [ ] Test session preferences

### Chat System
- [ ] Send message from tutee to tutor
- [ ] Receive real-time message
- [ ] Test typing indicators
- [ ] Verify message encryption
- [ ] Test message read status
- [ ] Check unread count updates

### Study Materials
- [ ] Tutor: Upload PDF material
- [ ] Tutee: Browse materials
- [ ] Tutee: Download material
- [ ] Tutor: Delete material
- [ ] Test file size limits
- [ ] Test file type restrictions

### Feedback System
- [ ] Tutee: Submit feedback
- [ ] Tutor: View received feedback
- [ ] Calculate average rating
- [ ] Display rating distribution
- [ ] Verify only tutees can submit

### Notifications
- [ ] Receive session confirmation notification
- [ ] Receive new message notification
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] Test real-time notification updates

## 🛡️ Security Testing

### Authentication
- [ ] Try accessing protected routes without token
- [ ] Test with expired JWT token
- [ ] Test with invalid JWT token
- [ ] Try accessing admin routes as regular user
- [ ] Verify role-based access control

### Input Validation
- [ ] Try SQL injection in forms
- [ ] Try XSS attacks in text fields
- [ ] Test with invalid email format
- [ ] Test with weak password
- [ ] Try uploading malicious files
- [ ] Test with oversized file uploads

### API Security
- [ ] Test CORS from unauthorized origin
- [ ] Verify rate limiting blocks excessive requests
- [ ] Check security headers are set (Helmet.js)
- [ ] Test CSRF protection
- [ ] Verify error messages don't leak sensitive info

## 📈 Performance Testing

### Load Testing
- [ ] Test with 10 concurrent users
- [ ] Test with 50 concurrent users
- [ ] Measure API response times (<200ms)
- [ ] Test database query performance
- [ ] Verify memory usage is stable

### Optimization
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Minimize API payloads
- [ ] Test WebSocket performance

## 📝 Documentation

### Code Documentation
- [ ] All functions have JSDoc comments
- [ ] Complex logic is explained
- [ ] TODO items are addressed
- [ ] Console.logs removed from production code
- [ ] Error messages are descriptive

### User Documentation
- [ ] README.md is complete
- [ ] BEGINNER_GUIDE.md is accurate
- [ ] SECURITY.md is up to date
- [ ] API documentation is current
- [ ] Troubleshooting section is helpful

## 🚨 Error Handling

### Error Scenarios
- [ ] Test database connection failure
- [ ] Test Supabase storage failure
- [ ] Test invalid API endpoints (404)
- [ ] Test malformed JSON requests
- [ ] Test server overload (rate limiting)
- [ ] Verify graceful error messages

### Logging
- [ ] Errors are logged to console
- [ ] Critical errors are highlighted
- [ ] User actions are tracked
- [ ] Performance metrics are recorded
- [ ] Log rotation is configured (production)

## 🔧 DevOps Setup

### Server Configuration
- [ ] Installed Node.js v18+
- [ ] Configured reverse proxy (Nginx)
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Configured firewall rules
- [ ] Setup process manager (PM2)
- [ ] Configured auto-restart on crash

### Monitoring
- [ ] Setup uptime monitoring
- [ ] Configure error alerting
- [ ] Monitor server resources (CPU, RAM)
- [ ] Track API response times
- [ ] Monitor database performance
- [ ] Setup log aggregation

### Backup & Recovery
- [ ] Database automated backups (daily)
- [ ] File storage backups
- [ ] Environment variable backups
- [ ] Tested restore procedure
- [ ] Documented recovery process
- [ ] Created disaster recovery plan

## 🎯 Final Checks

### Pre-Launch
- [ ] All checklist items completed
- [ ] Conducted security audit
- [ ] Performed load testing
- [ ] Reviewed all error logs
- [ ] Tested on different browsers
- [ ] Tested on mobile devices
- [ ] Created rollback plan

### Launch Day
- [ ] Deploy to production server
- [ ] Run smoke tests
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify all features work
- [ ] Notify team of launch
- [ ] Monitor user feedback

### Post-Launch
- [ ] Monitor system for 24 hours
- [ ] Fix any critical bugs immediately
- [ ] Gather user feedback
- [ ] Update documentation
- [ ] Plan next iteration
- [ ] Celebrate success! 🎉

---

## 📞 Emergency Contacts

**If something goes wrong:**
1. Check server logs: `pm2 logs`
2. Check error logs: `tail -f /var/log/mc-tutor/error.log`
3. Restart server: `pm2 restart mc-tutor`
4. Rollback deployment if necessary
5. Contact system administrator

---

## ✅ Sign-Off

- [ ] Development Team Lead: ________________ Date: _______
- [ ] Security Reviewer: ________________ Date: _______
- [ ] QA Tester: ________________ Date: _______
- [ ] DevOps Engineer: ________________ Date: _______
- [ ] Project Manager: ________________ Date: _______

---

**Status**: ☐ Not Ready  ☐ In Progress  ☐ Ready for Production

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

---

*Checklist Version: 2.0*  
*Last Updated: December 2025*
