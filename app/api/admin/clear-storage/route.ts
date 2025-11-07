import { NextResponse } from 'next/server'
import { clearAllStorage } from '@/lib/storage'

export async function POST() {
  try {
    clearAllStorage()
    return NextResponse.json({ 
      success: true, 
      message: 'All storage cleared successfully' 
    })
  } catch (error: any) {
    console.error('Error clearing storage:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to clear storage' },
      { status: 500 }
    )
  }
}

