'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CallFlowDesigner from '@/components/call-flow-designer'
import VoiceSettings from '@/components/voice-settings'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AgentEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const agentId = params.id
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<any>(null)

  const isNew = agentId === 'new'

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/agents/${agentId}`)
        .then(res => {
          // Even if not ok, try to parse response
          return res.json().catch(() => ({ error: 'Failed to parse response' }))
        })
        .then(data => {
          // Update form fields if we have data (even if it's empty/default)
          if (data && !data.error) {
            // Only update if we have actual values, otherwise keep existing form state
            if (data.name !== undefined) setName(data.name || '')
            if (data.description !== undefined) setDescription(data.description || '')
            if (data.phone_number !== undefined) setPhoneNumber(data.phone_number || '')
            if (data.is_active !== undefined) setIsActive(data.is_active || false)
            if (data.voice_provider || data.voice_id || data.voice_language) {
              setVoiceSettings({
                voice_provider: data.voice_provider || 'twilio',
                voice_id: data.voice_id || 'alice',
                voice_language: data.voice_language || 'en-US',
              })
            }
          } else {
            // If error but it's a demo ID, don't show alert - just allow editing
            if (!agentId.startsWith('demo-')) {
              console.error('Agent fetch error:', data?.error)
              // Don't show alert for demo agents - they might not be saved yet
            }
          }
        })
        .catch(error => {
          console.error('Error fetching agent:', error)
          // Don't show alert - allow user to continue editing
          // The form fields will remain as they are
        })
    }
  }, [agentId, isNew])

  const saveAgent = async () => {
    // Validate required fields
    if (!name.trim()) {
      alert('Please enter an agent name')
      return
    }

    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/agents' : `/api/agents/${agentId}`
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          phone_number: phoneNumber.trim(),
          is_active: isActive,
        }),
      })

      const responseText = await response.text()
      let data
      
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(responseText || 'Invalid response from server')
      }

      if (response.ok) {
        // Use the actual agent ID from response
        const newAgentId = data.id || data.agent_id
        
        if (!newAgentId) {
          throw new Error('Agent created but no ID returned')
        }
        
        if (isNew) {
          // Show success message with actual agent name
          alert(`Agent "${name}" created successfully!`)
          // Navigate to the agent page without reload
          router.push(`/agents/${newAgentId}`)
          // Update form state immediately with saved data
          setName(data.name || name)
          setDescription(data.description || description)
          setPhoneNumber(data.phone_number || phoneNumber)
          setIsActive(data.is_active !== undefined ? data.is_active : isActive)
        } else {
          alert('Agent updated successfully!')
          router.push('/')
          router.refresh()
        }
      } else {
        // Show error message
        const errorMessage = data.error || data.message || 'Failed to save agent'
        alert(`Error: ${errorMessage}`)
        console.error('Agent save error:', data)
      }
    } catch (error: any) {
      console.error('Error saving agent:', error)
      alert(`Failed to save agent: ${error.message || 'Please try again.'}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isNew ? 'Create' : 'Edit'} Agent</h1>
          <p className="text-white/60 mt-1">
            {isNew ? 'Set up a new AI phone agent' : 'Configure your AI agent'}
          </p>
        </div>
        <Button onClick={saveAgent}>
          <Save className="h-4 w-4 mr-2" />
          Save Agent
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="flow">Call Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
              <CardDescription>Basic information about your AI agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Battery Shop Assistant"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="An AI assistant that handles battery shop orders..."
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-sm text-white/60">
                    Enable this agent to receive calls
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          {!isNew && <VoiceSettings agentId={agentId} currentSettings={voiceSettings} />}
          {isNew && (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="py-12 text-center">
                <p className="text-white/60">
                  Save the agent first to configure voice settings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flow">
          {!isNew && <CallFlowDesigner agentId={agentId} />}
          {isNew && (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="py-12 text-center">
                <p className="text-white/60">
                  Save the agent first to design the call flow
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

