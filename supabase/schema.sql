-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth handles auth.users, this is for profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- AI Agents table
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT false,
  voice_provider TEXT DEFAULT 'twilio', -- 'twilio' or 'elevenlabs'
  voice_id TEXT DEFAULT 'alice', -- ElevenLabs voice ID or Twilio voice name
  voice_language TEXT DEFAULT 'en-US',
  voice_settings JSONB, -- Additional voice settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Flow Steps table (for call flow designer)
CREATE TABLE IF NOT EXISTS public.flow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  step_type TEXT NOT NULL, -- 'greeting', 'detection', 'collection', 'confirmation', 'goodbye'
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  fields_to_collect JSONB, -- Array of field names to collect in this step
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(agent_id, step_order)
);

-- Call Logs table
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  call_sid TEXT,
  status TEXT NOT NULL, -- 'ringing', 'answered', 'completed', 'failed'
  duration_seconds INTEGER DEFAULT 0,
  transcript TEXT,
  ai_responses JSONB, -- Array of AI responses during the call
  extracted_data JSONB, -- Customer info extracted during call
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  call_log_id UUID REFERENCES public.call_logs(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'fulfilled', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Settings table (for storing API keys, Twilio config, etc.)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Allow NULL for demo mode, otherwise REFERENCES public.users(id) ON DELETE CASCADE
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, setting_key)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own agents" ON public.ai_agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agents" ON public.ai_agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agents" ON public.ai_agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agents" ON public.ai_agents FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own flow steps" ON public.flow_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = flow_steps.agent_id AND ai_agents.user_id = auth.uid())
);
CREATE POLICY "Users can manage own flow steps" ON public.flow_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = flow_steps.agent_id AND ai_agents.user_id = auth.uid())
);

CREATE POLICY "Users can view own call logs" ON public.call_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = call_logs.agent_id AND ai_agents.user_id = auth.uid())
);
CREATE POLICY "Users can insert own call logs" ON public.call_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = call_logs.agent_id AND ai_agents.user_id = auth.uid())
);

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = orders.agent_id AND ai_agents.user_id = auth.uid())
);
CREATE POLICY "Users can manage own orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = orders.agent_id AND ai_agents.user_id = auth.uid())
);

-- User Settings RLS Policies (allow demo mode with mock user_id)
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT 
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE 
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);
CREATE POLICY "Users can delete own settings" ON public.user_settings FOR DELETE 
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_id ON public.ai_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_steps_agent_id ON public.flow_steps(agent_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_agent_id ON public.call_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON public.call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_agent_id ON public.orders(agent_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON public.user_settings(user_id, setting_key);


