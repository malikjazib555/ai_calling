# Production Deployment Guide

## 🚀 Production Setup

### 1. Environment Variables

Create `.env.production` file:

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_production_key

# Twilio (Production)
TWILIO_ACCOUNT_SID=ACyour_production_sid
TWILIO_AUTH_TOKEN=your_production_token
TWILIO_PHONE_NUMBER=+1234567890

# Deepgram (Optional)
DEEPGRAM_API_KEY=your_deepgram_key

# ElevenLabs (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_key

# App URL (Production)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# WebSocket (Production)
WS_PORT=3001
NEXT_PUBLIC_WS_URL=wss://your-ws-server.com
```

### 2. Database Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for setup to complete

2. **Run Migrations:**
   ```sql
   -- Run supabase/schema.sql first
   -- Then run supabase/advanced_features.sql
   ```

3. **Verify Tables:**
   - Check all tables are created
   - Verify RLS policies are enabled
   - Test with a sample insert

### 3. Twilio Setup

1. **Get Production Phone Number:**
   - Buy a Twilio phone number
   - Note the number (e.g., +1234567890)

2. **Configure Webhooks:**
   - Go to Twilio Console → Phone Numbers
   - Click on your number
   - Set Voice webhook: `https://your-domain.com/api/twilio/incoming`
   - Method: POST
   - Save

3. **Verify Phone Numbers:**
   - For test calls, verify your phone number in Twilio
   - Go to Verified Caller IDs
   - Add your number

### 4. Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables
   - Deploy

3. **Configure Domain:**
   - Add custom domain in Vercel
   - Update `NEXT_PUBLIC_APP_URL` in env vars

### 5. WebSocket Server Deployment

**Option 1: Railway/Render (Recommended)**
```bash
# Deploy server.ts to Railway or Render
# Set environment variables
# Get WebSocket URL
# Update NEXT_PUBLIC_WS_URL
```

**Option 2: Separate VPS**
```bash
# SSH into server
git clone your-repo
cd Bizzai
npm install
npm run build

# Use PM2 to run WebSocket server
npm install -g pm2
pm2 start server.ts --name bizzai-ws
pm2 save
pm2 startup
```

### 6. Production Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Twilio webhooks configured
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] WebSocket server running
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Analytics configured (if needed)

## 🧪 Test Call Setup

### 1. Verify Your Phone Number

In Twilio Console:
1. Go to Phone Numbers → Verified Caller IDs
2. Add your phone number
3. Verify via SMS/call

### 2. Test Call Flow

1. **Create an Agent:**
   - Go to Agents page
   - Create new agent
   - Set phone number (your Twilio number)
   - Activate agent

2. **Make Test Call:**
   - Click "Test Call" in top bar
   - Select agent
   - Enter your verified phone number
   - Click "Make Test Call"
   - Answer your phone
   - Talk to AI agent

3. **Check Results:**
   - Go to Calls page
   - See call transcript
   - Check Orders page if order was created

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] API keys not exposed
- [ ] RLS policies enabled
- [ ] Webhook signatures verified
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Database backups enabled

## 📊 Monitoring

### Recommended Tools:
- **Vercel Analytics**: Built-in
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **PostHog**: Product analytics

## 🚨 Troubleshooting

### Test Call Not Working?
1. Check Twilio credentials
2. Verify phone number is verified
3. Check webhook URL is accessible
4. Check agent is active
5. Check Twilio logs

### WebSocket Not Connecting?
1. Verify WS server is running
2. Check firewall rules
3. Verify WS URL in env vars
4. Check browser console for errors

### Database Errors?
1. Verify Supabase credentials
2. Check RLS policies
3. Verify tables exist
4. Check connection string

## 📝 Production URLs

After deployment, update:
- Twilio webhook URL
- WebSocket URL
- `NEXT_PUBLIC_APP_URL`
- Any hardcoded URLs

## 🎯 Next Steps

1. Deploy to Vercel
2. Set up WebSocket server
3. Configure Twilio
4. Test with real call
5. Monitor performance
6. Set up alerts

**Your app is now production-ready!** 🚀

