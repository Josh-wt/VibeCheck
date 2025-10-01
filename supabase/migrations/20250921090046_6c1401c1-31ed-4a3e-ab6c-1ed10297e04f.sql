-- Create activities table with predefined school activities
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  meeting_times TEXT,
  location TEXT,
  advisor_contact TEXT,
  max_members INTEGER,
  current_members INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert predefined activities
INSERT INTO public.activities (name, category, description, meeting_times, location) VALUES 
-- Sports
('Basketball Team', 'Sports', 'Competitive basketball team', 'Mon/Wed/Fri 3:30-5:30pm', 'Gymnasium'),
('Soccer Club', 'Sports', 'Recreational and competitive soccer', 'Tue/Thu 4:00-6:00pm', 'Soccer Field'),
('Track & Field', 'Sports', 'Track and field athletics', 'Daily 3:30-5:30pm', 'Track'),
('Swimming Team', 'Sports', 'Competitive swimming', 'Mon/Wed/Fri 6:00-8:00am', 'Pool'),

-- Academic Clubs
('Debate Team', 'Academic', 'Competitive debate and public speaking', 'Wed 3:30-5:00pm', 'Room 205'),
('Science Olympiad', 'Academic', 'STEM competition team', 'Thu 3:30-5:00pm', 'Science Lab'),
('Math Club', 'Academic', 'Mathematics competitions and tutoring', 'Tue 3:30-4:30pm', 'Room 301'),
('Model UN', 'Academic', 'Model United Nations simulations', 'Fri 3:30-5:30pm', 'Room 210'),

-- Arts & Performance
('Drama Club', 'Arts', 'Theater productions and acting', 'Mon/Wed 3:30-6:00pm', 'Auditorium'),
('Art Club', 'Arts', 'Visual arts and creative projects', 'Thu 3:30-5:00pm', 'Art Room'),
('Music Ensemble', 'Arts', 'Instrumental and vocal performances', 'Tue/Thu 3:30-5:00pm', 'Music Room'),
('Creative Writing', 'Arts', 'Writing workshops and literary magazine', 'Wed 3:30-4:30pm', 'Library'),

-- Service & Leadership
('Student Government', 'Leadership', 'Student representation and school events', 'Fri 3:30-4:30pm', 'Conference Room'),
('National Honor Society', 'Service', 'Academic honor society with service projects', 'Monthly meetings', 'Room 150'),
('Volunteer Club', 'Service', 'Community service coordination', 'Tue 3:30-4:30pm', 'Room 180'),
('Environmental Club', 'Service', 'Sustainability and environmental awareness', 'Thu 3:30-4:30pm', 'Room 190'),

-- Technology & Innovation
('Robotics Team', 'Technology', 'Build and program robots for competitions', 'Mon/Wed/Fri 3:30-6:00pm', 'Tech Lab'),
('Computer Science Club', 'Technology', 'Programming projects and competitions', 'Thu 3:30-5:00pm', 'Computer Lab'),
('Game Development', 'Technology', 'Create video games and interactive media', 'Tue 3:30-5:00pm', 'Media Lab');

-- Create activity_participation table
CREATE TABLE public.activity_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'leader', 'officer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, activity_id)
);

-- Create activity_interests table
CREATE TABLE public.activity_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  activity_category TEXT NOT NULL,
  interest_level TEXT DEFAULT 'interested' CHECK (interest_level IN ('interested', 'very_interested', 'maybe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity_profiles table for onboarding responses
CREATE TABLE public.activity_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_activities JSONB NOT NULL DEFAULT '[]',
  interested_activities JSONB NOT NULL DEFAULT '[]',
  time_commitment TEXT NOT NULL CHECK (time_commitment IN ('1-2 hrs', '3-5 hrs', '6-10 hrs', '10+ hrs')),
  leadership_interest TEXT NOT NULL CHECK (leadership_interest IN ('love_organizing', 'maybe', 'prefer_participating')),
  activity_goals JSONB NOT NULL DEFAULT '[]',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create club_proposals table
CREATE TABLE public.club_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_by UUID NOT NULL REFERENCES auth.users(id),
  meeting_times TEXT,
  location TEXT,
  min_members INTEGER DEFAULT 5,
  max_members INTEGER,
  status TEXT DEFAULT 'gathering_interest' CHECK (status IN ('gathering_interest', 'ready_to_form', 'formed', 'cancelled')),
  interest_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create club_interest table
CREATE TABLE public.club_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES public.club_proposals(id) ON DELETE CASCADE,
  interest_level TEXT DEFAULT 'interested' CHECK (interest_level IN ('interested', 'very_interested', 'maybe')),
  willing_to_lead BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, proposal_id)
);

-- Create activity_recommendations table
CREATE TABLE public.activity_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('join_existing', 'start_new', 'explore_solo')),
  activity_name TEXT NOT NULL,
  activity_category TEXT NOT NULL,
  reason TEXT NOT NULL,
  peer_count INTEGER DEFAULT 0,
  benefits TEXT,
  next_steps TEXT,
  priority_score INTEGER DEFAULT 0,
  is_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for activities (public read)
CREATE POLICY "Anyone can view activities" ON public.activities
  FOR SELECT TO authenticated USING (true);

-- RLS policies for activity_participation
CREATE POLICY "Users can view all activity participation" ON public.activity_participation
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own participation" ON public.activity_participation
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for activity_interests
CREATE POLICY "Users can manage their own interests" ON public.activity_interests
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for activity_profiles
CREATE POLICY "Users can manage their own activity profile" ON public.activity_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for club_proposals
CREATE POLICY "Anyone can view club proposals" ON public.club_proposals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create club proposals" ON public.club_proposals
  FOR INSERT WITH CHECK (auth.uid() = proposed_by);

CREATE POLICY "Users can update their own proposals" ON public.club_proposals
  FOR UPDATE USING (auth.uid() = proposed_by);

-- RLS policies for club_interest
CREATE POLICY "Users can view all club interest" ON public.club_interest
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own club interest" ON public.club_interest
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for activity_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.activity_recommendations
  FOR SELECT USING (auth.uid() = user_id);

-- Add update triggers
CREATE TRIGGER update_activity_profiles_updated_at
  BEFORE UPDATE ON public.activity_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_proposals_updated_at
  BEFORE UPDATE ON public.club_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update club interest count
CREATE OR REPLACE FUNCTION public.update_club_interest_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.club_proposals 
    SET interest_count = interest_count + 1,
        status = CASE 
          WHEN interest_count + 1 >= min_members AND status = 'gathering_interest' 
          THEN 'ready_to_form' 
          ELSE status 
        END
    WHERE id = NEW.proposal_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.club_proposals 
    SET interest_count = interest_count - 1,
        status = CASE 
          WHEN interest_count - 1 < min_members AND status = 'ready_to_form' 
          THEN 'gathering_interest' 
          ELSE status 
        END
    WHERE id = OLD.proposal_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update club interest count
CREATE TRIGGER update_club_interest_count_trigger
  AFTER INSERT OR DELETE ON public.club_interest
  FOR EACH ROW
  EXECUTE FUNCTION public.update_club_interest_count();