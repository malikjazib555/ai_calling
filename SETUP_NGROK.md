# 🚀 ngrok Quick Setup - 2 Minutes

ngrok ko use karne ke liye **free signup** chahiye (sirf email). Phir main automatically sab setup kar dunga.

## ⚡ Quick Steps:

### 1. Sign up (30 seconds)
👉 **https://dashboard.ngrok.com/signup**

Sirf email se signup karein (free hai)

### 2. Get Authtoken (10 seconds)
👉 **https://dashboard.ngrok.com/get-started/your-authtoken**

Copy your authtoken (jaise: `2abc123xyz...`)

### 3. Run Setup Script
```bash
./scripts/setup-ngrok-auto.sh
```

Script aapko authtoken enter karne ko kahega. Enter karne ke baad sab automatically setup ho jayega!

---

## 🎯 Alternative: Manual Setup

Agar script use nahi karna chahte:

```bash
# 1. Configure token
ngrok config add-authtoken YOUR_TOKEN_HERE

# 2. Start ngrok
ngrok http 3000

# 3. Copy HTTPS URL from ngrok output (jaise: https://abc123.ngrok.io)

# 4. Set in .env.local
echo "NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io" >> .env.local

# 5. Restart Next.js server
```

---

**Note:** Free ngrok account se URL har restart par change hota hai. Production ke liye Vercel use karein (automatic public URL).

