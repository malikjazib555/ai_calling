import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getVoices, createCustomVoice } from '@/lib/voice/elevenlabs'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const voices = await getVoices()
    return NextResponse.json({ voices })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voices', voices: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const audioFilesInput = formData.getAll('audioFiles')

    if (!name || audioFilesInput.length === 0) {
      return NextResponse.json(
        { error: 'Name and audio files are required' },
        { status: 400 }
      )
    }

    // Convert FormData files to File objects
    const audioFiles = audioFilesInput.map((file) => {
      if (file instanceof File) {
        return file
      }
      // Handle other formats if needed
      return file as unknown as File
    })

    const voiceId = await createCustomVoice(name, audioFiles)
    return NextResponse.json({ voiceId, name })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create voice' },
      { status: 500 }
    )
  }
}

