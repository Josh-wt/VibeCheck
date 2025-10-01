-- Create academic_subjects table with predefined subjects
CREATE TABLE public.academic_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert predefined subjects
INSERT INTO public.academic_subjects (name, category) VALUES 
  ('Mathematics/Algebra', 'STEM'),
  ('English/Literature', 'Language Arts'),
  ('Biology', 'Science'),
  ('Chemistry', 'Science'),
  ('Physics', 'Science'),
  ('History', 'Social Studies'),
  ('Spanish/French/Foreign Language', 'Language'),
  ('Computer Science', 'Technology'),
  ('Art/Visual Arts', 'Arts'),
  ('Music', 'Arts'),
  ('Geography', 'Social Studies'),
  ('Psychology', 'Social Studies'),
  ('Economics', 'Social Studies'),
  ('Physical Education', 'Health'),
  ('Government/Civics', 'Social Studies');

-- Create academic_profiles table
CREATE TABLE public.academic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_subjects JSONB NOT NULL DEFAULT '[]',
  struggle_subjects JSONB NOT NULL DEFAULT '[]',
  teaching_subjects JSONB NOT NULL DEFAULT '[]',
  help_needed_subjects JSONB NOT NULL DEFAULT '[]',
  assessment_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create study_connections table for tracking study partnerships
CREATE TABLE public.study_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subjects JSONB NOT NULL DEFAULT '[]',
  connection_type TEXT NOT NULL CHECK (connection_type IN ('study_request', 'study_accepted', 'study_declined')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (requester_id != partner_id),
  UNIQUE(requester_id, partner_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.academic_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for academic_subjects (public read)
CREATE POLICY "Anyone can view academic subjects" ON public.academic_subjects
  FOR SELECT TO authenticated USING (true);

-- RLS policies for academic_profiles
CREATE POLICY "Users can view their own academic profile" ON public.academic_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own academic profile" ON public.academic_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own academic profile" ON public.academic_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for study_connections
CREATE POLICY "Users can view their study connections" ON public.study_connections
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create study connections" ON public.study_connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their study connections" ON public.study_connections
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = partner_id);

-- Add trigger for academic_profiles updated_at
CREATE TRIGGER update_academic_profiles_updated_at
  BEFORE UPDATE ON public.academic_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for study_connections updated_at  
CREATE TRIGGER update_study_connections_updated_at
  BEFORE UPDATE ON public.study_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();