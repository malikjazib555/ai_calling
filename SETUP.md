# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Twilio account (trial account works for testing)
- An OpenAI API key

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL to create all tables and policies

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=sk-your_openai_key

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

NEXT_PUBLIC_APP_URL=http://localhost:3000
WS_PORT=3001
```

### 4. Start Development Servers

Terminal 1 - Next.js app:
```bash
npm run dev
```

Terminal 2 - WebSocket server (for real-time features):
```bash
npx tsx lib/websocket-server.ts
```

Or if you have ts-node:
```bash
npx ts-node lib/websocket-server.ts
```

### 5. Set Up Twilio Webhook

1. Get a Twilio phone number (trial account works)
2. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
3. Click on your phone number
4. Scroll to "Voice & Fax" section
5. Set webhook URL to: `https://your-domain.com/api/twilio/incoming`
6. Set HTTP method to POST
7. Save

**For local testing**, use ngrok:
```bash
npx ngrok http 3000
```
Then use the ngrok URL in Twilio webhook: `https://your-ngrok-url.ngrok.io/api/twilio/incoming`

### 6. Create Your First Agent

1. Open http://localhost:3000
2. Click "Create Agent"
3. Fill in:
   - Name: "Battery Shop Assistant"
   - Description: "Handles battery orders"
   - Phone Number: Your Twilio number
   - Toggle "Active Status" ON
4. Save

### 7. Design Call Flow

1. Click "Configure" on your agent
2. Go to "Call Flow" tab
3. Add steps:
   - **Greeting**: "Assalamualaikum, battery shop se baat ho rahi hai, kya chahiye?"
   - **Collection**: Add fields: name, phone, item, quantity, address
   - **Confirmation**: "Aapka order confirm hai..."
   - **Goodbye**: "Thank you!"
4. Drag to reorder
5. Save Flow

### 8. Test the System

Call your Twilio phone number. The AI should answer and follow your flow!

Watch the dashboard:
- **Calls page**: See live transcripts
- **Orders page**: See automatically extracted orders

## Troubleshooting

- **WebSocket errors**: Make sure the WebSocket server is running on port 3001
- **Twilio not connecting**: Check webhook URL is accessible (use ngrok for local)
- **Database errors**: Verify Supabase RLS policies are set correctly
- **OpenAI errors**: Check your API key and account balance

## Next Steps

- Add authentication (Supabase Auth)
- Enhance data extraction with better NLP
- Add ElevenLabs TTS for better voices
- Add Deepgram for streaming STT
- Deploy to Vercel

