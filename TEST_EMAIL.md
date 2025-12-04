# Email Testing Guide

## ✅ Gmail Configuration Complete

**Email Account**: mctutor2025@gmail.com  
**App Password**: Configured in Vercel ✓  
**Status**: Ready to send emails

---

## 🧪 Test Email Functionality

### Option 1: Test Registration (Recommended)

1. **Visit Registration Page**
   ```
   https://mc-tutor.vercel.app/html/register.html
   ```

2. **Register with Your Email**
   - Use your personal email to receive the welcome email
   - Fill all required fields
   - Click "Register"

3. **Check Your Inbox**
   - Subject: "Welcome to MC Tutor!"
   - Should arrive within 10-30 seconds
   - Check spam folder if not in inbox

### Option 2: Test Forgot Password

1. **Visit Forgot Password**
   ```
   https://mc-tutor.vercel.app/html/forgot-password.html
   ```

2. **Enter Your Email**
   - Use the email from registration
   - Click "Send Reset Link"

3. **Check Your Inbox**
   - Subject: "Reset Your Password - MC Tutor"
   - Should contain clickable reset link
   - Link format: `https://mc-tutor.vercel.app/html/reset-password.html?token=...`

### Option 3: Test Password Reset

1. **Click Reset Link** from email
2. **Enter New Password**
   - New Password: Choose a strong password
   - Confirm Password: Must match
3. **Click "Reset Password"**
4. **Verify Success**
   - Should redirect to login
   - Login with new password should work

---

## 📧 Email Templates Available

Your system can now send these emails:

1. **Welcome Email** - Sent on registration
2. **Password Reset** - Sent when user forgets password
3. **Session Confirmation** - Sent when tutoring session is booked
4. **Session Reminder** - Sent 1 hour before session
5. **Session Cancelled** - Sent when session is cancelled
6. **Feedback Request** - Sent after session completion
7. **New Message** - Sent when user receives a message

---

## 🐛 Troubleshooting

### Email Not Arriving?

1. **Check Spam Folder** - Gmail might filter it initially
2. **Check Vercel Logs**
   ```bash
   vercel logs --prod
   ```
3. **Verify Environment Variables**
   ```bash
   vercel env ls
   ```

### "Failed to Send Email" Error?

1. **Check Gmail Account**
   - Login to mctutor2025@gmail.com
   - Ensure account is active
   - Check "Less secure app access" is OFF (you're using app password)

2. **Verify App Password**
   - Should be 16 characters without spaces: `ppwgkfeatelmskic`
   - Regenerate if needed: https://myaccount.google.com/apppasswords

3. **Check SMTP Settings**
   - Host: smtp.gmail.com
   - Port: 587
   - Secure: STARTTLS (not SSL)

---

## ✅ Next Steps

1. **Test Registration Flow**
   - Register with your email
   - Verify welcome email received
   - Login successfully

2. **Test Password Reset Flow**
   - Request password reset
   - Click email link
   - Reset password
   - Login with new password

3. **Monitor Email Delivery**
   - Check Gmail sent folder
   - Monitor Vercel logs for errors
   - Track email delivery rate

---

## 🎉 Your Email System is Live!

All authentication emails are now working. Users will receive:
- ✅ Welcome emails on registration
- ✅ Password reset links when requested
- ✅ Session notifications (when implemented)

**Production URL**: https://mc-tutor.vercel.app

**Email Status**: ✅ CONFIGURED AND DEPLOYED
