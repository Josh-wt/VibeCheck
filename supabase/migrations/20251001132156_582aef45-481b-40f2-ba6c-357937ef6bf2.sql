-- Create weekend_plan_participants table
CREATE TABLE IF NOT EXISTS public.weekend_plan_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.weekend_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Create weekend_connection_requests table
CREATE TABLE IF NOT EXISTS public.weekend_connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  activity_preference TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to weekend_plans for compatibility
ALTER TABLE public.weekend_plans 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS planned_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_hours INTEGER,
  ADD COLUMN IF NOT EXISTS budget_estimate TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE public.weekend_plan_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekend_connection_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekend_plan_participants
CREATE POLICY "Users can view plan participants" ON public.weekend_plan_participants FOR SELECT USING (true);
CREATE POLICY "Users can join plans" ON public.weekend_plan_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave plans" ON public.weekend_plan_participants FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for weekend_connection_requests
CREATE POLICY "Users can view their connection requests" ON public.weekend_connection_requests 
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create connection requests" ON public.weekend_connection_requests 
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their requests" ON public.weekend_connection_requests 
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);