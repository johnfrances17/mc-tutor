# Update Vercel Email Configuration

## Current Issue
The health endpoint is showing the wrong email: `iiscythrix@gmail.com`
Should be: `mctutor2025@gmail.com`

## Solution

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/prject/mc-tutor/settings/environment-variables

2. **Update EMAIL_USER**
   - Find `EMAIL_USER` variable
   - Click "Edit" or "Remove" then re-add
   - Set value to: `mctutor2025@gmail.com`
   - Apply to: Production, Preview, Development

3. **Update EMAIL_PASSWORD**
   - Find `EMAIL_PASSWORD` variable
   - Click "Edit" or "Remove" then re-add
   - Set value to: `ppwgkfeatelmskic` (no spaces)
   - Apply to: Production, Preview, Development

4. **Redeploy**
   - Click "Redeploy" button
   - Or run: `vercel --prod`

### Option 2: Via Vercel CLI

```bash
# Remove old variables
vercel env rm EMAIL_USER production
vercel env rm EMAIL_PASSWORD production

# Add new variables
vercel env add EMAIL_USER production
# When prompted, enter: mctutor2025@gmail.com

vercel env add EMAIL_PASSWORD production
# When prompted, enter: ppwgkfeatelmskic

# Redeploy
vercel --prod
```

### Option 3: Add EMAIL_HOST and EMAIL_PORT

Also add these for completeness:

```bash
vercel env add EMAIL_HOST production
# Value: smtp.gmail.com

vercel env add EMAIL_PORT production
# Value: 587

vercel env add EMAIL_FROM production
# Value: MC Tutor <noreply@mctutor.com>
```

## Verification

After updating, check the health endpoint:

```bash
curl https://mc-tutor.vercel.app/api/health
```

Should show:
```json
{
  "services": {
    "email": {
      "configured": true,
      "provider": "Gmail (NodeMailer)",
      "user": "mctutor2025@gmail.com",
      "host": "smtp.gmail.com",
      "port": "587"
    }
  }
}
```

## Test Email Sending

After updating, test by registering a new user:
1. Visit: https://mc-tutor.vercel.app/html/register.html
2. Register with your email
3. Check inbox for welcome email from mctutor2025@gmail.com
