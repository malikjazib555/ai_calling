import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
})

export async function generateSpeech(text: string, voiceId: string): Promise<Buffer> {
  try {
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      modelId: 'eleven_multilingual_v2', // Supports Urdu/Hindi
    })

    // Convert ReadableStream to buffer
    const reader = audio.getReader()
    const chunks: Uint8Array[] = []
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    
    return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)))
  } catch (error) {
    console.error('ElevenLabs TTS error:', error)
    throw error
  }
}

export async function getVoices() {
  try {
    const voices = await elevenlabs.voices.getAll()
    return voices || []
  } catch (error) {
    console.error('Error fetching voices:', error)
    return []
  }
}

export async function createCustomVoice(name: string, audioFiles: File[]): Promise<string> {
  // TODO: Update to new ElevenLabs API v2.22.0
  // The API has changed and needs to be updated
  throw new Error('Custom voice creation not yet implemented for ElevenLabs v2.22.0')
}
