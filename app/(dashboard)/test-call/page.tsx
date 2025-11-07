'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, Loader2 } from 'lucide-react'

export default function TestCallPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [agentId, setAgentId] = useState('')
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [creatingAgent, setCreatingAgent] = useState(false)
  const [isCalling, setIsCalling] = useState(false)

  useEffect(() => {
    loadAgents()
    
    // Refresh agents every 2 seconds to catch new ones, but not during call
    const interval = setInterval(() => {
      if (!isCalling) {
        loadAgents()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [isCalling]) // Re-run when isCalling changes

  const loadAgents = async () => {
    try {
      const timestamp = Date.now()
      console.log('[TestCall] Loading agents...', timestamp)
      const res = await fetch(`/api/agents?t=${timestamp}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      })
      
      if (!res.ok) {
        console.error('[TestCall] Response not OK:', res.status)
        return []
      }
      
      const data = await res.json()
      console.log('[TestCall] Agents response:', data)
      const agentsList = Array.isArray(data) ? data : []
      console.log('[TestCall] Agents list:', agentsList.length, 'agents found')
      
      // Always update agents list
      setAgents(agentsList)
      
      // Auto-select first active agent if no agent selected
      if (!agentId && agentsList.length > 0) {
        const activeAgent = agentsList.find((a: any) => a.is_active) || agentsList[0]
        if (activeAgent) {
          console.log('[TestCall] Auto-selecting agent:', activeAgent.id, activeAgent.name)
          setAgentId(activeAgent.id)
        }
      } else if (agentId && agentsList.length > 0) {
        // Verify selected agent still exists
        const agentExists = agentsList.find((a: any) => a.id === agentId)
        if (!agentExists) {
          console.warn('[TestCall] Selected agent not found, selecting first available')
          // Agent was deleted, select first available
          const activeAgent = agentsList.find((a: any) => a.is_active) || agentsList[0]
          if (activeAgent) {
            console.log('[TestCall] Selecting new agent:', activeAgent.id)
            setAgentId(activeAgent.id)
          }
        } else {
          console.log('[TestCall] Selected agent still exists:', agentId)
        }
      }
      
      return agentsList
    } catch (error) {
      console.error('[TestCall] Error loading agents:', error)
      // Don't clear agents on error, keep existing state
      return []
    }
  }

  const createDefaultAgent = async () => {
    setCreatingAgent(true)
    setStatus('Creating agent with phone +12175798709...')

    try {
      const response = await fetch('/api/agents/create-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const responseText = await response.text()
      console.log('Create agent response:', responseText)
      let data
      
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(responseText || 'Invalid response')
      }

      if (response.ok) {
        console.log('Agent created:', data)
        setStatus('✅ Agent created successfully! Refreshing list...')
        
        // Immediately refresh agents list
        await loadAgents()
        
        // Wait a bit and refresh again to ensure it's loaded
        await new Promise(resolve => setTimeout(resolve, 500))
        const updatedAgents = await loadAgents()
        
        // Auto-select the new agent
        if (data.id) {
          console.log('Setting agent ID to:', data.id)
          setAgentId(data.id)
        } else if (updatedAgents.length > 0) {
          // Find agent by phone number if ID not available
          const newAgent = updatedAgents.find((a: any) => a.phone_number === '+12175798709') || updatedAgents[0]
          if (newAgent) {
            console.log('Found agent:', newAgent.id, newAgent.name)
            setAgentId(newAgent.id)
          }
        }
        
        // Show success message longer
        setTimeout(() => {
          setStatus(null)
        }, 4000)
      } else {
        setStatus(`❌ Error creating agent: ${data.error || 'Failed to create agent'}`)
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`)
      console.error('Create agent error:', error)
    } finally {
      setCreatingAgent(false)
    }
  }

  const handleTestCall = async () => {
    if (!phoneNumber || !agentId) {
      alert('Please select an agent and enter a phone number')
      return
    }

    // Validate phone number format
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      alert('Invalid phone number format. Use E.164 format (e.g., +1234567890)')
      return
    }

    setLoading(true)
    setIsCalling(true)
    setStatus('Initiating test call...')

    // Store selected agent ID to prevent auto-selection during call
    const selectedAgentId = agentId

    try {
      const response = await fetch('/api/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber.trim(),
          agent_id: selectedAgentId,
        }),
      })

      const responseText = await response.text()
      let data
      
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(responseText || 'Invalid response')
      }

      if (response.ok) {
        setStatus(`✅ Call initiated successfully! Call SID: ${data.callSid || 'N/A'}. Twilio will call your number shortly.`)
        // Keep the selected agent ID stable
        setAgentId(selectedAgentId)
        
        // Immediately refresh agents list to ensure agent is still visible
        setTimeout(() => {
          loadAgents()
        }, 500)
      } else {
        setStatus(`❌ Error: ${data.error || 'Failed to initiate call'}`)
        // On error, also refresh agents list
        setTimeout(() => {
          loadAgents()
        }, 500)
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message || 'Network error. Please check Twilio credentials.'}`)
      // On error, refresh agents list
      setTimeout(() => {
        loadAgents()
      }, 500)
    } finally {
      setLoading(false)
      // Re-enable auto-refresh after 5 seconds
      setTimeout(() => {
        setIsCalling(false)
      }, 5000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Call</h1>
        <p className="text-white/60 mt-1">Test your AI agent with a real phone call</p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Make Test Call</CardTitle>
          <CardDescription>
            Call your phone number to test the AI agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Agent</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAgents()}
                  title="Refresh agents list"
                >
                  ↻ Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createDefaultAgent}
                  disabled={creatingAgent}
                >
                  {creatingAgent ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Auto-Create Agent (+12175798709)'
                  )}
                </Button>
              </div>
            </div>
            <Select value={agentId} onValueChange={(value) => {
              console.log('Agent selected:', value)
              setAgentId(value)
            }}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder={agents.length === 0 ? "No agents - Click 'Auto-Create Agent'" : "Choose an agent"} />
              </SelectTrigger>
              <SelectContent>
                {agents.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-white/60">
                    No agents found. Click "Auto-Create Agent" above.
                  </div>
                ) : (
                  <>
                    {/* Active Agents Section */}
                    {agents.filter((a: any) => a.is_active).length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-green-400 bg-green-500/10">
                          ✓ Active Agents
                        </div>
                        {agents
                          .filter((a: any) => a.is_active)
                          .map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name} ({agent.phone_number || 'No phone'})
                            </SelectItem>
                          ))}
                      </>
                    )}
                    
                    {/* Inactive Agents Section */}
                    {agents.filter((a: any) => !a.is_active).length > 0 && (
                      <>
                        {agents.filter((a: any) => a.is_active).length > 0 && (
                          <div className="h-px bg-white/10 my-1" />
                        )}
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 bg-gray-500/10">
                          ✗ Inactive Agents
                        </div>
                        {agents
                          .filter((a: any) => !a.is_active)
                          .map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name} ({agent.phone_number || 'No phone'})
                            </SelectItem>
                          ))}
                      </>
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
            {agents.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs text-white/60">
                  {agents.filter((a: any) => a.is_active).length} active agent(s) available
                </p>
                {agentId && (
                  <p className="text-xs text-green-400">
                    Selected: {agents.find((a: any) => a.id === agentId)?.name || 'Unknown'} ({agents.find((a: any) => a.id === agentId)?.phone_number || 'No phone'})
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-yellow-400">
                No agents found. Click "Auto-Create Agent" button above to create one, or click "Refresh" to reload.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Your Phone Number</Label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="bg-white/5 border-white/10"
              type="tel"
            />
            <p className="text-sm text-white/60">
              Enter the phone number you want to call (must be verified in Twilio)
            </p>
          </div>

          <Button
            onClick={handleTestCall}
            disabled={loading || !phoneNumber || !agentId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calling...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Make Test Call
              </>
            )}
          </Button>

          {status && (
            <div className={`p-4 rounded-lg ${
              status.includes('Error') || status.includes('localhost') || status.includes('ngrok')
                ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                : 'bg-green-500/20 text-green-400 border border-green-500/50'
            }`}>
              <p className="text-sm font-medium whitespace-pre-line">{status}</p>
              {(status.includes('localhost') || status.includes('ngrok')) && (
                <div className="mt-4 p-3 bg-black/20 rounded border border-white/10">
                  <p className="text-xs font-semibold mb-2 text-yellow-400">Quick Setup Guide:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-white/80">
                    <li>Install ngrok: <code className="bg-black/30 px-1 rounded">npm install -g ngrok</code></li>
                    <li>Start ngrok: <code className="bg-black/30 px-1 rounded">ngrok http 3000</code></li>
                    <li>Copy the HTTPS URL (e.g., <code className="bg-black/30 px-1 rounded">https://abc123.ngrok.io</code>)</li>
                    <li>Set environment variable: <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io</code></li>
                    <li>Restart your Next.js server</li>
                  </ol>
                  <p className="text-xs text-white/60 mt-2">
                    Or deploy to Vercel for production (recommended)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">How Test Calls Work:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-white/80">
              <li>Select an active agent</li>
              <li>Enter your phone number</li>
              <li>Click "Make Test Call"</li>
              <li>Twilio will call your number</li>
              <li>Answer and talk to your AI agent</li>
              <li>Check the Calls page for transcript</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

