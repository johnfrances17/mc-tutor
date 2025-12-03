# Production Deployment Guide - MC Tutor

## 🎯 Deployment Strategy

**Recommended Platform**: Vercel (full-stack) or Railway (backend) + Vercel (frontend)  
**Database**: Supabase PostgreSQL (already configured)  
**Storage**: Supabase Storage (buckets need creation)  
**Estimated Time**: 4-6 hours

---

## 📋 Pre-Deployment Checklist

### 1. Environment Preparation
- [ ] Create production `.env` file
- [ ] Set up Supabase Storage buckets
- [ ] Test all API endpoints locally
- [ ] Verify Socket.IO connections work
- [ ] Test file uploads/downloads
- [ ] Run security audit

### 2. Code Preparation
- [ ] Remove console.logs (or use logger)
- [ ] Set NODE_ENV=production
- [ ] Enable production error handling
- [ ] Minimize frontend assets (optional)
- [ ] Update CORS origins

### 3. Database Preparation
- [ ] Verify all migrations applied
- [ ] Check RLS policies are active
- [ ] Set up automated backups (Supabase does this)
- [ ] Review connection limits

---

## 🚀 Option 1: Vercel Deployment (Recommended)

### Why Vercel?
- ✅ Easy GitHub integration
- ✅ Automatic HTTPS
- ✅ Serverless functions (scales automatically)
- ✅ Free tier: 100GB bandwidth
- ✅ Built-in CDN
- ⚠️ Note: WebSockets need special configuration

### Backend Deployment (Vercel Serverless)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Create `vercel.json`
Create `server/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Step 3: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-token-secret-minimum-32-characters
SUPABASE_URL=https://axrzqrzlnceaiuiyixif.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

#### Step 4: Deploy
```bash
cd server
vercel --prod
```

**Note**: Vercel Serverless has limitations with WebSockets. For Socket.IO, consider Railway (Option 2).

---

## 🚂 Option 2: Railway Deployment (Best for Socket.IO)

### Why Railway?
- ✅ Always-on server (no cold starts)
- ✅ Native WebSocket support
- ✅ Free $5/month credit
- ✅ Easy PostgreSQL integration
- ✅ GitHub auto-deploy

### Backend Deployment (Railway)

#### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Create new project

#### Step 2: Connect GitHub Repository
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `mc-tutor` repository
4. Select `server` directory as root

#### Step 3: Configure Environment Variables
In Railway Dashboard → Variables:
```
NODE_ENV=production
PORT=${{PORT}}  # Railway auto-assigns this
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-token-secret-minimum-32-characters
SUPABASE_URL=https://axrzqrzlnceaiuiyixif.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

#### Step 4: Configure Build
Railway auto-detects Node.js. Ensure `package.json` has:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "postinstall": "npm run build"
  }
}
```

#### Step 5: Deploy
Railway auto-deploys on push to main branch. Check logs for:
```
✅ Supabase client initialized
🚀 MC Tutor Server running on port XXXX
```

#### Step 6: Get Public URL
Railway provides: `https://your-app-name.up.railway.app`

---

## 🌐 Frontend Deployment (Vercel/Netlify)

### Option A: Vercel (Recommended)

#### Step 1: Create `vercel.json` in `client/` directory
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.railway.app/api/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

#### Step 2: Update API URLs
Create `client/public/js/config.js`:
```javascript
const API_CONFIG = {
  baseURL: 'https://your-backend-url.railway.app',
  socketURL: 'https://your-backend-url.railway.app'
};
```

Update `api.js`:
```javascript
const API_BASE_URL = API_CONFIG.baseURL || 'http://localhost:3000';
```

Update `socket.js`:
```javascript
const SOCKET_URL = API_CONFIG.socketURL || 'http://localhost:3000';
```

#### Step 3: Deploy
```bash
cd client
vercel --prod
```

### Option B: Netlify

#### Step 1: Create `netlify.toml`
```toml
[build]
  publish = "public"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.railway.app/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Deploy
```bash
npm install -g netlify-cli
cd client
netlify deploy --prod
```

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Origins
In `server/src/server.ts`:
```typescript
const corsOptions = {
  origin: [
    'https://your-frontend.vercel.app',
    'https://your-custom-domain.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''
  ].filter(Boolean),
  credentials: true
};

