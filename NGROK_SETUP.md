# Local Development Setup with ngrok

Twilio requires a publicly accessible URL for webhooks. For local development, use **ngrok** to expose your local server.

## Quick Setup

### 1. Install ngrok

**macOS:**
```bash
brew install ngrok/ngrok/ngrok
```

**Or download from:** https://ngrok.com/download

**Or via npm:**
```bash
npm install -g ngrok
```

### 2. Start ngrok

In a **separate terminal**, run:
```bash
ngrok http 3000
```

This will output something like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### 3. Copy the HTTPS URL

Copy the `https://` URL (not the `http://` one). For example:
```
https://abc123.ngrok.io
```

### 4. Set Environment Variable

Create or update your `.env.local` file:
```bash
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

### 5. Restart Next.js Server

Restart your Next.js development server:
```bash
npm run dev
```

### 6. Test Call

Now you can make test calls! The Twilio webhooks will work correctly.

## Using the Helper Script

You can also use the provided script:
```bash
chmod +x scripts/setup-ngrok.sh
./scripts/setup-ngrok.sh
```

## Important Notes

- **Keep ngrok running** while testing calls
- The ngrok URL changes each time you restart ngrok (unless you have a paid plan)
- For production, deploy to **Vercel** (recommended) or another hosting service
- Make sure your `.env.local` file is in `.gitignore` (it should be by default)

## Troubleshooting

### ngrok URL not working?
- Make sure ngrok is still running
- Check that `NEXT_PUBLIC_APP_URL` matches the ngrok HTTPS URL exactly
- Restart your Next.js server after setting the environment variable

### Port 3000 already in use?
- Make sure Next.js is running on port 3000
- Or change the port: `ngrok http 3001` and update `NEXT_PUBLIC_APP_URL` accordingly

### Still having issues?
- Check Twilio console for webhook errors
- Verify your Twilio credentials in Settings
- Make sure your phone number is verified in Twilio

