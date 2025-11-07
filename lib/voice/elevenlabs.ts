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
  try {
    const voice = await elevenlabs.voices.add({
      name,
      files: audioFiles,
      description: `Custom voice for ${name}`,
    })
    return voice.voice_id
  } catch (error) {
    console.error('Error creating custom voice:', error)
    throw error
  }
}
