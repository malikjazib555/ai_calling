import VoiceResponse from 'twilio/lib/twiml/VoiceResponse'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { callSid: string } }
) {
  const { callSid } = params
  const twiml = new VoiceResponse()
  
  // Start the conversation
  twiml.say({
    voice: 'alice',
    language: 'en-US',
  }, 'Hello! Thank you for calling. How can I help you today?')

  // Gather speech input
  twiml.gather({
    input: ['speech'],
    action: `/api/twilio/process/${callSid}`,
    method: 'POST',
    speechTimeout: 'auto',
  })

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}