app.use(cors(corsOptions));
```

Redeploy backend after CORS update.

### 2. Configure Socket.IO for Production
In `server/src/server.ts`:
```typescript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  },
  transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
  pingTimeout: 60000,
  pingInterval: 25000
});
```

### 3. Create Supabase Storage Buckets
Follow `STORAGE_INTEGRATION_GUIDE.md`:
1. Go to Supabase Dashboard → Storage
2. Create `profile-pictures` bucket (public)
3. Create `study-materials` bucket (private)
4. Apply RLS policies from documentation

### 4. Test Production Endpoints

#### Health Check
```bash
curl https://your-backend.railway.app/health
```

#### Authentication
```bash
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin","password":"admin123"}'
```

#### WebSocket Connection
Open browser console on frontend:
```javascript
const socket = io('https://your-backend.railway.app');
socket.on('connect', () => console.log('✅ Connected'));
```

---

## 📊 Monitoring & Logging

### 1. Add Winston Logger
```bash
cd server
npm install winston
```

Create `server/src/utils/logger.ts`:
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

Replace `console.log` with `logger.info()`, `logger.error()`, etc.

### 2. Add Health Check Endpoint
In `server/src/server.ts`:
```typescript
app.get('/health', async (req, res) => {
  try {
    // Check database
    const { error } = await supabase.from('users').select('count').limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: error ? 'down' : 'up',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 3. Set Up Monitoring
**Railway**: Built-in metrics dashboard  
**External**: Use [UptimeRobot](https://uptimerobot.com) (free) for uptime monitoring

---

## 🔒 Security Hardening

### 1. Add Rate Limiting
```bash
npm install express-rate-limit
```

In `server/src/server.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 2. Add Helmet for Security Headers
```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 3. Hide Powered-By Header
```typescript
app.disable('x-powered-by');
```

### 4. Enable HTTPS Redirects (if not using Vercel/Railway)
```typescript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

---

## 🧪 Testing Production

### 1. Functional Tests
- [ ] Register new user
- [ ] Login and get JWT token
- [ ] Access protected endpoints
- [ ] Book a session (student)
- [ ] Confirm session (tutor)
- [ ] Upload profile picture
- [ ] Upload study material
- [ ] Send real-time message
- [ ] Receive notification

### 2. Performance Tests
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 https://your-backend.railway.app/api/subjects

# Expected: <100ms average response time
```

### 3. Load Testing (Socket.IO)
Use [Artillery](https://www.artillery.io):
```bash
npm install -g artillery

# Create load-test.yml
artillery quick --count 100 --num 10 https://your-backend.railway.app
```

---

## 📈 Scaling Considerations

### Database
- Supabase free tier: 500MB, 2GB bandwidth/month
- Upgrade to Pro: $25/month (8GB, unlimited API requests)
- Connection pooling: Already configured via Supabase

### Storage
- Supabase free tier: 1GB
- Upgrade to Pro: 100GB included
- CDN: Automatic via Supabase

### Backend
- Railway: Auto-scales with usage ($5 free credit/month)
- Add Redis cache for sessions (Railway add-on)
- Consider load balancer if >10,000 concurrent users

---

## 🚨 Rollback Plan

If deployment fails:

### 1. Revert to Previous Version
```bash
# Railway
railway rollback

# Vercel
vercel rollback
```

### 2. Emergency Fallback
- Keep PHP/XAMPP server as backup
- Switch DNS back to old server
- Revert database migrations if needed

### 3. Troubleshooting
- Check Railway/Vercel logs
- Verify environment variables
- Test database connectivity
- Check CORS configuration
- Review error logs in Supabase dashboard

---

## ✅ Deployment Checklist

### Pre-Flight
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database migrations complete
- [ ] Storage buckets created
- [ ] CORS configured correctly
- [ ] Error handling implemented
- [ ] Logging enabled

### Deployment
- [ ] Backend deployed to Railway/Vercel
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Health check endpoint responding
- [ ] Socket.IO connections working
- [ ] File uploads working

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Performance benchmarks met
- [ ] Error tracking configured
- [ ] Uptime monitoring active
- [ ] Team notified of new URLs
- [ ] Documentation updated
- [ ] Old server decommissioned (after 1 week)

---

## 📞 Support & Resources

### Documentation
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

### Community
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)

### Status Pages
- Vercel: [www.vercel-status.com](https://www.vercel-status.com)
- Railway: [status.railway.app](https://status.railway.app)
- Supabase: [status.supabase.com](https://status.supabase.com)

---

**Ready to deploy?** Start with Railway for backend (best Socket.IO support) + Vercel for frontend.

**Estimated deployment time**: 2-3 hours for experienced developers, 4-6 hours for first-time deployment.
