'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Mail, MessageSquare, Bell } from 'lucide-react'

export default function NotificationsPage() {
  const [settings, setSettings] = useState({
    email_enabled: false,
    sms_enabled: false,
    push_enabled: false,
    email_address: '',
    phone_number: '',
    order_created: true,
    call_failed: true,
    agent_activated: false,
  })

  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    await fetch('/api/notifications/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    alert('Notification settings saved!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-white/60 mt-1">Configure how you receive updates</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-white/60" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-white/60">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={settings.email_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, email_enabled: checked })}
              />
            </div>

            {settings.email_enabled && (
              <div className="ml-8 space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={settings.email_address}
                  onChange={(e) => setSettings({ ...settings, email_address: e.target.value })}
                  placeholder="your@email.com"
                  className="bg-white/5 border-white/10"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-white/60" />
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-white/60">Receive updates via SMS</p>
                </div>
              </div>
              <Switch
                checked={settings.sms_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, sms_enabled: checked })}
              />
            </div>

            {settings.sms_enabled && (
              <div className="ml-8 space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={settings.phone_number}
                  onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                  placeholder="+1234567890"
                  className="bg-white/5 border-white/10"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-white/60" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-white/60">Browser push notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.push_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, push_enabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Event Preferences</CardTitle>
            <CardDescription>Choose which events trigger notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Order Created</Label>
                <p className="text-sm text-white/60">When a new order is placed</p>
              </div>
              <Switch
                checked={settings.order_created}
                onCheckedChange={(checked) => setSettings({ ...settings, order_created: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Call Failed</Label>
                <p className="text-sm text-white/60">When a call fails to connect</p>
              </div>
              <Switch
                checked={settings.call_failed}
                onCheckedChange={(checked) => setSettings({ ...settings, call_failed: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Agent Activated</Label>
                <p className="text-sm text-white/60">When an agent is activated</p>
              </div>
              <Switch
                checked={settings.agent_activated}
                onCheckedChange={(checked) => setSettings({ ...settings, agent_activated: checked })}
              />
            </div>

            <Button onClick={handleSave} className="w-full mt-4">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Recent notifications sent</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-white/60">No notifications yet</div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5"
                >
                  <div>
                    <p className="font-medium">{notification.subject || notification.message}</p>
                    <p className="text-sm text-white/60">
                      {notification.type} • {notification.event_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      notification.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                      notification.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {notification.status}
                    </span>
                    <p className="text-xs text-white/60 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

