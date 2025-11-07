import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const callSid = formData.get('CallSid') as string
  const callStatus = formData.get('CallStatus') as string
  const callDuration = formData.get('CallDuration') as string

  const supabase = await createClient()

  // Update call log status
  await supabase
    .from('call_logs')
    .update({
      status: callStatus,
      duration_seconds: parseInt(callDuration) || 0,
      ended_at: callStatus === 'completed' ? new Date().toISOString() : null,
    })
    .eq('call_sid', callSid)

  return new NextResponse('OK', { status: 200 })
}

