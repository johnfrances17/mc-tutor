import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection only in development (not in serverless)
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('✅ Email service ready');
    }
  });
}

// Email templates
const templates = {
  welcome: (name: string) => ({
    subject: 'Welcome to MC Tutor!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MC Tutor!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}! 👋</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining MC Tutor, the cloud-based peer tutoring platform for MC students!
          </p>
          <p style="color: #4b5563; line-height: 1.6;">Here's what you can do now:</p>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>📚 Browse available tutors in your subjects</li>
            <li>📅 Book tutoring sessions that fit your schedule</li>
            <li>💬 Chat with tutors before and after sessions</li>
            <li>📄 Access shared study materials</li>
          </ul>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://mc-tutor.vercel.app/html/login.html" 
               style="background: #667eea; color: white; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Login to Your Account
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
            Need help? Contact us or visit our help center.
          </p>
        </div>
      </div>
    `,
  }),

  sessionConfirmation: (details: any) => ({
    subject: `Session Confirmed - ${details.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #10b981; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Session Confirmed! ✅</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #4b5563; line-height: 1.6;">Your tutoring session has been confirmed!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 8px 0;"><strong style="color: #1f2937;">Subject:</strong> <span style="color: #4b5563;">${details.subject}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #1f2937;">Date:</strong> <span style="color: #4b5563;">${details.date}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #1f2937;">Time:</strong> <span style="color: #4b5563;">${details.time}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #1f2937;">Duration:</strong> <span style="color: #4b5563;">${details.duration} minutes</span></p>
            <p style="margin: 8px 0;"><strong style="color: #1f2937;">Mode:</strong> <span style="color: #4b5563;">${details.mode}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #1f2937;">Tutor:</strong> <span style="color: #4b5563;">${details.tutorName}</span></p>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            💡 We'll send you a reminder 1 hour before the session starts.
          </p>
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://mc-tutor.vercel.app/html/messenger.html" 
               style="background: #667eea; color: white; padding: 12px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              Chat with Tutor
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  sessionReminder: (details: any) => ({
    subject: `⏰ Reminder: Session in 1 hour - ${details.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f59e0b; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Session Starting Soon!</h1>
        </div>
        <div style="background: #fef3c7; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #92400e; font-size: 18px; font-weight: bold; margin-top: 0;">
            Your session starts in 1 hour!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Subject:</strong> ${details.subject}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${details.time}</p>
            <p style="margin: 8px 0;"><strong>Tutor:</strong> ${details.tutorName}</p>
          </div>
          <p style="color: #92400e;">Make sure you're ready and have any materials you need!</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://mc-tutor.vercel.app/html/messenger.html" 
               style="background: #f59e0b; color: white; padding: 12px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              Join Chat Now
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  passwordReset: (resetLink: string, name: string) => ({
    subject: '🔒 Reset Your Password - MC Tutor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ef4444; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Password Reset Request</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #4b5563; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password for your MC Tutor account. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #ef4444; color: white; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #991b1b; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
              ⚠️ Important Security Information:
            </p>
            <ul style="color: #991b1b; margin: 0; padding-left: 20px; font-size: 13px;">
              <li>This link expires in <strong>1 hour</strong></li>
              <li>The link can only be used once</li>
              <li>If you didn't request this, your account may be at risk - please secure it immediately</li>
            </ul>
          </div>
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0; font-size: 13px;">
              💡 <strong>Security Tip:</strong> Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <span style="color: #6b7280; word-break: break-all;">${resetLink}</span>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
          </p>
        </div>
      </div>
    `,
  }),

  feedbackRequest: (details: any) => ({
    subject: 'How was your session? Leave feedback ⭐',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #8b5cf6; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Session Completed! ✅</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #4b5563; line-height: 1.6;">
            Thanks for using MC Tutor! How was your session with <strong>${details.tutorName}</strong>?
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            Your feedback helps other students find great tutors and helps tutors improve their teaching.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mc-tutor.vercel.app/student/give_feedback.php?session_id=${details.sessionId}" 
               style="background: #10b981; color: white; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Leave Feedback ⭐
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            Takes less than a minute
          </p>
        </div>
      </div>
    `,
  }),

  newMessage: (senderName: string, messagePreview: string) => ({
    subject: `💬 New message from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💬 New Message</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #4b5563; line-height: 1.6;">
            <strong>${senderName}</strong> sent you a message on MC Tutor:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="color: #6b7280; font-style: italic; margin: 0;">"${messagePreview}"</p>
          </div>
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://mc-tutor.vercel.app/html/messenger.html" 
               style="background: #3b82f6; color: white; padding: 12px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              View Message
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  sessionCancelled: (details: any) => ({
    subject: `Session Cancelled - ${details.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ef4444; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Session Cancelled</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #4b5563; line-height: 1.6;">
            Your session with <strong>${details.tutorName}</strong> has been cancelled.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Subject:</strong> ${details.subject}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${details.date}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${details.time}</p>
            ${details.reason ? `<p style="margin: 8px 0;"><strong>Reason:</strong> ${details.reason}</p>` : ''}
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            You can book a new session anytime.
          </p>
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://mc-tutor.vercel.app/html/find-tutors.html" 
               style="background: #667eea; color: white; padding: 12px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              Find Another Tutor
            </a>
          </div>
        </div>
      </div>
    `,
  }),
};

// Email service functions
export const emailService = {
  // Send email function
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'MC Tutor <noreply@mctutor.com>',
        to,
        subject,
        html,
      });
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email error:', error);
      return { success: false, error };
    }
  },

  // Welcome email
  async sendWelcomeEmail(to: string, name: string) {
    const template = templates.welcome(name);
    return this.sendEmail(to, template.subject, template.html);
  },

  // Session confirmation
  async sendSessionConfirmation(to: string, details: any) {
    const template = templates.sessionConfirmation(details);
    return this.sendEmail(to, template.subject, template.html);
  },

  // Session reminder
  async sendSessionReminder(to: string, details: any) {
    const template = templates.sessionReminder(details);
    return this.sendEmail(to, template.subject, template.html);
  },

  // Password reset
  async sendPasswordReset(to: string, resetLink: string, name: string) {
    const template = templates.passwordReset(resetLink, name);
    return this.sendEmail(to, template.subject, template.html);
  },

  // Feedback request
  async sendFeedbackRequest(to: string, details: any) {
    const template = templates.feedbackRequest(details);
    return this.sendEmail(to, template.subject, template.html);
  },

  // New message notification
  async sendNewMessageNotification(to: string, senderName: string, messagePreview: string) {
    const template = templates.newMessage(senderName, messagePreview);
    return this.sendEmail(to, template.subject, template.html);
  },

  // Session cancelled
  async sendSessionCancelled(to: string, details: any) {
    const template = templates.sessionCancelled(details);
    return this.sendEmail(to, template.subject, template.html);
  },

  // Test email
  async sendTestEmail(to: string) {
    return this.sendEmail(
      to,
      'Test Email from MC Tutor ✅',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; text-align: center;">
          <h1 style="color: #10b981; font-size: 48px;">✅</h1>
          <h2 style="color: #1f2937;">Email is Working!</h2>
          <p style="color: #6b7280;">Your NodeMailer setup is configured correctly.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <p style="color: #4b5563; margin: 0;"><strong>Sent from:</strong> MC Tutor Email Service</p>
          </div>
        </div>
      `
    );
  },
};
