-- Add missing columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Create connections table for friend connections
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create study_connections table
CREATE TABLE IF NOT EXISTS public.study_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  partner_id UUID NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key for club_interest to club_proposals
ALTER TABLE public.club_interest 
  ADD CONSTRAINT fk_club_interest_proposal 
  FOREIGN KEY (proposal_id) REFERENCES public.club_proposals(id) ON DELETE CASCADE;

-- Add foreign key for activity_participation to activities
ALTER TABLE public.activity_participation 
  ADD CONSTRAINT fk_activity_participation_activity 
  FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for connections
CREATE POLICY "Users can view their own connections" ON public.connections 
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create connections" ON public.connections 
  FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Users can update their connections" ON public.connections 
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS policies for study_connections  
CREATE POLICY "Users can view their own study connections" ON public.study_connections 
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = partner_id);
CREATE POLICY "Users can create study connections" ON public.study_connections 
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their study connections" ON public.study_connections 
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = partner_id);