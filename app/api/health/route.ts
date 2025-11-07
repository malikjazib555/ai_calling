import { NextResponse } from 'next/server'
import { checkRequiredEnv } from '@/lib/env/validation'

export async function GET() {
  const check = checkRequiredEnv()
  
  return NextResponse.json({
    production: process.env.NODE_ENV === 'production',
    envCheck: check,
    timestamp: new Date().toISOString(),
  })
}

