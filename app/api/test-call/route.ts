import { Twilio } from 'twilio'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getSetting, getAgents, debugAgents, getAllAgents } from '@/lib/storage'

async function getTwilioCredentials(userId: string) {
  const supabase = await createClient()
  
  console.log('[Test Call] Fetching Twilio credentials for userId:', userId)
  
  // Try to get from database first
  const { data, error } = await supabase
    .from('user_settings')
    .select('setting_key, setting_value')
    .eq('user_id', userId)
    .in('setting_key', ['twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number'])

  console.log('[Test Call] Database query result:', { data, error })

  let accountSid: string | null = null
  let authToken: string | null = null
  let phoneNumber: string | null = null

  if (!error && data && data.length > 0) {
    data.forEach((item: any) => {
      if (item.setting_key === 'twilio_account_sid') accountSid = item.setting_value
      if (item.setting_key === 'twilio_auth_token') authToken = item.setting_value
      if (item.setting_key === 'twilio_phone_number') phoneNumber = item.setting_value
    })
    console.log('[Test Call] Found in database:', { accountSid: accountSid ? '***' + accountSid.slice(-4) : null, authToken: authToken ? '***' : null, phoneNumber })
  }

  // Fallback to in-memory storage
  if (!accountSid) {
    accountSid = getSetting(userId, 'twilio_account_sid')
    console.log('[Test Call] Checked memory storage for accountSid:', accountSid ? '***' + accountSid.slice(-4) : 'not found')
  }
  if (!authToken) {
    authToken = getSetting(userId, 'twilio_auth_token')
    console.log('[Test Call] Checked memory storage for authToken:', authToken ? '***' : 'not found')
  }
  if (!phoneNumber) {
    phoneNumber = getSetting(userId, 'twilio_phone_number')
    console.log('[Test Call] Checked memory storage for phoneNumber:', phoneNumber || 'not found')
  }

  // Fallback to environment variables only (no hardcoded values for security)

  // Fallback to environment variables
  const finalCredentials = {
    accountSid: accountSid || process.env.TWILIO_ACCOUNT_SID || null,
    authToken: authToken || process.env.TWILIO_AUTH_TOKEN || null,
    phoneNumber: phoneNumber || process.env.TWILIO_PHONE_NUMBER || null,
  }
  
  console.log('[Test Call] Final credentials:', {
    accountSid: finalCredentials.accountSid ? '***' + finalCredentials.accountSid.slice(-4) : 'missing',
    authToken: finalCredentials.authToken ? '***' : 'missing',
    phoneNumber: finalCredentials.phoneNumber || 'missing',
  })

  return finalCredentials
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    console.log('[Test Call] Starting test call for userId:', userId)

    // Get Twilio credentials from settings or environment
    const credentials = await getTwilioCredentials(userId)

    if (!credentials.accountSid || !credentials.authToken) {
      console.error('[Test Call] Missing credentials:', {
        accountSid: !!credentials.accountSid,
        authToken: !!credentials.authToken,
        phoneNumber: !!credentials.phoneNumber,
      })
      
      // Try to get from settings API directly as fallback
      try {
        const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/settings`)
        const settingsData = await settingsRes.json()
        console.log('[Test Call] Fetched from settings API:', {
          hasTwilioSid: !!settingsData.twilio_account_sid,
          hasTwilioToken: !!settingsData.twilio_auth_token,
          hasTwilioPhone: !!settingsData.twilio_phone_number,
        })
        
        if (settingsData.twilio_account_sid && settingsData.twilio_auth_token) {
          credentials.accountSid = settingsData.twilio_account_sid
          credentials.authToken = settingsData.twilio_auth_token
          credentials.phoneNumber = settingsData.twilio_phone_number || credentials.phoneNumber
          console.log('[Test Call] Using credentials from settings API')
        }
      } catch (settingsError) {
        console.error('[Test Call] Error fetching from settings API:', settingsError)
      }
      
      if (!credentials.accountSid || !credentials.authToken) {
        return NextResponse.json(
          { 
            error: 'Twilio credentials not configured. Please add Twilio credentials in Settings page or set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.',
            debug: {
              userId,
              checkedDatabase: true,
              checkedMemory: true,
              checkedEnv: true,
            }
          },
          { status: 500 }
        )
      }
    }

    const twilio = new Twilio(
      credentials.accountSid,
      credentials.authToken
    )

    const body = await request.json()
    const { to, agent_id } = body

    if (!to || !agent_id) {
      return NextResponse.json(
        { error: 'Phone number and agent ID are required' },
        { status: 400 }
      )
    }

    console.log('[Test Call] Looking for agent:', agent_id, 'userId:', userId)

    // First check in-memory storage (user-specific)
    const memoryAgents = getAgents(userId)
    console.log('[Test Call] Memory agents:', memoryAgents.length, 'agents found')
    let agent = memoryAgents.find(a => a.id === agent_id)
    
    if (agent) {
      console.log('[Test Call] Found agent in memory:', agent.name)
    } else {
      // Check global storage
      const allAgents = getAllAgents()
      console.log('[Test Call] Checking global storage:', allAgents.length, 'agents')
      agent = allAgents.find(a => a.id === agent_id)
      
      if (agent) {
        console.log('[Test Call] Found agent in global storage:', agent.name)
      } else {
        // Try database
        const { data, error } = await supabase
          .from('ai_agents')
          .select('*')
          .eq('id', agent_id)
          .eq('user_id', userId)
          .single()

        console.log('[Test Call] Database query result:', { data: data ? { id: data.id, name: data.name } : null, error })

        if (error) {
          console.error('[Test Call] Database error:', error)
          // If table doesn't exist, check all users in memory storage
          if (error.code === '42P01' || error.message?.includes('does not exist') || error.code === 'PGRST116') {
            const allAgentsMap = debugAgents()
            const allUsers = Object.keys(allAgentsMap)
            console.log('[Test Call] Checking all users in memory:', allUsers)
            for (const uid of allUsers) {
              const userAgents = getAgents(uid)
              agent = userAgents.find(a => a.id === agent_id)
              if (agent) {
                console.log('[Test Call] Found agent in user:', uid)
                break
              }
            }
          }
        } else {
          agent = data
        }
      }
    }

    if (!agent) {
      console.error('[Test Call] Agent not found:', agent_id)
      return NextResponse.json(
        { error: `Agent not found with ID: ${agent_id}. Please create an agent first.` },
        { status: 404 }
      )
    }

    console.log('[Test Call] Using agent:', agent.name, 'phone:', agent.phone_number)

    if (!agent.is_active) {
      return NextResponse.json(
        { error: 'Agent is not active' },
        { status: 400 }
      )
    }

    // Use agent phone number or fallback to settings phone number
    const fromPhoneNumber = agent.phone_number || credentials.phoneNumber

    if (!fromPhoneNumber) {
      return NextResponse.json(
        { error: 'Agent phone number not configured. Please set phone number in agent settings or Twilio settings.' },
        { status: 400 }
      )
    }

    // Create call log
    const { data: callLog } = await supabase
      .from('call_logs')
      .insert({
        agent_id: agent.id,
        phone_number: to,
        status: 'ringing',
      })
      .select()
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Check if URL is localhost (Twilio doesn't accept localhost URLs)
    if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
      return NextResponse.json(
        { 
          error: 'Twilio requires a publicly accessible URL. For local development, please use ngrok or set NEXT_PUBLIC_APP_URL to your public URL.\n\nQuick Setup:\n1. Install ngrok: npm install -g ngrok\n2. Run: ngrok http 3000\n3. Copy the https URL (e.g., https://abc123.ngrok.io)\n4. Set NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io\n\nOr deploy to Vercel for production.',
          localhostDetected: true,
          suggestion: 'Use ngrok for local testing or deploy to Vercel'
        },
        { status: 400 }
      )
    }

    // Make outbound call via Twilio
    const call = await twilio.calls.create({
      to: to,
      from: fromPhoneNumber,
      url: `${appUrl}/api/twilio/incoming`,
      method: 'POST',
      statusCallback: `${appUrl}/api/twilio/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      record: true, // Record the call
      recordingStatusCallback: `${appUrl}/api/twilio/recording`,
      recordingStatusCallbackMethod: 'POST',
    })

    // Update call log with call SID
    if (callLog) {
      await supabase
        .from('call_logs')
        .update({ call_sid: call.Sid })
        .eq('id', callLog.id)
    }

    return NextResponse.json({
      success: true,
      callSid: call.Sid,
      status: call.Status,
      message: 'Call initiated successfully',
    })
  } catch (error: any) {
    console.error('Test call error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate call' },
      { status: 500 }
    )
  }
}

