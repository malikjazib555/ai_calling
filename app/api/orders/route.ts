import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For demo purposes, allow unauthenticated access with empty result
  if (!user) {
    return NextResponse.json([])
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    console.error('Supabase error:', error)
    // Return empty array instead of error for better UX
    return NextResponse.json([])
  }

  return NextResponse.json(data || [])
}

