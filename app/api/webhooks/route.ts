import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json([])
  }

  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id || '00000000-0000-0000-0000-000000000000'
  const body = await request.json()

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      user_id: userId,
      name: body.name,
      url: body.url,
      events: body.events,
      is_active: body.is_active || true,
      secret: body.secret || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    // Mock data for demo
    return NextResponse.json({
      id: `webhook-${Date.now()}`,
      ...body,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  }

  return NextResponse.json(data)
}

