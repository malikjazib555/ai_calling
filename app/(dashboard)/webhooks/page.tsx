'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, TestTube } from 'lucide-react'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  is_active: boolean
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    is_active: true,
  })

  useEffect(() => {
    fetch('/api/webhooks')
      .then(res => res.json())
      .then(data => {
        setWebhooks(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      const newWebhook = await response.json()
      setWebhooks([...webhooks, newWebhook])
      setShowForm(false)
      setFormData({ name: '', url: '', events: [], is_active: true })
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
    setWebhooks(webhooks.filter(w => w.id !== id))
  }

  const toggleEvent = (event: string) => {
    setFormData({
      ...formData,
      events: formData.events.includes(event)
        ? formData.events.filter(e => e !== event)
        : [...formData.events, event],
    })
  }

  const testWebhook = async (id: string) => {
    await fetch(`/api/webhooks/${id}/test`, { method: 'POST' })
    alert('Test webhook sent!')
  }

  const availableEvents = [
    'call.started',
    'call.ended',
    'call.failed',
    'order.created',
    'order.updated',
    'order.completed',
    'agent.activated',
    'agent.deactivated',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-white/60 mt-1">Configure webhooks for real-time integrations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {showForm && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Create Webhook</CardTitle>
            <CardDescription>Set up a webhook to receive real-time events</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Integration"
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://your-app.com/webhook"
                  className="bg-white/5 border-white/10"
                  type="url"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <label
                      key={event}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Webhook</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="py-12 text-center">
              <p className="text-white/60">No webhooks configured</p>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className="border-white/10 bg-white/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{webhook.name}</CardTitle>
                    <CardDescription className="mt-1">{webhook.url}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${webhook.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-sm text-white/60">{webhook.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-white/60">Subscribed Events</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-1 rounded bg-white/10 text-xs text-white/80"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(webhook.id)}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

