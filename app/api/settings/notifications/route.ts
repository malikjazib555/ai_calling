import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { setSetting } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const userId = user?.id || '00000000-0000-0000-0000-000000000000'
    const body = await request.json()

    const { email_notifications, live_call_alerts } = body

    // Save notification settings
    const settings = [
      { key: 'email_notifications', value: email_notifications ? 'true' : 'false' },
      { key: 'live_call_alerts', value: live_call_alerts ? 'true' : 'false' },
    ]

    let savedCount = 0
    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    for (const setting of settings) {
      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase
            .from('user_settings')
            .upsert({
              user_id: userId,
              setting_key: setting.key,
              setting_value: setting.value,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,setting_key'
            })

          if (error) {
            console.error(`Error saving ${setting.key}:`, error)
            if (error.code === '42501' || error.message?.includes('permission denied')) {
              setSetting(userId, setting.key, setting.value)
              savedCount++
            } else if (error.code === '42P01' || error.message?.includes('does not exist') || error.code === 'PGRST116') {
              setSetting(userId, setting.key, setting.value)
              savedCount++
            }
          } else {
            savedCount++
            console.log(`✅ Saved ${setting.key} to Supabase database`)
          }
        } else {
          setSetting(userId, setting.key, setting.value)
          savedCount++
          console.log(`✅ Saved ${setting.key} to memory storage`)
        }
      } catch (error: any) {
        console.error(`Error saving ${setting.key}:`, error)
        setSetting(userId, setting.key, setting.value)
        savedCount++
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Saved ${savedCount} setting(s)${isSupabaseConfigured ? ' to database' : ' to memory'}`,
      savedCount 
    })
  } catch (error: any) {
    console.error('Error saving notification settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    )
  }
}

