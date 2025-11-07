import { createClient } from '@/lib/supabase/server'
import { analyzeSentiment, detectIntent, detectLanguage } from '@/lib/ai/analysis'

export async function triggerWebhooks(
  event: string,
  data: Record<string, any>,
  agentId?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // Get active webhooks for this event
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('is_active', true)
    .contains('events', [event])

  if (!webhooks || webhooks.length === 0) return

  // Send webhooks
  for (const webhook of webhooks) {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': webhook.secret || '',
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data,
        }),
      })
    } catch (error) {
      console.error(`Webhook failed for ${webhook.url}:`, error)
    }
  }
}

export async function analyzeCallTranscript(
  transcript: string,
  callLogId: string,
  agentId: string
) {
  const supabase = await createClient()

  // Analyze sentiment
  const sentiment = await analyzeSentiment(transcript)

  // Detect intent
  const intent = await detectIntent(transcript)

  // Detect language
  const language = await detectLanguage(transcript)

  // Save analytics
  await supabase.from('call_analytics').insert({
    call_log_id: callLogId,
    agent_id: agentId,
    sentiment_score: sentiment.score,
    intent_detected: intent.intent,
    keywords: intent.entities,
  })

  return { sentiment, intent, language }
}

export async function sendNotification(
  userId: string,
  type: 'email' | 'sms' | 'push',
  eventType: string,
  recipient: string,
  subject: string,
  message: string
) {
  const supabase = await createClient()

  // Save notification
  const { data } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    event_type: eventType,
    recipient,
    subject,
    message,
    status: 'pending',
  }).select().single()

  // Send notification based on type
  if (type === 'email') {
    // Integrate with email service (SendGrid, Resend, etc.)
    console.log('Sending email to:', recipient)
  } else if (type === 'sms') {
    // Integrate with SMS service (Twilio SMS, etc.)
    console.log('Sending SMS to:', recipient)
  }

  return data
}

