-- Add social_group column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN social_group TEXT,
ADD COLUMN social_group_analysis JSONB,
ADD COLUMN social_group_updated_at TIMESTAMP WITH TIME ZONE;

-- Create social groups reference table
CREATE TABLE public.social_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  characteristics JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert predefined social groups
INSERT INTO public.social_groups (name, description, characteristics) VALUES
('Academic Achievers', 'Students focused on academic excellence and intellectual pursuits', '[
  "High motivation for academic success",
  "Enjoys studying in groups",
  "Participates in academic competitions",
  "Values intellectual discussions",
  "Often joins academic clubs"
]'::jsonb),
('Social Connectors', 'Outgoing students who thrive on social interactions and friendships', '[
  "Highly social and outgoing",
  "Enjoys group activities and events",
  "Natural networkers",
  "Prefers collaborative over individual work",
  "Active in social clubs and organizations"
]'::jsonb),
('Creative Innovators', 'Students passionate about arts, creativity, and self-expression', '[
  "Strong interest in creative arts",
  "Enjoys self-expression through various mediums",
  "Thinks outside the box",
  "Values originality and innovation",
  "Participates in creative clubs and activities"
]'::jsonb),
('Athletic Competitors', 'Sports-oriented students who value physical fitness and competition', '[
  "High interest in sports and physical activities",
  "Competitive nature",
  "Values teamwork and physical fitness",
  "Enjoys outdoor activities",
  "Participates in sports teams and competitions"
]'::jsonb),
('Balanced Explorers', 'Well-rounded students who enjoy diverse interests and experiences', '[
  "Curious about many different subjects",
  "Enjoys trying new activities",
  "Balances multiple interests",
  "Adaptable and flexible",
  "Open to various types of friendships"
]'::jsonb),
('Tech Enthusiasts', 'Students passionate about technology, gaming, and digital innovation', '[
  "Strong interest in technology and digital tools",
  "Enjoys gaming and tech-related activities",
  "Values innovation and problem-solving",
  "Prefers online and tech-based social interactions",
  "Participates in tech clubs and coding activities"
]'::jsonb);

-- Enable RLS on social_groups table
ALTER TABLE public.social_groups ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing social groups
CREATE POLICY "Anyone can view social groups" 
ON public.social_groups 
FOR SELECT 
USING (true);

-- Create index for faster social group lookups
CREATE INDEX idx_profiles_social_group ON public.profiles(social_group);