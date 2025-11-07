import OpenAI from 'openai'
import { Twilio } from 'twilio'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { analyzeCallTranscript, triggerWebhooks } from '@/lib/integrations/webhooks'
import { detectLanguage } from '@/lib/ai/analysis'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: Request,
  { params }: { params: { callSid: string } }
) {
  const { callSid } = params
  const formData = await request.formData()
  const speechResult = formData.get('SpeechResult') as string
  const from = formData.get('From') as string

  const supabase = await createClient()

  // Get call log - find by phone number and call_sid if available
  const { data: callLog } = await supabase
    .from('call_logs')
    .select('*, ai_agents(*)')
    .eq('phone_number', from)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!callLog) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Call not found.</Say></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  // Get flow steps
  const { data: flowSteps } = await supabase
    .from('flow_steps')
    .select('*')
    .eq('agent_id', callLog.agent_id)
    .eq('is_enabled', true)
    .order('step_order', { ascending: true })

  // Detect language from user input
  const detectedLanguage = await detectLanguage(speechResult)
  const isHindiUrdu = detectedLanguage === 'hi' || detectedLanguage === 'ur'
  
  // Build system prompt from flow steps with language support
  const systemPrompt = buildSystemPrompt(flowSteps || [], callLog.ai_agents, detectedLanguage)
  
  // Get conversation history
  const aiResponses = callLog.ai_responses || []
  const conversationHistory = aiResponses.map((r: any) => ({
    role: r.role,
    content: r.content,
  }))

  // Call OpenAI with multilingual support
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: speechResult },
    ],
    temperature: 0.7,
  })

  const aiResponse = completion.choices[0].message.content || ''

  // Extract structured data (works with Hindi/Urdu too)
  const extractedData = extractOrderData(aiResponse, speechResult, detectedLanguage)

  // Update call log
  const updatedTranscript = (callLog.transcript || '') + `\nUser: ${speechResult}\nAI: ${aiResponse}`
  
  await supabase
    .from('call_logs')
    .update({
      transcript: updatedTranscript,
      ai_responses: [
        ...aiResponses,
        { role: 'user', content: speechResult },
        { role: 'assistant', content: aiResponse },
      ],
      extracted_data: { ...callLog.extracted_data, ...extractedData },
      status: 'answered',
    })
    .eq('id', callLog.id)

  // Analyze transcript for sentiment and intent
  try {
    const analysis = await analyzeCallTranscript(updatedTranscript, callLog.id, callLog.agent_id)
    
    // Trigger webhook for call analysis
    await triggerWebhooks('call.analyzed', {
      call_log_id: callLog.id,
      agent_id: callLog.agent_id,
      sentiment: analysis.sentiment,
      intent: analysis.intent,
      language: analysis.language,
    }, callLog.agent_id)
  } catch (error) {
    console.error('Analysis error:', error)
  }

  // If order is complete, create order
  if (extractedData.customer_name && extractedData.item && extractedData.quantity && extractedData.address) {
    const { data: order } = await supabase.from('orders').insert({
      agent_id: callLog.agent_id,
      call_log_id: callLog.id,
      customer_name: extractedData.customer_name,
      phone: from,
      item: extractedData.item,
      quantity: parseInt(extractedData.quantity) || 1,
      address: extractedData.address,
    }).select().single()

    // Trigger webhook for order creation
    if (order) {
      await triggerWebhooks('order.created', {
        order_id: order.id,
        agent_id: callLog.agent_id,
        customer_name: extractedData.customer_name,
        item: extractedData.item,
        quantity: extractedData.quantity,
      }, callLog.agent_id)
    }
  }

  // Generate TwiML response
  const VoiceResponse = (await import('twilio/lib/twiml/VoiceResponse')).default
  const twiml = new VoiceResponse()
  
  // Use configured voice settings
  const voice = callLog.ai_agents?.voice_id || 'alice'
  const language = callLog.ai_agents?.voice_language || 'en-US'
  
  // Use TTS for response
  twiml.say({
    voice: voice,
    language: language,
  }, aiResponse)

  // Continue listening
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

