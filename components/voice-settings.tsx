'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Play, Mic } from 'lucide-react'

interface Voice {
  voice_id: string
  name: string
  category?: string
  description?: string
}

interface VoiceSettingsProps {
  agentId: string
  currentSettings?: {
    voice_provider?: string
    voice_id?: string
    voice_language?: string
  }
}

export default function VoiceSettings({ agentId, currentSettings }: VoiceSettingsProps) {
  const [voiceProvider, setVoiceProvider] = useState(currentSettings?.voice_provider || 'twilio')
  const [voiceId, setVoiceId] = useState(currentSettings?.voice_id || 'alice')
  const [voiceLanguage, setVoiceLanguage] = useState(currentSettings?.voice_language || 'en-US')
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(false)
  const [customVoiceName, setCustomVoiceName] = useState('')
  const [audioFiles, setAudioFiles] = useState<File[]>([])

  useEffect(() => {
    if (voiceProvider === 'elevenlabs') {
      fetchVoices()
    }
  }, [voiceProvider])

  const fetchVoices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/voices')
      const data = await res.json()
      setVoices(data.voices || [])
    } catch (error) {
      console.error('Failed to fetch voices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    await fetch(`/api/agents/${agentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voice_provider: voiceProvider,
        voice_id: voiceId,
        voice_language: voiceLanguage,
      }),
    })
    alert('Voice settings saved!')
  }

  const handleCreateCustomVoice = async () => {
    if (!customVoiceName || audioFiles.length === 0) {
      alert('Please provide a name and upload audio files')
      return
    }

    const formData = new FormData()
    formData.append('name', customVoiceName)
    audioFiles.forEach(file => formData.append('audioFiles', file))

    try {
      const res = await fetch('/api/voices', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setVoiceId(data.voiceId)
      setCustomVoiceName('')
      setAudioFiles([])
      await fetchVoices()
      alert('Custom voice created successfully!')
    } catch (error) {
      console.error('Failed to create voice:', error)
      alert('Failed to create custom voice')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Voice Settings</CardTitle>
          <CardDescription>Configure AI voice for phone calls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Voice Provider</Label>
              <Select value={voiceProvider} onValueChange={setVoiceProvider}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio (Built-in)</SelectItem>
                  <SelectItem value="elevenlabs">ElevenLabs (Premium)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-white/60">
                {voiceProvider === 'twilio' 
                  ? 'Uses Twilio\'s built-in voices (free, limited quality)'
                  : 'ElevenLabs provides high-quality, customizable voices (requires API key)'}
              </p>
            </div>

            {voiceProvider === 'twilio' && (
              <>
                <div className="space-y-2">
                  <Label>Twilio Voice</Label>
                  <Select value={voiceId} onValueChange={setVoiceId}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alice">Alice (English)</SelectItem>
                      <SelectItem value="alice">Polly (English)</SelectItem>
                      <SelectItem value="alice">Google (English)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={voiceLanguage} onValueChange={setVoiceLanguage}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                      <SelectItem value="hi-IN">Hindi</SelectItem>
                      <SelectItem value="ur-PK">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {voiceProvider === 'elevenlabs' && (
              <>
                <div className="space-y-2">
                  <Label>Select Voice</Label>
                  {loading ? (
                    <p className="text-sm text-white/60">Loading voices...</p>
                  ) : (
                    <Select value={voiceId} onValueChange={setVoiceId}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.voice_id} value={voice.voice_id}>
                            {voice.name} {voice.category && `(${voice.category})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-4 border-t border-white/10 pt-4">
                  <div>
                    <Label className="text-lg font-semibold">Create Custom Voice</Label>
                    <p className="text-sm text-white/60 mb-4">
                      Upload audio samples (minimum 1 minute) to train your own voice
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Voice Name</Label>
                    <Input
                      value={customVoiceName}
                      onChange={(e) => setCustomVoiceName(e.target.value)}
                      placeholder="My Custom Voice"
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Audio Files (MP3, WAV, M4A)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        multiple
                        accept="audio/*"
                        onChange={(e) => setAudioFiles(Array.from(e.target.files || []))}
                        className="bg-white/5 border-white/10"
                      />
                      <Button
                        onClick={handleCreateCustomVoice}
                        disabled={!customVoiceName || audioFiles.length === 0}
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Train Voice
                      </Button>
                    </div>
                    <p className="text-sm text-white/60">
                      Upload multiple audio files for better quality. Minimum 1 minute total.
                    </p>
                  </div>
                </div>
              </>
            )}

            <Button onClick={handleSave} className="w-full">
              <Mic className="h-4 w-4 mr-2" />
              Save Voice Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

