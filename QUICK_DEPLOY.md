# 🚀 Quick Deploy to Vercel - Step by Step

## ✅ Step 1: Push to GitHub

### Option A: Using GitHub CLI (Easiest)

```bash
cd /Users/4star/Documents/Bizzai

# Install GitHub CLI if not installed
# brew install gh

# Login to GitHub
gh auth login

# Create repository and push
gh repo create bizzai --public --source=. --remote=origin --push
```

### Option B: Manual GitHub Setup

```bash
cd /Users/4star/Documents/Bizzai

# Create a new repository on GitHub.com (don't initialize with README)

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/bizzai.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username**

## ✅ Step 2: Deploy to Vercel

### Via Vercel Dashboard:

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click**: "Add New Project"
4. **Import**: Select your `bizzai` repository
5. **Configure**:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Environment Variables**: Add these (see below)
7. **Click**: "Deploy"

### Via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
```

## ✅ Step 3: Add Environment Variables

In **Vercel Dashboard → Your Project → Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
TWILIO_ACCOUNT_SID = your_twilio_account_sid
TWILIO_AUTH_TOKEN = your_twilio_auth_token
TWILIO_PHONE_NUMBER = +1234567890
OPENAI_API_KEY = sk-your_openai_key
```

**Important:** After adding variables, click **"Redeploy"**

## ✅ Step 4: Update Twilio Webhooks

After deployment, you'll get a URL like: `https://bizzai-xyz.vercel.app`

1. Go to **Twilio Console**: https://console.twilio.com
2. **Phone Numbers** → **Manage** → **Active Numbers**
3. Click your phone number
4. Update webhooks:
   - **A CALL COMES IN**: `https://your-app.vercel.app/api/twilio/incoming`
   - **CALL STATUS**: `https://your-app.vercel.app/api/twilio/status`
   - **RECORDING STATUS**: `https://your-app.vercel.app/api/twilio/recording`
5. **Save**

## ✅ Step 5: Test

1. Visit your Vercel URL
2. Create an agent
3. Make a test call
4. Check if everything works!

## 🎉 Done!

Your app is now live on Vercel!

**Next:** Share your Vercel URL with others.

