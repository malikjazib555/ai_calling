import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
})

export async function generateSpeech(text: string, voiceId: string): Promise<Buffer> {
  try {
    const audio = await elevenlabs.generate({
      voice: voiceId,
      text: text,
      model_id: 'eleven_multilingual_v2', // Supports Urdu/Hindi
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    })

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of audio) {
      chunks.push(chunk)
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
    return voices.voices || []
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
