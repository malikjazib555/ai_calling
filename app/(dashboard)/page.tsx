'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Phone, Settings, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  description: string
  phone_number: string
  is_active: boolean
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadAgents = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now()
      console.log('[AgentsPage] Fetching agents...', timestamp)
      const res = await fetch(`/api/agents?t=${timestamp}`, { 
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })
      
      if (!res.ok) {
        console.error('[AgentsPage] Response not OK:', res.status, res.statusText)
        setAgents([])
        setLoading(false)
        setRefreshing(false)
        return
      }
      
      const data = await res.json()
      console.log('[AgentsPage] Agents loaded:', data)
      console.log('[AgentsPage] Is array?', Array.isArray(data))
      console.log('[AgentsPage] Agents count:', Array.isArray(data) ? data.length : 0)
      
      if (Array.isArray(data)) {
        setAgents(data)
        console.log('[AgentsPage] Set agents:', data.length, data)
      } else {
        console.warn('[AgentsPage] Data is not an array:', typeof data, data)
        setAgents([])
      }
      setLoading(false)
      setRefreshing(false)
    } catch (error) {
      console.error('[AgentsPage] Error fetching agents:', error)
      setAgents([])
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    // Load immediately
    loadAgents()
    
    // Refresh agents every 2 seconds to catch new ones
    const interval = setInterval(loadAgents, 2000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-white/60 mt-1">Manage your automated phone agents</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setRefreshing(true)
              loadAgents()
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/agents/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Link>
          </Button>
        </div>
      </div>

      {agents.length === 0 ? (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>No agents yet</CardTitle>
            <CardDescription>
              Create your first AI phone agent to start handling calls automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/agents/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{agent.name}</CardTitle>
                  <div className={`h-2 w-2 rounded-full ${agent.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                </div>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Phone className="h-4 w-4" />
                    {agent.phone_number || 'Not configured'}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/agents/${agent.id}`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
