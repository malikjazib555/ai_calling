import { Twilio } from 'twilio'
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { triggerWebhooks } from '@/lib/integrations/webhooks'
import { getSetting } from '@/lib/storage'

async function getTwilioCredentials(userId: string) {
  const supabase = await createClient()
  
  // Try to get from database first
  const { data, error } = await supabase
    .from('user_settings')
    .select('setting_key, setting_value')
    .eq('user_id', userId)
    .in('setting_key', ['twilio_account_sid', 'twilio_auth_token'])

  let accountSid: string | null = null
  let authToken: string | null = null

  if (!error && data) {
    data.forEach((item: any) => {
      if (item.setting_key === 'twilio_account_sid') accountSid = item.setting_value
      if (item.setting_key === 'twilio_auth_token') authToken = item.setting_value
    })
  }

  // Fallback to in-memory storage
  if (!accountSid) accountSid = getSetting(userId, 'twilio_account_sid')
  if (!authToken) authToken = getSetting(userId, 'twilio_auth_token')

  // Fallback to environment variables only (no hardcoded values for security)

  // Fallback to environment variables
  return {
    accountSid: accountSid || process.env.TWILIO_ACCOUNT_SID || null,
    authToken: authToken || process.env.TWILIO_AUTH_TOKEN || null,
  }
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const callSid = formData.get('CallSid') as string
  const from = formData.get('From') as string
  const to = formData.get('To') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || '00000000-0000-0000-0000-000000000000'
  
  // Find active agent for this phone number
  const { data: agent } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('phone_number', to)
    .eq('is_active', true)
    .single()

  if (!agent) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>No active agent found for this number.</Say></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  // Create call log
  const { data: callLog } = await supabase
    .from('call_logs')
    .insert({
      agent_id: agent.id,
      phone_number: from,
      status: 'ringing',
      call_sid: callSid,
    })
    .select()
    .single()

  // Trigger webhook for call started
  if (callLog) {
    await triggerWebhooks('call.started', {
      call_log_id: callLog.id,
      call_sid: callSid,
      agent_id: agent.id,
      phone_number: from,
    }, agent.id)
  }

  // Get Twilio credentials
  const credentials = await getTwilioCredentials(userId)
  
  if (!credentials.accountSid || !credentials.authToken) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Twilio credentials not configured.</Say></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  const twilio = new Twilio(
    credentials.accountSid,
    credentials.authToken
  )

  // Generate TwiML for the call
  const twiml = new VoiceResponse()
  
  // Connect to WebSocket for real-time transcription
  const wsUrl = `${process.env.NEXT_PUBLIC_APP_URL?.replace('http', 'ws')}/ws/call/${callSid}`
  
  twiml.say('Connecting you to our AI assistant.')
  twiml.redirect(`/api/twilio/connect/${callSid}`)

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}

