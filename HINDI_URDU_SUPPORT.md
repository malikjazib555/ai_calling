# Hindi/Urdu Support - Complete Guide

## ✅ Hindi/Urdu Support Features

### 1. **Automatic Language Detection**
- AI automatically detects if customer is speaking Hindi/Urdu
- Uses GPT-4 language detection
- Supports: Hindi (hi), Urdu (ur), English (en)

### 2. **Auto Language Response**
- AI automatically responds in same language
- Hindi input → Hindi response
- Urdu input → Urdu response
- English input → English response

### 3. **Natural Conversation**
- Uses natural Hindi/Urdu script (Devanagari/Urdu)
- Understands Hindi/Urdu names, addresses, items
- Extracts data in Hindi/Urdu format

### 4. **Voice Support**
- Twilio supports Hindi/Urdu voices
- ElevenLabs multilingual voices
- Natural pronunciation

## 🎯 How It Works

### Example Conversation (Urdu):

**Customer:** "Assalamualaikum, battery chahiye"

**AI (Auto-detects Urdu):** "Walaykum Assalam! Kaun si battery chahiye aapko?"

**Customer:** "Mera naam Ahmed hai, mujhe 2 batteries chahiye"

**AI:** "Bilkul Ahmed sahab. Kaun si brand chahiye aur address kya hai?"

**Customer:** "Exide brand, address hai Karachi mein"

**AI:** "Theek hai Ahmed sahab, order confirm ho gaya. 2 Exide batteries Karachi address par deliver hongi."

### Example Conversation (Hindi):

**Customer:** "Namaste, battery chahiye"

**AI (Auto-detects Hindi):** "Namaste! Kaun si battery chahiye?"

**Customer:** "Mera naam Rajesh hai, mujhe 3 batteries chahiye"

**AI:** "Bilkul Rajesh ji. Kaun si brand aur address bataiye?"

**Customer:** "Amara Raja brand, address Delhi mein hai"

**AI:** "Theek hai Rajesh ji, order confirm. 3 Amara Raja batteries Delhi address par deliver hongi."

## 🔧 Technical Details

### Language Detection:
```typescript
// Automatically detects language
const detectedLanguage = await detectLanguage(speechResult)
// Returns: 'hi', 'ur', or 'en'
```

### System Prompt:
- Automatically adds language instruction
- Tells GPT-4 to respond in detected language
- Uses natural Hindi/Urdu script

### Data Extraction:
- Works with Hindi/Urdu text
- Extracts names, addresses, items
- Handles Devanagari and Urdu script

## 📝 Setup

### 1. Voice Settings:
- Language: Hindi (hi-IN) or Urdu (ur-PK)
- Voice Provider: Twilio or ElevenLabs
- Save settings

### 2. Flow Steps:
You can write flow steps in Hindi/Urdu:

**Example Greeting:**
```
"Assalamualaikum, battery shop se baat ho rahi hai. Kya chahiye aapko?"
```

**Example Collection:**
```
"Apna naam, phone number, aur address batayein please."
```

### 3. Test:
1. Make test call
2. Speak in Hindi/Urdu
3. AI will respond in same language
4. Check transcript in Calls page

## ✅ Features

- ✅ Auto language detection
- ✅ Auto language response
- ✅ Hindi script support (Devanagari)
- ✅ Urdu script support (Nastaliq)
- ✅ Natural conversation
- ✅ Data extraction in Hindi/Urdu
- ✅ Voice support for Hindi/Urdu

## 🎤 Voice Options

### Twilio:
- Language: `hi-IN` (Hindi)
- Language: `ur-PK` (Urdu)
- Free voices available

### ElevenLabs:
- Multilingual model: `eleven_multilingual_v2`
- Supports Hindi/Urdu naturally
- Better quality

## 💡 Tips

1. **Flow Steps:** Write in Hindi/Urdu for better context
2. **Voice:** Use Hindi/Urdu language setting
3. **Test:** Always test with Hindi/Urdu speakers
4. **Names:** System handles Hindi/Urdu names naturally

## 🚀 Ready to Use!

**Ab aap Hindi/Urdu mein baat kar sakte hain!**

1. Agent create karein
2. Voice language set karein (Hindi/Urdu)
3. Test call karein
4. Hindi/Urdu mein baat karein
5. AI automatically same language mein respond karega!

**Sab kuch automatic hai!** 🎉

