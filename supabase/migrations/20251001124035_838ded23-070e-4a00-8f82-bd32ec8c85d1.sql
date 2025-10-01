-- Seed social groups with comprehensive data
INSERT INTO public.social_groups (name, description, characteristics) VALUES
(
  'Academic Achievers',
  'Students who thrive on learning, excel in academics, and enjoy intellectual challenges',
  '["Love discussing ideas and concepts", "Organized study habits", "Goal-oriented mindset", "Enjoy academic competitions", "Value knowledge and learning"]'::jsonb
),
(
  'Social Connectors',
  'Outgoing students who energize through social interaction and building relationships',
  '["Thrive in group settings", "Natural networkers", "Enjoy organizing events", "Strong communication skills", "Build diverse friendships"]'::jsonb
),
(
  'Creative Innovators',
  'Artistic and imaginative students who express themselves through creativity',
  '["Think outside the box", "Love artistic expression", "Enjoy creative projects", "Appreciate aesthetics", "Innovative problem solvers"]'::jsonb
),
(
  'Athletic Competitors',
  'Active students who love sports, physical challenges, and team competition',
  '["High energy levels", "Competitive spirit", "Team players", "Value physical fitness", "Goal-driven athletes"]'::jsonb
),
(
  'Tech Enthusiasts',
  'Tech-savvy students passionate about gaming, coding, and digital innovation',
  '["Love technology and gaming", "Strategic thinkers", "Enjoy problem-solving", "Early adopters", "Online community builders"]'::jsonb
),
(
  'Balanced Explorers',
  'Well-rounded students who enjoy diverse activities and maintaining balance',
  '["Versatile interests", "Open to new experiences", "Adaptable", "Value variety", "Enjoy multiple hobbies"]'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  characteristics = EXCLUDED.characteristics;

-- Add index for efficient matching queries
CREATE INDEX IF NOT EXISTS idx_profiles_school_social_group 
ON public.profiles(school_name, social_group) 
WHERE social_group IS NOT NULL;