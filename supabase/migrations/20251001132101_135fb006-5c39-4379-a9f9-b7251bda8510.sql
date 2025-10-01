-- Create all necessary tables for the application

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  full_name TEXT,
  school_name TEXT,
  grade TEXT,
  quiz_responses JSONB DEFAULT '[]'::jsonb,
  social_group TEXT,
  social_group_analysis JSONB,
  social_group_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Onboarding progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  friendship_discovery_completed BOOLEAN DEFAULT false,
  academic_assessment_completed BOOLEAN DEFAULT false,
  activity_onboarding_completed BOOLEAN DEFAULT false,
  weekend_assessment_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Academic profiles table
CREATE TABLE IF NOT EXISTS public.academic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  favorite_subjects TEXT[],
  struggle_subjects TEXT[],
  help_needed_subjects TEXT[],
  teaching_subjects TEXT[],
  study_style TEXT,
  availability TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activity profiles table
CREATE TABLE IF NOT EXISTS public.activity_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  interested_activities TEXT[],
  current_activities TEXT[],
  activity_goals TEXT[],
  time_commitment TEXT,
  leadership_interest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  advisor_contact TEXT,
  meeting_times TEXT,
  location TEXT,
  current_members INTEGER DEFAULT 0,
  max_members INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity participation table
CREATE TABLE IF NOT EXISTS public.activity_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Club proposals table
CREATE TABLE IF NOT EXISTS public.club_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  proposed_by UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  interest_count INTEGER DEFAULT 0,
  min_members INTEGER DEFAULT 5,
  meeting_times TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Club interest table
CREATE TABLE IF NOT EXISTS public.club_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  proposal_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weekend interests table
CREATE TABLE IF NOT EXISTS public.weekend_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  favorite_activities TEXT[],
  energy_level TEXT,
  preferred_group_size TEXT,
  budget_range TEXT,
  preferred_timings TEXT[],
  parent_permission_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social groups table
CREATE TABLE IF NOT EXISTS public.social_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  characteristics JSONB DEFAULT '[]'::jsonb,
  ideal_activities JSONB DEFAULT '[]'::jsonb,
  communication_style TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekend_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can view own progress" ON public.onboarding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.onboarding_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for academic_profiles
CREATE POLICY "Users can view all academic profiles" ON public.academic_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own academic profile" ON public.academic_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own academic profile" ON public.academic_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_profiles
CREATE POLICY "Users can view all activity profiles" ON public.activity_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own activity profile" ON public.activity_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity profile" ON public.activity_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activities
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true);

-- RLS Policies for activity_participation
CREATE POLICY "Users can view all participation" ON public.activity_participation FOR SELECT USING (true);
CREATE POLICY "Users can join activities" ON public.activity_participation FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave own activities" ON public.activity_participation FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for club_proposals
CREATE POLICY "Anyone can view club proposals" ON public.club_proposals FOR SELECT USING (true);
CREATE POLICY "Users can create proposals" ON public.club_proposals FOR INSERT WITH CHECK (auth.uid() = proposed_by);
CREATE POLICY "Users can update own proposals" ON public.club_proposals FOR UPDATE USING (auth.uid() = proposed_by);

-- RLS Policies for club_interest
CREATE POLICY "Users can view all club interests" ON public.club_interest FOR SELECT USING (true);
CREATE POLICY "Users can express interest" ON public.club_interest FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own interest" ON public.club_interest FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for weekend_interests
CREATE POLICY "Users can view all weekend interests" ON public.weekend_interests FOR SELECT USING (true);
CREATE POLICY "Users can update own weekend interests" ON public.weekend_interests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weekend interests" ON public.weekend_interests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for social_groups
CREATE POLICY "Anyone can view social groups" ON public.social_groups FOR SELECT USING (true);