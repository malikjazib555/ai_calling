-- Add voice settings to ai_agents table
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS voice_provider TEXT DEFAULT 'twilio'; -- 'twilio' or 'elevenlabs'
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS voice_id TEXT; -- ElevenLabs voice ID or Twilio voice name
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS voice_language TEXT DEFAULT 'en-US';
ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS voice_settings JSONB; -- Additional voice settings

