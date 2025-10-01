-- Create weekend_interests table for user preferences
CREATE TABLE public.weekend_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_activities JSONB NOT NULL DEFAULT '[]',
  energy_level TEXT NOT NULL CHECK (energy_level IN ('high_energy', 'balanced', 'low_key')),
  preferred_group_size TEXT NOT NULL CHECK (preferred_group_size IN ('one_on_one', 'small_group', 'larger_group', 'flexible')),
  budget_range TEXT NOT NULL CHECK (budget_range IN ('free', 'low_budget', 'medium_budget', 'high_budget')),
  preferred_timings JSONB NOT NULL DEFAULT '[]',
  parent_permission_level TEXT NOT NULL CHECK (parent_permission_level IN ('strict', 'advance_notice', 'spontaneous')),
  assessment_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create weekend_plans table for posted activities
CREATE TABLE public.weekend_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  planned_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours INTEGER DEFAULT 2,
  max_participants INTEGER DEFAULT 5,
  current_participants INTEGER DEFAULT 1,
  budget_estimate TEXT,
  requirements TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create weekend_plan_participants table
CREATE TABLE public.weekend_plan_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.weekend_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'interested', 'maybe')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(plan_id, user_id)
);

-- Create weekend_connection_requests table
CREATE TABLE public.weekend_connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.weekend_plans(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, plan_id)
);

-- Create group_activity_suggestions table
CREATE TABLE public.group_activity_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  target_participants JSONB NOT NULL DEFAULT '[]',
  min_participants INTEGER DEFAULT 3,
  max_participants INTEGER DEFAULT 8,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'planning', 'confirmed', 'cancelled')),
  interest_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create group_suggestion_interest table
CREATE TABLE public.group_suggestion_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.group_activity_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_level TEXT NOT NULL DEFAULT 'interested' CHECK (interest_level IN ('interested', 'very_interested', 'maybe')),
  availability TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(suggestion_id, user_id)
);

-- Create weekend_matches table for AI recommendations
CREATE TABLE public.weekend_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('immediate_opportunity', 'future_suggestion', 'one_on_one_match')),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_plan_id UUID REFERENCES public.weekend_plans(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  compatibility_score INTEGER DEFAULT 0,
  match_reason TEXT NOT NULL,
  suggested_timing TEXT,
  estimated_cost TEXT,
  conversation_starters JSONB DEFAULT '[]',
  is_viewed BOOLEAN DEFAULT false,
  is_acted_on BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.weekend_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekend_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekend_plan_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekend_connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_activity_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_suggestion_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekend_matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekend_interests
CREATE POLICY "Users can manage their own weekend interests" ON public.weekend_interests
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for weekend_plans
CREATE POLICY "Users can view all active weekend plans" ON public.weekend_plans
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can manage their own weekend plans" ON public.weekend_plans
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for weekend_plan_participants
CREATE POLICY "Users can view participants of plans they can see" ON public.weekend_plan_participants
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.weekend_plans 
      WHERE id = plan_id AND is_active = true
    )
  );

CREATE POLICY "Users can manage their own participation" ON public.weekend_plan_participants
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for weekend_connection_requests
CREATE POLICY "Users can view requests related to them" ON public.weekend_connection_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    EXISTS (
      SELECT 1 FROM public.weekend_plans 
      WHERE id = plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create connection requests" ON public.weekend_connection_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Plan owners can update requests" ON public.weekend_connection_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.weekend_plans 
      WHERE id = plan_id AND user_id = auth.uid()
    )
  );

-- RLS policies for group_activity_suggestions
CREATE POLICY "Users can view all group suggestions" ON public.group_activity_suggestions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create group suggestions" ON public.group_activity_suggestions
  FOR INSERT WITH CHECK (auth.uid() = suggested_by);

CREATE POLICY "Users can update their own suggestions" ON public.group_activity_suggestions
  FOR UPDATE USING (auth.uid() = suggested_by);

-- RLS policies for group_suggestion_interest
CREATE POLICY "Users can view all suggestion interest" ON public.group_suggestion_interest
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own suggestion interest" ON public.group_suggestion_interest
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for weekend_matches
CREATE POLICY "Users can view their own matches" ON public.weekend_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own match interactions" ON public.weekend_matches
  FOR UPDATE USING (auth.uid() = user_id);

-- Add update triggers
CREATE TRIGGER update_weekend_interests_updated_at
  BEFORE UPDATE ON public.weekend_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekend_plans_updated_at
  BEFORE UPDATE ON public.weekend_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekend_connection_requests_updated_at
  BEFORE UPDATE ON public.weekend_connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_activity_suggestions_updated_at
  BEFORE UPDATE ON public.group_activity_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update participant count
CREATE OR REPLACE FUNCTION public.update_plan_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.weekend_plans 
    SET current_participants = current_participants + 1
    WHERE id = NEW.plan_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.weekend_plans 
    SET current_participants = current_participants - 1
    WHERE id = OLD.plan_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update participant count
CREATE TRIGGER update_plan_participant_count_trigger
  AFTER INSERT OR DELETE ON public.weekend_plan_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plan_participant_count();

-- Function to update suggestion interest count
CREATE OR REPLACE FUNCTION public.update_suggestion_interest_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.group_activity_suggestions 
    SET interest_count = interest_count + 1,
        status = CASE 
          WHEN interest_count + 1 >= min_participants AND status = 'proposed' 
          THEN 'planning' 
          ELSE status 
        END
    WHERE id = NEW.suggestion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.group_activity_suggestions 
    SET interest_count = interest_count - 1,
        status = CASE 
          WHEN interest_count - 1 < min_participants AND status = 'planning' 
          THEN 'proposed' 
          ELSE status 
        END
    WHERE id = OLD.suggestion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update suggestion interest count
CREATE TRIGGER update_suggestion_interest_count_trigger
  AFTER INSERT OR DELETE ON public.group_suggestion_interest
  FOR EACH ROW
  EXECUTE FUNCTION public.update_suggestion_interest_count();