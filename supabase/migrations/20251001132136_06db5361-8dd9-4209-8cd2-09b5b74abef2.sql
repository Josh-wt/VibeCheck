-- Add missing column to academic_profiles
ALTER TABLE public.academic_profiles 
  ADD COLUMN IF NOT EXISTS assessment_completed BOOLEAN DEFAULT false;

-- Create weekend_plans table
CREATE TABLE IF NOT EXISTS public.weekend_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT,
  category TEXT,
  location TEXT,
  date_time TIMESTAMPTZ,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  organizer_id UUID NOT NULL,
  budget_range TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on weekend_plans
ALTER TABLE public.weekend_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekend_plans
CREATE POLICY "Anyone can view weekend plans" ON public.weekend_plans FOR SELECT USING (true);
CREATE POLICY "Users can create weekend plans" ON public.weekend_plans FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update own weekend plans" ON public.weekend_plans FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete own weekend plans" ON public.weekend_plans FOR DELETE USING (auth.uid() = organizer_id);