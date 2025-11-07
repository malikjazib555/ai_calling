import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '7d'

  // Calculate date range
  const now = new Date()
  let startDate = new Date()
  
  switch (range) {
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      startDate = new Date(0) // All time
  }

  // For demo, return mock data
  if (!user) {
    return NextResponse.json({
      totalCalls: 1247,
      totalOrders: 342,
      avgCallDuration: 245, // seconds
      totalRevenue: 45680,
      callsByDay: [
        { date: 'Mon', calls: 45, orders: 12 },
        { date: 'Tue', calls: 52, orders: 15 },
        { date: 'Wed', calls: 48, orders: 13 },
        { date: 'Thu', calls: 61, orders: 18 },
        { date: 'Fri', calls: 55, orders: 16 },
        { date: 'Sat', calls: 38, orders: 10 },
        { date: 'Sun', calls: 32, orders: 8 },
      ],
      callsByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        calls: Math.floor(Math.random() * 30) + 10,
      })),
      sentimentDistribution: [
        { sentiment: 'Positive', count: 65 },
        { sentiment: 'Neutral', count: 25 },
        { sentiment: 'Negative', count: 10 },
      ],
      topAgents: [
        { name: 'Battery Shop Assistant', calls: 456, orders: 142 },
        { name: 'Support Agent', calls: 321, orders: 98 },
        { name: 'Sales Agent', calls: 234, orders: 67 },
      ],
    })
  }

  // Real implementation would query Supabase
  const { data: calls } = await supabase
    .from('call_logs')
    .select('*, ai_agents(*)')
    .gte('created_at', startDate.toISOString())

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate.toISOString())

  // Process analytics data
  const totalCalls = calls?.length || 0
  const totalOrders = orders?.length || 0
  const avgCallDuration = calls?.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) / (totalCalls || 1) || 0
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.quantity * 100), 0) || 0 // Mock calculation

  return NextResponse.json({
    totalCalls,
    totalOrders,
    avgCallDuration,
    totalRevenue,
    callsByDay: [], // Would need to group by date
    callsByHour: [], // Would need to group by hour
    sentimentDistribution: [],
    topAgents: [],
  })
}

