import { Router, Request, Response } from 'express';
import { emailService } from '../services/emailService';

const router = Router();

/**
 * Health check for test routes
 * GET /api/test
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Test API is working',
    endpoints: [
      'POST /api/test/email',
      'POST /api/test/email/welcome',
      'POST /api/test/email/session',
    ],
  });
});

/**
 * Test email endpoint
 * POST /api/test/email
 */
router.post('/email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email address is required' },
      });
    }

    const result = await emailService.sendTestEmail(email);

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to send email', details: result.error },
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Email sending failed', details: error.message },
    });
  }
});

/**
 * Test welcome email
 * POST /api/test/email/welcome
 */
router.post('/email/welcome', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and name are required' },
      });
    }

    const result = await emailService.sendWelcomeEmail(email, name);

    if (result.success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully!',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to send email', details: result.error },
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Email sending failed', details: error.message },
    });
  }
});

/**
 * Test session confirmation email
 * POST /api/test/email/session
 */
router.post('/email/session', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email address is required' },
      });
    }

    // Sample session data
    const sessionDetails = {
      subject: 'Data Structures and Algorithms',
      date: 'December 5, 2025',
      time: '2:00 PM',
      duration: 60,
      mode: 'Online',
      tutorName: 'John Doe',
    };

    const result = await emailService.sendSessionConfirmation(email, sessionDetails);

    if (result.success) {
      res.json({
        success: true,
        message: 'Session confirmation email sent successfully!',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to send email', details: result.error },
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: 'Email sending failed', details: error.message },
    });
  }
});

export default router;
