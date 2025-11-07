# Production Environment Setup

## ✅ Production Configuration

### Environment Variables Required

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number
- `NEXT_PUBLIC_APP_URL` - Your production URL

**Optional:**
- `DEEPGRAM_API_KEY` - For advanced STT
- `ELEVENLABS_API_KEY` - For premium TTS
- `WS_PORT` - WebSocket port (default: 3001)

### Quick Setup

1. **Copy `.env.example` to `.env.production`**
2. **Fill in all required values**
3. **Run database migrations**
4. **Deploy to Vercel**
5. **Configure Twilio webhooks**

## 🧪 Test Call Feature

### How to Use:

1. **Navigate to Test Call:**
   - Click "Test Call" button in top bar
   - Or go to `/test-call`

2. **Select Agent:**
   - Choose an active agent from dropdown

3. **Enter Phone Number:**
   - Enter your phone number (must be verified in Twilio)
   - Format: +1234567890

4. **Make Call:**
   - Click "Make Test Call"
   - Twilio will call your number
   - Answer and talk to AI agent

5. **View Results:**
   - Check Calls page for transcript
   - Check Orders page if order created
   - Listen to recording in Recordings page

### Test Call Requirements:

- Agent must be active
- Agent must have phone number configured
- Your phone number must be verified in Twilio
- Twilio credentials must be valid

## 🚀 Deployment Steps

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or connect GitHub repo in Vercel dashboard
```

### 2. Environment Variables in Vercel

Add all environment variables in Vercel dashboard:
- Project Settings → Environment Variables
- Add each variable
- Redeploy

### 3. WebSocket Server

Deploy `server.ts` separately:
- Railway: `railway up`
- Render: Create Web Service
- VPS: Use PM2

### 4. Twilio Configuration

1. Update webhook URL to production URL
2. Verify phone numbers
3. Test with production credentials

## ✅ Production Checklist

- [ ] All env vars configured
- [ ] Database migrations run
- [ ] Twilio webhooks updated
- [ ] Domain configured
- [ ] SSL enabled
- [ ] WebSocket server running
- [ ] Test call working
- [ ] Error monitoring set up

## 🎯 Test Call API

**Endpoint:** `POST /api/test-call`

**Request:**
```json
{
  "to": "+1234567890",
  "agent_id": "agent-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "callSid": "CAxxxxx",
  "status": "queued",
  "message": "Call initiated successfully"
}
```

## 📞 Test Call Flow

1. User clicks "Test Call"
2. Selects agent and enters phone
3. API initiates Twilio outbound call
4. Twilio calls user's phone
5. User answers → AI agent responds
6. Conversation happens
7. Call ends → Recording saved
8. Transcript available in dashboard

**Everything is ready for production!** 🚀

