# 🚀 Bizzai - AI Phone Agent Platform

Modern SaaS platform for building automated AI phone agents with natural conversation, real-time transcription, and intelligent call handling.

## ✨ Features

- 🤖 **AI Phone Agents** - Automated call handling with OpenAI GPT-4
- 🎙️ **Real-time Transcription** - Live call transcripts with Deepgram
- 🗣️ **Natural Voice** - Custom voice training with ElevenLabs
- 📊 **Analytics Dashboard** - Call analytics, sentiment analysis, and insights
- 🔄 **Webhook Integration** - Real-time event notifications
- 🌍 **Multi-language Support** - Hindi, Urdu, English with auto-detection
- 📞 **Twilio Integration** - Professional phone system integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, WebSockets
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4, Deepgram STT, ElevenLabs TTS
- **Voice**: Twilio Voice API

## 📦 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)
- Twilio account (for phone calls)
- OpenAI API key
- Deepgram API key (optional)
- ElevenLabs API key (optional)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd Bizzai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 🌐 Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Click **"Deploy"**

### Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

#### Required:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
OPENAI_API_KEY=your_openai_api_key
```

#### Optional:
```
DEEPGRAM_API_KEY=your_deepgram_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

**Important:** After adding environment variables, redeploy your app.

### Step 3: Update Twilio Webhooks

After deployment, update Twilio webhook URLs:

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Update webhook URLs:
   - **Voice & Fax**: `https://your-app.vercel.app/api/twilio/incoming`
   - **Status Callback**: `https://your-app.vercel.app/api/twilio/status`
   - **Recording Callback**: `https://your-app.vercel.app/api/twilio/recording`

## 📚 Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql`
3. Update environment variables with your Supabase credentials

## 🔧 Development

```bash
# Run development server
npm run dev

# Run WebSocket server (for real-time features)
npm run ws

# Build for production
npm run build

# Start production server
npm start
```

## 📖 Documentation

- [Database Setup](./DATABASE_SETUP.md)
- [ngrok Setup (Local Testing)](./SETUP_NGROK.md)
- [API Documentation](./docs/API.md)

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📄 License

MIT License

## 🆘 Support

For issues and questions, please open a GitHub issue.
