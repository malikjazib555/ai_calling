import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAllSettings } from '@/lib/storage'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id || '00000000-0000-0000-0000-000000000000'

  // Convert array to object and parse boolean values
  const settings: Record<string, any> = {}
  
  // First, try to get from database
  const { data, error } = await supabase
    .from('user_settings')
    .select('setting_key, setting_value')
    .eq('user_id', userId)

  if (!error && data) {
    data.forEach((item: any) => {
      const value = item.setting_value
      // Parse boolean strings
      if (value === 'true') {
        settings[item.setting_key] = true
      } else if (value === 'false') {
        settings[item.setting_key] = false
      } else {
        settings[item.setting_key] = value
      }
    })
  }

  // Always merge with in-memory storage (in-memory takes precedence for demo mode)
  const memorySettings = getAllSettings(userId)
  Object.keys(memorySettings).forEach(key => {
    const value = memorySettings[key]
    if (value === 'true') {
      settings[key] = true
    } else if (value === 'false') {
      settings[key] = false
    } else {
      settings[key] = value
    }
  })

  // If database fetch failed and no memory settings, return empty object
  if (error && Object.keys(memorySettings).length === 0) {
    console.error('Settings fetch error:', error)
    // Don't return error, just return empty object
  }

  return NextResponse.json(settings)
}

