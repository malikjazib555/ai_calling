import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { parse } from 'url'

const wss = new WebSocketServer({ port: parseInt(process.env.WS_PORT || '3001') })

const clients = new Map<string, WebSocket>()
const liveCalls = new Set<string>()

wss.on('connection', (ws: WebSocket, req) => {
  const { pathname } = parse(req.url || '')
  
  if (pathname?.startsWith('/ws/call/')) {
    const callSid = pathname.split('/').pop()
    if (callSid) {
      clients.set(callSid, ws)
      liveCalls.add(callSid)
      
      broadcast({ type: 'live_calls_update', count: liveCalls.size })
    }
  } else {
    // Dashboard client
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString())
        
        if (data.type === 'subscribe_call' && data.callSid) {
          clients.set(`dashboard-${data.callSid}`, ws)
        }
      } catch (e) {
        console.error('Error parsing message:', e)
      }
    })
  }

  ws.on('close', () => {
    for (const [key, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(key)
        if (key.startsWith('call-')) {
          liveCalls.delete(key.replace('call-', ''))
          broadcast({ type: 'live_calls_update', count: liveCalls.size })
        }
        break
      }
    }
  })
})

function broadcast(message: any) {
  const data = JSON.stringify(message)
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

export function broadcastTranscript(callSid: string, transcript: string) {
  const message = JSON.stringify({
    type: 'transcript_update',
    callSid,
    transcript,
  })
  
  clients.forEach((client, key) => {
    if (key.includes(callSid) && client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

console.log('WebSocket server running on port', process.env.WS_PORT || 3001)

