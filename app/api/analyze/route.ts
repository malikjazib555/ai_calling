import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { analyzeCallTranscript, triggerWebhooks } from '@/lib/integrations/webhooks'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { callLogId, agentId, transcript } = body

  // Analyze transcript
  const analysis = await analyzeCallTranscript(transcript, callLogId, agentId)

  // Trigger webhooks
  await triggerWebhooks('call.analyzed', {
    call_log_id: callLogId,
    agent_id: agentId,
    sentiment: analysis.sentiment,
    intent: analysis.intent,
    language: analysis.language,
  }, agentId)

  return NextResponse.json({ success: true, analysis })
}

