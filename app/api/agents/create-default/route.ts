import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { saveAgent, getAgents } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const userId = user?.id || '00000000-0000-0000-0000-000000000000'
    
    console.log('[Create Default Agent] Creating agent for userId:', userId)
    
    const agentData = {
      user_id: userId,
      name: 'Battery Shop Assistant',
      description: 'AI assistant for battery shop orders',
      phone_number: '+12175798709',
      is_active: true,
      voice_provider: 'twilio',
      voice_id: 'alice',
      voice_language: 'en-US',
    }

    // Check if agent already exists with this phone number
    const existingAgents = getAgents(userId)
    const existingAgent = existingAgents.find(a => a.phone_number === '+12175798709')
    
    if (existingAgent) {
      console.log('[Create Default Agent] Agent already exists:', existingAgent.id)
      return NextResponse.json(existingAgent)
    }

    const { data, error } = await supabase
      .from('ai_agents')
      .insert(agentData)
      .select()
      .single()

    let savedAgent

    if (error) {
      console.error('[Create Default Agent] Supabase error:', error)
      if (error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST116') {
        const demoId = `demo-${Date.now()}`
        savedAgent = {
          id: demoId,
          ...agentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        console.log('[Create Default Agent] Saving to memory storage:', savedAgent.id)
        saveAgent(userId, savedAgent) // Save to memory storage
        
        // Verify it was saved
        const verifyAgents = getAgents(userId)
        console.log('[Create Default Agent] Verified agents in memory:', verifyAgents.length)
        
        return NextResponse.json(savedAgent)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    savedAgent = data || {
      id: `demo-${Date.now()}`,
      ...agentData,
      created_at: new Date().toISOString(),
    }

    console.log('[Create Default Agent] Saving to memory storage:', savedAgent.id)
    saveAgent(userId, savedAgent) // Also save to memory storage
    
    // Verify it was saved
    const verifyAgents = getAgents(userId)
    console.log('[Create Default Agent] Verified agents in memory:', verifyAgents.length)

    return NextResponse.json(savedAgent)
  } catch (error: any) {
    console.error('[Create Default Agent] Error creating agent:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

