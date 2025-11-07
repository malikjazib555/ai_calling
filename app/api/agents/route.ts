import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { saveAgent, getAgents, getAllAgents } from '@/lib/storage'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For demo purposes, use mock user_id if no user
  const userId = user?.id || '00000000-0000-0000-0000-000000000000'

  console.log('[GET /api/agents] Fetching agents for userId:', userId)

  // Always check in-memory storage first (includes global storage)
  const memoryAgents = getAgents(userId)
  console.log('[GET /api/agents] Memory agents:', memoryAgents.length)

  const { data, error } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  console.log('[GET /api/agents] Database query:', { dataCount: data?.length || 0, error: error?.message })

  if (error) {
    console.error('[GET /api/agents] Supabase error:', error)
    // If table doesn't exist, return in-memory agents (includes global storage)
    if (error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST116') {
      console.log('[GET /api/agents] Table doesn\'t exist, returning memory agents:', memoryAgents.length)
      return NextResponse.json(memoryAgents)
    }
    // Return memory agents even on other errors
    console.log('[GET /api/agents] Error occurred, returning memory agents:', memoryAgents.length)
    return NextResponse.json(memoryAgents)
  }

  // Merge database agents with memory agents (memory takes precedence for demo)
  const dbAgents = data || []
  const agentMap = new Map()
  
  console.log('[GET /api/agents] Merging:', { dbAgents: dbAgents.length, memoryAgents: memoryAgents.length })
  
  // Add database agents first
  dbAgents.forEach(agent => {
    agentMap.set(agent.id, agent)
  })
  
  // Override with memory agents (if they exist) - includes global storage
  memoryAgents.forEach(agent => {
    agentMap.set(agent.id, agent)
  })

  const finalAgents = Array.from(agentMap.values())
  console.log('[GET /api/agents] Final agents count:', finalAgents.length)
  
  return NextResponse.json(finalAgents)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // For demo purposes, allow unauthenticated access with a mock user_id
    // In production, you should require authentication
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }

    // Validate phone number format if provided (E.164 format)
    if (body.phone_number && body.phone_number.trim()) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/
      const cleanedPhone = body.phone_number.trim()
      if (!phoneRegex.test(cleanedPhone)) {
        return NextResponse.json(
          { error: `Invalid phone number format. Use E.164 format with + prefix (e.g., +12175798709). Received: ${cleanedPhone}` },
          { status: 400 }
        )
      }
    }

    const agentData = {
      user_id: userId,
      name: body.name.trim(),
      description: (body.description || '').trim(),
      phone_number: (body.phone_number || '').trim(),
      is_active: body.is_active || false,
      voice_provider: 'twilio',
      voice_id: 'alice',
      voice_language: 'en-US',
    }

    // Try to save to database first
    const { data, error } = await supabase
      .from('ai_agents')
      .insert(agentData)
      .select()
      .single()

    let savedAgent

    if (error) {
      console.error('Supabase error:', error)
      // If table doesn't exist or other DB error, use in-memory storage
      if (error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST116') {
        const demoId = `demo-${Date.now()}`
        savedAgent = {
          id: demoId,
          ...agentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        // Save to memory storage
        saveAgent(userId, savedAgent)
        return NextResponse.json(savedAgent)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    savedAgent = data || {
      id: `demo-${Date.now()}`,
      ...agentData,
      created_at: new Date().toISOString(),
    }

    // Also save to memory storage for consistency
    saveAgent(userId, savedAgent)

    return NextResponse.json(savedAgent)
  } catch (error: any) {
    console.error('Unexpected error in POST /api/agents:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

