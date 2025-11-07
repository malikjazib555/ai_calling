import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id || '00000000-0000-0000-0000-000000000000'

  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const action = new URL(request.url).searchParams.get('action') || 'test'

  if (action === 'test') {
    // Send test webhook
    const supabase = await createClient()
    const { data: webhook } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single()

    if (webhook && webhook.is_active) {
      // Send test webhook to the URL
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': 'webhook.test',
          },
          body: JSON.stringify({
            event: 'webhook.test',
            timestamp: new Date().toISOString(),
            data: { message: 'This is a test webhook from BizzAI' },
          }),
        })
        return NextResponse.json({ success: true, message: 'Test webhook sent' })
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

