import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { triggerWebhooks } from '@/lib/integrations/webhooks'

export async function POST(request: Request) {
  const formData = await request.formData()
  const callSid = formData.get('CallSid') as string
  const recordingUrl = formData.get('RecordingUrl') as string
  const recordingDuration = formData.get('RecordingDuration') as string

  const supabase = await createClient()

  // Get call log
  const { data: callLog } = await supabase
    .from('call_logs')
    .select('*')
    .eq('call_sid', callSid)
    .single()

  if (callLog && recordingUrl) {
    // Save recording
    await supabase.from('call_recordings').insert({
      call_log_id: callLog.id,
      recording_url: recordingUrl,
      duration_seconds: parseInt(recordingDuration) || 0,
      format: 'mp3',
    })

    // Trigger webhook
    await triggerWebhooks('call.ended', {
      call_log_id: callLog.id,
      call_sid: callSid,
      recording_url: recordingUrl,
    }, callLog.agent_id)
  }

  return new NextResponse('OK', { status: 200 })
}