function buildSystemPrompt(flowSteps: any[], agent: any, detectedLanguage: string = 'en'): string {
  const isHindiUrdu = detectedLanguage === 'hi' || detectedLanguage === 'ur'
  const languageName = detectedLanguage === 'hi' ? 'Hindi' : detectedLanguage === 'ur' ? 'Urdu' : 'English'
  
  let prompt = `You are an AI phone assistant for ${agent.name}. ${agent.description || ''}\n\n`
  
  // Add language instruction
  if (isHindiUrdu) {
    prompt += `IMPORTANT: The customer is speaking in ${languageName}. You MUST respond in ${languageName} (${detectedLanguage === 'hi' ? 'हिंदी' : 'اردو'}). Use natural ${languageName} conversation style.\n\n`
  }
  
  prompt += 'Follow this conversation flow:\n\n'
  
  flowSteps.forEach((step, index) => {
    prompt += `${index + 1}. ${step.title} (${step.step_type}): ${step.prompt_text}\n`
    if (step.fields_to_collect && step.fields_to_collect.length > 0) {
      prompt += `   Collect: ${step.fields_to_collect.join(', ')}\n`
    }
  })

  if (isHindiUrdu) {
    prompt += `\nRespond in ${languageName}. Be natural, conversational, and helpful. Extract customer information (name, item, quantity, address, phone) in ${languageName}. Use ${languageName} script naturally.`
  } else {
    prompt += '\nBe natural, conversational, and helpful. Extract customer information as you go.'
  }
  
  return prompt
}

function extractOrderData(aiResponse: string, userInput: string, language: string = 'en'): Record<string, any> {
  const data: Record<string, any> = {}
  const isHindiUrdu = language === 'hi' || language === 'ur'
  
  // Use OpenAI to extract structured data (works better with Hindi/Urdu)
  // For now, use pattern matching + AI response parsing
  
  // Extract name (works with Hindi/Urdu names too)
  const namePatterns = isHindiUrdu 
    ? [
        /(?:नाम|name|naam).*?([\u0900-\u097F\u0600-\u06FF\w\s]+)/i, // Hindi/Urdu name patterns
        /(?:मेरा नाम|mera naam|mera naam).*?([\u0900-\u097F\u0600-\u06FF\w\s]+)/i,
        /(?:name is|naam hai).*?([\u0900-\u097F\u0600-\u06FF\w\s]+)/i,
      ]
    : [/(?:name is|my name is).*?([\w\s]+)/i]
  
  for (const pattern of namePatterns) {
    const match = userInput.match(pattern) || aiResponse.match(pattern)
    if (match && match[1]) {
      data.customer_name = match[1].trim()
      break
    }
  }

  // Extract phone (works universally)
  const phoneMatch = userInput.match(/(\+?\d{10,})/) || aiResponse.match(/(\+?\d{10,})/)
  if (phoneMatch) data.phone = phoneMatch[1]

  // Extract quantity (works with Hindi/Urdu numbers)
  const quantityPatterns = isHindiUrdu
    ? [
        /(?:quantity|मात्रा|miqdar|kitne|कितने).*?(\d+)/i,
        /(\d+).*?(?:battery|batteries|बैटरी|battari)/i,
      ]
    : [/(?:quantity|qty).*?(\d+)/i, /(\d+)/]
  
  for (const pattern of quantityPatterns) {
    const match = userInput.match(pattern) || aiResponse.match(pattern)
    if (match && match[1]) {
      data.quantity = match[1]
      break
    }
  }

  // Extract address (works with Hindi/Urdu addresses)
  const addressPatterns = isHindiUrdu
    ? [
        /(?:address|पता|pata|address hai).*?([\u0900-\u097F\u0600-\u06FF\w\s,.-]+)/i,
        /(?:delivery|डिलीवरी|delivery).*?([\u0900-\u097F\u0600-\u06FF\w\s,.-]+)/i,
      ]
    : [/(?:address|delivery).*?([\w\s,.-]+)/i]
  
  for (const pattern of addressPatterns) {
    const match = userInput.match(pattern) || aiResponse.match(pattern)
    if (match && match[1]) {
      data.address = match[1].trim()
      break
    }
  }

  // Extract item (works with Hindi/Urdu item names)
  const itemPatterns = isHindiUrdu
    ? [
        /(?:battery|बैटरी|battari|item|सामान|saman).*?([\u0900-\u097F\u0600-\u06FF\w\s]+)/i,
        /(?:chahiye|चाहिए|want|need).*?([\u0900-\u097F\u0600-\u06FF\w\s]+)/i,
      ]
    : [/(?:battery|item|product).*?([\w\s]+)/i]
  
  for (const pattern of itemPatterns) {
    const match = userInput.match(pattern) || aiResponse.match(pattern)
    if (match && match[1]) {
      data.item = match[1].trim()
      break
    }
  }

  // If extraction failed, try to get from AI response summary
  if (!data.customer_name || !data.item) {
    // AI response usually contains extracted info
    const summaryMatch = aiResponse.match(/customer[:\s]+([^,]+)|name[:\s]+([^,]+)/i)
    if (summaryMatch) {
      data.customer_name = data.customer_name || summaryMatch[1] || summaryMatch[2]
    }
  }

  return data
}
