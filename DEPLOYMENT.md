# 🚀 Vercel Deployment Guide

Complete guide to deploy Bizzai to Vercel via GitHub.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ All API keys ready (Supabase, Twilio, OpenAI, etc.)

## Step-by-Step Deployment

### 1️⃣ Push Code to GitHub

```bash
# Make sure you're in the project directory
cd /Users/4star/Documents/Bizzai

# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create a new repository on GitHub (via web or CLI)
# Then add remote and push:
git remote add origin https://github.com/YOUR_USERNAME/bizzai.git
git branch -M main
git push -u origin main
```

**Or use GitHub CLI:**
```bash
gh repo create bizzai --public --source=. --remote=origin --push
```

### 2️⃣ Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"**
4. **Import Repository**: Select your GitHub repository
5. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Add Environment Variables** (see below)
7. **Click "Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? bizzai
# - Directory? ./
# - Override settings? No
```

### 3️⃣ Configure Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

#### 🔴 Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL
= your_supabase_project_url

NEXT_PUBLIC_SUPABASE_ANON_KEY
= your_supabase_anon_key

TWILIO_ACCOUNT_SID
= your_twilio_account_sid

TWILIO_AUTH_TOKEN
= your_twilio_auth_token

TWILIO_PHONE_NUMBER
= +1234567890

OPENAI_API_KEY
= sk-...
```

#### 🟡 Optional Variables:

```
DEEPGRAM_API_KEY
= your_deepgram_key

ELEVENLABS_API_KEY
= your_elevenlabs_key

NEXT_PUBLIC_APP_URL
= https://your-app.vercel.app
(Will be auto-set by Vercel, but you can override)
```

**Important:** 
- After adding variables, **redeploy** your app
- Variables are case-sensitive
- Don't add quotes around values

### 4️⃣ Update Twilio Webhooks

After deployment, you'll get a URL like: `https://bizzai-xyz.vercel.app`

1. Go to **Twilio Console** → **Phone Numbers** → **Manage** → **Active Numbers**
2. Click on your phone number
3. Scroll to **Voice & Fax** section
4. Update webhook URLs:
   - **A CALL COMES IN**: `https://your-app.vercel.app/api/twilio/incoming`
   - **CALL STATUS CHANGES**: `https://your-app.vercel.app/api/twilio/status`
   - **RECORDING STATUS**: `https://your-app.vercel.app/api/twilio/recording`
5. **Save** changes

### 5️⃣ Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Check if the app loads correctly
3. Test creating an agent
4. Make a test call

## 🔄 Updating Your Deployment

After making changes:

```bash
# Commit changes
git add .
git commit -m "Update features"

# Push to GitHub
git push origin main
```

Vercel will **automatically deploy** the new version!

## 🐛 Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build` locally

### Environment Variables Not Working

- Make sure variables are added in Vercel Dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Twilio Webhooks Not Working

- Verify webhook URLs are correct
- Check Twilio logs in Twilio Console
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Database Connection Issues

- Verify Supabase URL and keys
- Check Supabase project is active
- Ensure RLS policies allow access

## 📊 Monitoring

- **Vercel Dashboard**: View deployments, logs, analytics
- **Twilio Console**: Monitor calls, webhooks, errors
- **Supabase Dashboard**: Check database queries, logs

## 🎉 Success!

Your app is now live! Share your Vercel URL with others.

**Next Steps:**
- Set up custom domain (optional)
- Enable Vercel Analytics
- Set up monitoring alerts

