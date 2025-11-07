#!/usr/bin/env node

/**
 * WebSocket Server for Real-time Updates
 * Run this separately from the Next.js app for production
 * In development, you can use: npx tsx server.ts
 */

import { WebSocketServer, WebSocket } from 'ws'

const PORT = parseInt(process.env.WS_PORT || '3001')

const wss = new WebSocketServer({ port: PORT })

const clients = new Map<string, WebSocket>()
const liveCalls = new Set<string>()

wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`)
  const pathname = url.pathname
  
  console.log(`New connection: ${pathname}`)
  
  if (pathname?.startsWith('/ws/call/')) {
    const callSid = pathname.split('/').pop()
    if (callSid) {
      clients.set(callSid, ws)
      liveCalls.add(callSid)
      
      broadcast({ type: 'live_calls_update', count: liveCalls.size })
      console.log(`Call connected: ${callSid}, Total calls: ${liveCalls.size}`)
    }
  } else {
    // Dashboard client
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString())
        
        if (data.type === 'subscribe_call' && data.callSid) {
          clients.set(`dashboard-${data.callSid}`, ws)
          console.log(`Dashboard subscribed to call: ${data.callSid}`)
        }
      } catch (e) {
        console.error('Error parsing message:', e)
      }
    })
  }

  ws.on('close', () => {
    for (const [key, client] of Array.from(clients.entries())) {
      if (client === ws) {
        clients.delete(key)
        if (key.startsWith('call-') || !key.startsWith('dashboard-')) {
          liveCalls.delete(key.replace('call-', '').replace('dashboard-', ''))
          broadcast({ type: 'live_calls_update', count: liveCalls.size })
        }
        console.log(`Connection closed: ${key}, Total calls: ${liveCalls.size}`)
        break
      }
    }
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

function broadcast(message: any) {
  const data = JSON.stringify(message)
  let sent = 0
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
      sent++
    }
  })
  console.log(`Broadcasted to ${sent} clients:`, message.type)
}

export function broadcastTranscript(callSid: string, transcript: string) {
  const message = {
    type: 'transcript_update',
    callSid,
    transcript,
  }
  
  const data = JSON.stringify(message)
  let sent = 0
  
  clients.forEach((client, key) => {
    if (key.includes(callSid) && client.readyState === WebSocket.OPEN) {
      client.send(data)
      sent++
    }
  })
  
  console.log(`Transcript update sent to ${sent} clients for call ${callSid}`)
}

console.log(`🚀 WebSocket server running on port ${PORT}`)
console.log(`📡 Connect at: ws://localhost:${PORT}`)

// Keep process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  wss.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...')
  wss.close()
  process.exit(0)
})

