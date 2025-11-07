'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const [twilioSid, setTwilioSid] = useState('')
  const [twilioToken, setTwilioToken] = useState('')
  const [twilioPhone, setTwilioPhone] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [deepgramKey, setDeepgramKey] = useState('')
  const [elevenlabsKey, setElevenlabsKey] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [liveCallAlerts, setLiveCallAlerts] = useState(false)
  const [savingTwilio, setSavingTwilio] = useState(false)
  const [savingAPI, setSavingAPI] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savedTwilio, setSavedTwilio] = useState(false)
  const [savedAPI, setSavedAPI] = useState(false)
  const [savedNotifications, setSavedNotifications] = useState(false)

  useEffect(() => {
    // Load settings on mount, but keep hardcoded defaults if no saved settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded settings from API:', data)
        // Only override if saved settings exist
        if (data.twilio_account_sid) setTwilioSid(data.twilio_account_sid)
        if (data.twilio_auth_token) setTwilioToken(data.twilio_auth_token)
        if (data.twilio_phone_number) setTwilioPhone(data.twilio_phone_number)
        if (data.openai_api_key) setOpenaiKey(data.openai_api_key)
        if (data.deepgram_api_key) setDeepgramKey(data.deepgram_api_key)
        if (data.elevenlabs_api_key) setElevenlabsKey(data.elevenlabs_api_key)
        if (data.email_notifications !== undefined) setEmailNotifications(data.email_notifications)
        if (data.live_call_alerts !== undefined) setLiveCallAlerts(data.live_call_alerts)
      })
      .catch(error => {
        console.error('Error loading settings:', error)
        // Keep hardcoded defaults on error
      })
  }, [])

  const saveTwilioSettings = async () => {
    // Validate inputs
    if (!twilioSid.trim()) {
      alert('❌ Please enter Account SID')
      return
    }
    if (!twilioToken.trim()) {
      alert('❌ Please enter Auth Token')
      return
    }
    if (!twilioPhone.trim()) {
      alert('❌ Please enter Phone Number')
      return
    }

    setSavingTwilio(true)
    setSavedTwilio(false)

    try {
      console.log('Saving Twilio settings:', {
        account_sid: twilioSid.trim(),
        phone_number: twilioPhone.trim(),
        auth_token: twilioToken.trim() ? '***' : 'empty'
      })

      const response = await fetch('/api/settings/twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_sid: twilioSid.trim(),
          auth_token: twilioToken.trim(),
          phone_number: twilioPhone.trim(),
        }),
      })

      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`Invalid response: ${responseText}`)
      }

      console.log('Save Twilio response:', data)

      if (response.ok && data.success) {
        setSavedTwilio(true)
        
        // Immediately reload settings to show saved values
        try {
          const reloadResponse = await fetch('/api/settings')
          const reloadData = await reloadResponse.json()
          console.log('Reloaded settings after save:', reloadData)
          
          // Update form fields with saved values (only if they exist)
          if (reloadData.twilio_account_sid) setTwilioSid(reloadData.twilio_account_sid)
          if (reloadData.twilio_auth_token) setTwilioToken(reloadData.twilio_auth_token)
          if (reloadData.twilio_phone_number) setTwilioPhone(reloadData.twilio_phone_number)
          
          alert(`✅ Success! ${data.message || 'Twilio settings saved successfully'}\n\nSaved values:\n- Account SID: ${reloadData.twilio_account_sid || twilioSid ? '✓' : '✗'}\n- Auth Token: ${reloadData.twilio_auth_token || twilioToken ? '✓' : '✗'}\n- Phone: ${reloadData.twilio_phone_number || twilioPhone || 'Not saved'}`)
        } catch (reloadError) {
          console.error('Error reloading settings:', reloadError)
          alert(`✅ Success! ${data.message || 'Twilio settings saved successfully'}`)
        }
        
        setTimeout(() => setSavedTwilio(false), 5000)
      } else {
        const errorMsg = data.error || data.message || 'Failed to save Twilio settings'
        console.error('Save error:', errorMsg)
        alert(`❌ Error: ${errorMsg}`)
      }
    } catch (error: any) {
      console.error('Save exception:', error)
      alert(`❌ Error: ${error.message || 'Network error. Please try again.'}`)
    } finally {
      setSavingTwilio(false)
    }
  }

  const saveAPISettings = async () => {
    setSavingAPI(true)
    setSavedAPI(false)

    try {
      const response = await fetch('/api/settings/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openai_api_key: openaiKey.trim(),
          deepgram_api_key: deepgramKey.trim(),
          elevenlabs_api_key: elevenlabsKey.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSavedAPI(true)
        setTimeout(() => setSavedAPI(false), 3000)
      } else {
        alert(`Error: ${data.error || 'Failed to save API settings'}`)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSavingAPI(false)
    }
  }

  const saveNotificationSettings = async () => {
    setSavingNotifications(true)
    setSavedNotifications(false)

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          live_call_alerts: liveCallAlerts,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSavedNotifications(true)
        setTimeout(() => setSavedNotifications(false), 3000)
      } else {
        alert(`Error: ${data.error || 'Failed to save notification settings'}`)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSavingNotifications(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-white/60 mt-1">Configure your account and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Manage your API keys and integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deepgram-key">Deepgram API Key</Label>
              <Input
                id="deepgram-key"
                type="password"
                value={deepgramKey}
                onChange={(e) => setDeepgramKey(e.target.value)}
                placeholder="..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
              <Input
                id="elevenlabs-key"
                type="password"
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
                placeholder="..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <Button onClick={saveAPISettings} disabled={savingAPI} className="w-full">
              {savingAPI ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : savedAPI ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Twilio Configuration</CardTitle>
            <CardDescription>Connect your Twilio account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twilio-sid">Account SID</Label>
              <Input
                id="twilio-sid"
                value={twilioSid}
                onChange={(e) => setTwilioSid(e.target.value)}
                placeholder="AC..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-token">Auth Token</Label>
              <Input
                id="twilio-token"
                type="password"
                value={twilioToken}
                onChange={(e) => setTwilioToken(e.target.value)}
                placeholder="..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twilio-phone">Phone Number</Label>
              <Input
                id="twilio-phone"
                value={twilioPhone}
                onChange={(e) => setTwilioPhone(e.target.value)}
                placeholder="+1234567890"
                className="bg-white/5 border-white/10"
              />
            </div>
            <Button onClick={saveTwilioSettings} disabled={savingTwilio} className="w-full">
              {savingTwilio ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : savedTwilio ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <p className="text-xs text-white/60">
              Note: Settings are stored securely. For production, use environment variables.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Control how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-white/60">Receive email updates for new orders</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Live Call Alerts</Label>
                <p className="text-sm text-white/60">Get notified when calls come in</p>
              </div>
              <Switch
                checked={liveCallAlerts}
                onCheckedChange={setLiveCallAlerts}
              />
            </div>
            <Button onClick={saveNotificationSettings} disabled={savingNotifications} className="w-full">
              {savingNotifications ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : savedNotifications ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
