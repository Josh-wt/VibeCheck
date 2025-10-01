-- Drop unused reference tables
DROP TABLE IF EXISTS public.user_interests CASCADE;
DROP TABLE IF EXISTS public.interests CASCADE;
DROP TABLE IF EXISTS public.academic_subjects CASCADE;

-- Drop the questions and answers tables since Quiz doesn't use them properly
DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;

-- Add quiz_responses column to profiles to store friendship discovery answers
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS quiz_responses jsonb DEFAULT '[]'::jsonb;

-- Update onboarding_progress table to ensure all fields exist
ALTER TABLE public.onboarding_progress
ADD COLUMN IF NOT EXISTS friendship_discovery_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS academic_assessment_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS activity_onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS weekend_assessment_completed boolean DEFAULT false;