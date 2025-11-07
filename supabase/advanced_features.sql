-- Analytics and advanced features tables

-- Call Analytics table
CREATE TABLE IF NOT EXISTS public.call_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_log_id UUID REFERENCES public.call_logs(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  sentiment_score DECIMAL(3,2), -- -1 to 1 (negative to positive)
  intent_detected TEXT,
  keywords JSONB, -- Array of detected keywords
  customer_satisfaction INTEGER, -- 1-5 rating
  call_quality_score DECIMAL(3,2), -- 0 to 1
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['call.started', 'call.ended', 'order.created', etc.]
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'email', 'sms', 'push'
  event_type TEXT NOT NULL, -- 'order.created', 'call.failed', etc.
  recipient TEXT NOT NULL, -- email or phone
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Call Recordings table
CREATE TABLE IF NOT EXISTS public.call_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_log_id UUID REFERENCES public.call_logs(id) ON DELETE CASCADE NOT NULL,
  recording_url TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  format TEXT DEFAULT 'mp3',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Agent Templates table (for sharing/reusing flows)
CREATE TABLE IF NOT EXISTS public.agent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  flow_steps JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  category TEXT, -- 'ecommerce', 'support', 'sales', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_call_analytics_call_log_id ON public.call_analytics(call_log_id);
CREATE INDEX IF NOT EXISTS idx_call_analytics_agent_id ON public.call_analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_agent_id ON public.webhooks(agent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_call_recordings_call_log_id ON public.call_recordings(call_log_id);

-- RLS Policies
ALTER TABLE public.call_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON public.call_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = call_analytics.agent_id AND ai_agents.user_id = auth.uid())
);

CREATE POLICY "Users can manage own webhooks" ON public.webhooks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recordings" ON public.call_recordings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.call_logs WHERE call_logs.id = call_recordings.call_log_id 
    AND EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = call_logs.agent_id AND ai_agents.user_id = auth.uid()))
);

CREATE POLICY "Users can view own templates" ON public.agent_templates FOR SELECT USING (
  user_id IS NULL OR user_id = auth.uid() OR is_public = true
);

CREATE POLICY "Users can manage own templates" ON public.agent_templates FOR ALL USING (auth.uid() = user_id);

