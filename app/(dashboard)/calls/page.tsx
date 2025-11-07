'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDuration } from '@/lib/utils'
import { Phone, PhoneOff, Clock } from 'lucide-react'

interface CallLog {
  id: string
  phone_number: string
  status: string
  duration_seconds: number
  started_at: string
  transcript?: string
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null)
  const [liveTranscript, setLiveTranscript] = useState('')

  useEffect(() => {
    // Fetch calls from API
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => setCalls(data))
      .catch(console.error)

    // WebSocket for live transcripts
    const wsPort = process.env.NEXT_PUBLIC_WS_PORT || '3001'
    const ws = new WebSocket(`ws://localhost:${wsPort}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'transcript_update') {
        setLiveTranscript(data.transcript)
      }
    }

    return () => ws.close()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Call Logs</h1>
        <p className="text-white/60 mt-1">Monitor and review all incoming calls</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {calls.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No calls yet</p>
                ) : (
                  calls.map((call) => (
                    <div
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2 ${call.status === 'completed' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                          {call.status === 'completed' ? (
                            <PhoneOff className="h-4 w-4" />
                          ) : (
                            <Phone className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{call.phone_number}</p>
                          <p className="text-sm text-white/60">{call.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-white/60">
                          <Clock className="h-4 w-4" />
                          {formatDuration(call.duration_seconds)}
                        </div>
                        <p className="text-sm text-white/60">
                          {new Date(call.started_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Call Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCall ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60">Phone Number</p>
                    <p className="font-medium">{selectedCall.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Status</p>
                    <p className="font-medium">{selectedCall.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Duration</p>
                    <p className="font-medium">{formatDuration(selectedCall.duration_seconds)}</p>
                  </div>
                  {selectedCall.transcript && (
                    <div>
                      <p className="text-sm text-white/60 mb-2">Transcript</p>
                      <div className="rounded-lg bg-black/50 p-3 text-sm max-h-64 overflow-y-auto">
                        {selectedCall.transcript}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white/60 text-center py-8">Select a call to view details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Call Monitor */}
      {liveTranscript && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Live Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-black/50 p-4">
                <p className="text-sm text-white/60 mb-2">Transcript</p>
                <p className="text-sm">{liveTranscript}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

