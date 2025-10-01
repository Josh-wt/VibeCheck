-- Add AI-assigned academic tags to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS academic_strengths TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS academic_weaknesses TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_analysis_completed BOOLEAN DEFAULT false;

-- Add index for faster matching queries
CREATE INDEX IF NOT EXISTS idx_profiles_social_group ON profiles(social_group);
CREATE INDEX IF NOT EXISTS idx_profiles_school_social_group ON profiles(school_name, social_group);
CREATE INDEX IF NOT EXISTS idx_academic_profiles_user ON academic_profiles(user_id);