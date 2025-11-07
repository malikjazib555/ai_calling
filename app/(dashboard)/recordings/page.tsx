'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Download, Upload } from 'lucide-react'

interface Recording {
  id: string
  call_log_id: string
  recording_url: string
  duration_seconds: number
  created_at: string
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)

  useEffect(() => {
    fetch('/api/recordings')
      .then(res => res.json())
      .then(data => {
        setRecordings(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Recordings</h1>
          <p className="text-white/60 mt-1">Listen to and manage call recordings</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading recordings...</div>
              ) : recordings.length === 0 ? (
                <div className="text-center py-8 text-white/60">No recordings yet</div>
              ) : (
                <div className="space-y-2">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      onClick={() => setSelectedRecording(recording)}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <Play className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Call #{recording.call_log_id.slice(0, 8)}</p>
                          <p className="text-sm text-white/60">
                            {new Date(recording.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-white/60">
                          {formatDuration(recording.duration_seconds)}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Playback</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRecording ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-2">Call Recording</p>
                    <audio controls className="w-full">
                      <source src={selectedRecording.recording_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-white/60">Duration</p>
                      <p className="font-medium">{formatDuration(selectedRecording.duration_seconds)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Recorded</p>
                      <p className="font-medium">
                        {new Date(selectedRecording.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Recording
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-white/60">
                  Select a recording to play
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

