# Quick ngrok Setup

ngrok ko use karne ke liye free account chahiye. Ye steps follow karein:

## Option 1: Quick Auto-Setup (Recommended)

```bash
./scripts/setup-ngrok-auto.sh
```

Yeh script:
1. ngrok install karega (agar nahi hai)
2. Aapko authtoken enter karne ko kahega
3. ngrok start karega
4. URL automatically set kar dega

## Option 2: Manual Setup

### Step 1: Sign up (Free)
https://dashboard.ngrok.com/signup

### Step 2: Get Authtoken
https://dashboard.ngrok.com/get-started/your-authtoken

### Step 3: Configure Token
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Step 4: Start ngrok
```bash
ngrok http 3000
```

### Step 5: Copy HTTPS URL
ngrok web interface se HTTPS URL copy karein (jaise: `https://abc123.ngrok.io`)

### Step 6: Set Environment Variable
`.env.local` file mein add karein:
```
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

### Step 7: Restart Next.js
Server restart karein.

---

**Note:** Free ngrok account se URL har restart par change hota hai. Production ke liye Vercel use karein.

