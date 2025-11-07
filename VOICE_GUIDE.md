# AI Voice Setup Guide (Urdu/Hindi)

## Voice kaise use karein?

### 1. **Twilio Built-in Voices (Free)**

Yeh default option hai jo free mein available hai:
- **Alice** - English voice
- **Polly** - Natural sounding
- **Google** - High quality

**Setup:**
1. Agent editor mein "Voice" tab open karein
2. Voice Provider: **Twilio** select karein
3. Language: **Urdu** ya **Hindi** select karein
4. Save karein

### 2. **ElevenLabs Premium Voices (Better Quality)**

Yeh premium option hai jo zyada natural aur customizable hai:

**Setup Steps:**

1. **ElevenLabs Account banaein:**
   - [elevenlabs.io](https://elevenlabs.io) par account banaein
   - API key copy karein

2. **Environment Variable add karein:**
   ```bash
   ELEVENLABS_API_KEY=your_api_key_here
   ```

3. **Agent Settings mein:**
   - Voice Provider: **ElevenLabs** select karein
   - Available voices mein se choose karein
   - Save karein

### 3. **Custom Voice Training (Apna Voice Train Karein)**

Apna custom voice train karne ke liye:

**Requirements:**
- Minimum **1 minute** audio samples
- Clear audio (no background noise)
- Multiple audio files (better quality ke liye)
- MP3, WAV, ya M4A format

**Steps:**

1. **Audio Files Prepare Karein:**
   - Clear voice recordings (minimum 1 minute total)
   - Same person ki voice ho
   - Urdu/Hindi mein bhi ho sakta hai

2. **Voice Create Karein:**
   - Agent editor → Voice tab
   - "Create Custom Voice" section mein
   - Voice name enter karein
   - Audio files upload karein
   - "Train Voice" button click karein

3. **Wait for Training:**
   - Training mein 5-10 minutes lag sakte hain
   - Complete hone ke baad voice available ho jayega

**Tips:**
- Zyada audio = Better quality
- Clear recordings use karein
- Same microphone/device se record karein
- Natural speaking style

### 4. **Voice Settings**

**Language Options:**
- English (US/UK)
- Hindi (hi-IN)
- Urdu (ur-PK)
- Spanish, French, German, etc.

**Voice Quality:**
- **Twilio**: Free, basic quality
- **ElevenLabs**: Paid, premium quality, multilingual support

### 5. **Usage in Calls**

Jab customer call karega:
1. AI automatically configured voice use karega
2. Urdu/Hindi mein bhi respond kar sakta hai
3. Natural conversation flow

### Example Setup (Battery Shop):

```
Voice Provider: ElevenLabs
Voice: Custom "Battery Shop Voice"
Language: Urdu (ur-PK)
```

**Greeting:**
"Assalamualaikum, battery shop se baat ho rahi hai..."

### Troubleshooting

**Voice nahi aa raha?**
- Check API keys
- Verify agent is active
- Check voice settings saved hai

**Custom voice training fail ho raha hai?**
- Minimum 1 minute audio ensure karein
- Audio format check karein (MP3/WAV/M4A)
- Clear audio use karein

**Language support nahi hai?**
- ElevenLabs multilingual voices use karein
- Model: `eleven_multilingual_v2` select karein

### Cost

- **Twilio**: Free (included in Twilio plan)
- **ElevenLabs**: ~$0.18 per 1000 characters
- **Custom Voice**: One-time training, then pay-per-use

### Best Practices

1. **Test voice** pehle se before production
2. **Language match** karein customer language se
3. **Natural tone** use karein
4. **Pronunciation** check karein (Urdu/Hindi words ke liye)

### Code Examples

Voice settings automatically use hoti hain jab:
- Call aata hai
- AI response generate hota hai
- TwiML response create hota hai

Sab kuch automatic hai - bas settings configure karein! 🎤

