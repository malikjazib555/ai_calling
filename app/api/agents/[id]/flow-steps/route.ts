import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('flow_steps')
    .select('*')
    .eq('agent_id', id)
    .order('step_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { steps } = body

  // Delete all existing steps
  await supabase.from('flow_steps').delete().eq('agent_id', id)

  // Insert new steps
  const stepsToInsert = steps.map((step: any) => ({
    agent_id: id,
    step_type: step.step_type,
    step_order: step.step_order,
    title: step.title,
    prompt_text: step.prompt_text,
    is_enabled: step.is_enabled,
    fields_to_collect: step.fields_to_collect || [],
  }))

  const { data, error } = await supabase
    .from('flow_steps')
    .insert(stepsToInsert)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

