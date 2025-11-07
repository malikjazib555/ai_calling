import { Twilio } from 'twilio'
import { generateSpeech } from './elevenlabs'
import { createClient } from '@/lib/supabase/server'

export async function getTTSResponse(
  text: string,
  agentId: string
): Promise<{ type: 'twiml' | 'audio'; content: string | Buffer }> {
  const supabase = await createClient()
  
  // Get agent voice settings
  const { data: agent } = await supabase
    .from('ai_agents')
    .select('voice_provider, voice_id, voice_language, voice_settings')
    .eq('id', agentId)
    .single()

  if (!agent) {
    // Default Twilio TTS
    return {
      type: 'twiml',
      content: `<Say voice="alice" language="en-US">${text}</Say>`,
    }
  }

  // Use ElevenLabs if configured
  if (agent.voice_provider === 'elevenlabs' && agent.voice_id) {
    try {
      const audioBuffer = await generateSpeech(text, agent.voice_id)
      
      // Upload to Twilio or return audio URL
      // For now, we'll use Twilio's <Play> with external URL
      // In production, upload audio to a CDN or Twilio Assets
      
      return {
        type: 'audio',
        content: audioBuffer,
      }
    } catch (error) {
      console.error('ElevenLabs failed, falling back to Twilio:', error)
      // Fallback to Twilio
    }
  }

  // Use Twilio TTS
  const voice = agent.voice_id || 'alice'
  const language = agent.voice_language || 'en-US'
  
  return {
    type: 'twiml',
    content: `<Say voice="${voice}" language="${language}">${text}</Say>`,
  }
}

