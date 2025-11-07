import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAgents, saveAgent, deleteAgent } from '@/lib/storage'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Use mock user_id if no authenticated user (same as creation)
  const userId = user?.id || '00000000-0000-0000-0000-000000000000'

  // First check in-memory storage
  const memoryAgents = getAgents(userId)
  const memoryAgent = memoryAgents.find(a => a.id === id)
  
  if (memoryAgent) {
    return NextResponse.json(memoryAgent)
  }

  const { data, error } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Supabase error:', error)
    // If table doesn't exist or agent not found, return basic structure for demo IDs
    if (id.startsWith('demo-') || error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST116') {
      return NextResponse.json({
        id: id,
        name: '',
        description: '',
        phone_number: '',
        is_active: false,
        voice_provider: 'twilio',
        voice_id: 'alice',
        voice_language: 'en-US',
        user_id: userId,
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    // If not found but it's a demo ID, return basic structure
    if (id.startsWith('demo-')) {
      return NextResponse.json({
        id: id,
        name: '',
        description: '',
        phone_number: '',
        is_active: false,
        voice_provider: 'twilio',
        voice_id: 'alice',
        voice_language: 'en-US',
        user_id: userId,
      })
    }
    
    return NextResponse.json(
      { error: 'Agent not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // For demo purposes, allow unauthenticated access
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'

    const body = await request.json()

    const updatedData = {
      name: body.name,
      description: body.description,
      phone_number: body.phone_number,
      is_active: body.is_active,
      voice_provider: body.voice_provider,
      voice_id: body.voice_id,
      voice_language: body.voice_language,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('ai_agents')
      .update(updatedData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    let savedAgent

    if (error) {
      console.error('Supabase error:', error)
      // If table doesn't exist, use in-memory storage
      if (error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST116') {
        savedAgent = {
          id: id,
          ...updatedData,
          user_id: userId,
        }
        // Save to memory storage
        saveAgent(userId, savedAgent)
        return NextResponse.json(savedAgent)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    savedAgent = data || {
      id: id,
      ...updatedData,
      user_id: userId,
    }

    // Also save to memory storage
    saveAgent(userId, savedAgent)

    return NextResponse.json(savedAgent)
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/agents/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('ai_agents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

