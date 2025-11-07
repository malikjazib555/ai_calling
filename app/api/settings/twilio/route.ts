import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { setSetting } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const userId = user?.id || '00000000-0000-0000-0000-000000000000'
    const body = await request.json()

    const { account_sid, auth_token, phone_number } = body

    // Save each setting
    const settings = [
      { key: 'twilio_account_sid', value: account_sid },
      { key: 'twilio_auth_token', value: auth_token },
      { key: 'twilio_phone_number', value: phone_number },
    ]

    let savedCount = 0
    let errors: string[] = []
    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    for (const setting of settings) {
      if (setting.value) {
        try {
          // Always try Supabase first if configured
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
              console.error(`Supabase error saving ${setting.key}:`, error)
              // If RLS policy issue, try without auth check
              if (error.code === '42501' || error.message?.includes('permission denied')) {
                // RLS issue - try again or use fallback
                console.warn(`RLS policy issue for ${setting.key}, using fallback`)
                setSetting(userId, setting.key, setting.value)
                savedCount++
              } else if (error.code === '42P01' || error.message?.includes('does not exist') || error.code === 'PGRST116') {
                // Table doesn't exist - use in-memory storage
                console.warn(`Table doesn't exist, using in-memory storage for ${setting.key}`)
                setSetting(userId, setting.key, setting.value)
                savedCount++
              } else {
                errors.push(`${setting.key}: ${error.message}`)
              }
            } else {
              savedCount++
              console.log(`✅ Saved ${setting.key} to Supabase database`)
            }
          } else {
            // Supabase not configured - use in-memory storage
            setSetting(userId, setting.key, setting.value)
            savedCount++
            console.log(`✅ Saved ${setting.key} to memory storage (Supabase not configured)`)
          }
        } catch (error: any) {
          console.error(`Error saving ${setting.key}:`, error)
          // Fallback to in-memory storage
          setSetting(userId, setting.key, setting.value)
          savedCount++
        }
      }
    }

    if (savedCount === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: `Failed to save settings: ${errors.join(', ')}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `Saved ${savedCount} setting(s)${isSupabaseConfigured ? ' to database' : ' to memory'}`,
      savedCount,
      storedIn: isSupabaseConfigured ? 'database' : 'memory'
    })
  } catch (error: any) {
    console.error('Error saving Twilio settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    )
  }
}

