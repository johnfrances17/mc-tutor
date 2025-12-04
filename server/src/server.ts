import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { initializeDataDirectories } from './utils/fileSystem';
import { initializeSocketIO } from './sockets/chatSocket';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for now (tighten in production)
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser Middleware (with size limits for security)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Trust proxy (if behind reverse proxy like Nginx)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import sessionRoutes from './routes/sessionRoutes';
import subjectRoutes from './routes/subjectRoutes';
import tutorRoutes from './routes/tutorRoutes';
import materialRoutes from './routes/materialRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import notificationRoutes from './routes/notificationRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';
// import testRoutes from './routes/testRoutes'; // Temporarily disabled
import { apiLimiter } from './middleware/rateLimiter';

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Check email configuration
    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    const emailUser = process.env.EMAIL_USER || 'Not configured';
    
    // Test database connection
    let databaseConnected = false;
    let databaseResponseTime = 0;
    try {
      const { supabase } = await import('./config/database');
      const start = Date.now();
      // Use subjects table instead of users (less likely to have RLS issues)
      const { data, error } = await supabase.from('subjects').select('subject_id').limit(1);
      databaseResponseTime = Date.now() - start;
      // Check if query succeeded (either has data or no error)
      databaseConnected = !error;
    } catch (err) {
      console.error('Database health check error:', err);
      databaseConnected = false;
    }

    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      services: {
        database: {
          connected: databaseConnected,
          responseTime: databaseResponseTime + 'ms'
        },
        email: {
          configured: emailConfigured,
          provider: 'Gmail (NodeMailer)',
          user: emailUser,
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || '587'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/test', testRoutes); // Temporarily disabled - causing serverless crashes

app.get('/api', (_req, res) => {
  res.json({
    message: 'MC Tutor API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      sessions: '/api/sessions',
      subjects: '/api/subjects',
      materials: '/api/materials',
      feedback: '/api/feedback',
      notifications: '/api/notifications',
      chat: '/api/chat',
    },
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize data directories (skip in Vercel serverless)
if (!process.env.VERCEL) {
  initializeDataDirectories();
}

// Initialize Socket.IO handlers
initializeSocketIO(io);

// Start server (only in non-serverless environment)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 MC Tutor Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Socket.IO enabled`);
  });
}

// Export for Vercel serverless and testing
export default app;
export { app, io, httpServer };
