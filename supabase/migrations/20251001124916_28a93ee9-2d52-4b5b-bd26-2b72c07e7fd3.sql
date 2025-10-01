-- Add 8 new diverse social groups
INSERT INTO public.social_groups (name, description, characteristics) VALUES
(
  'Environmental Advocates',
  'Eco-conscious students passionate about sustainability, conservation, and environmental activism',
  '["Care deeply about climate change", "Enjoy outdoor conservation", "Advocate for sustainability", "Participate in environmental clubs", "Promote green initiatives"]'::jsonb
),
(
  'Entrepreneurial Minds',
  'Business-minded students who love innovation, leadership, and creating new ventures',
  '["Think like entrepreneurs", "Natural leaders", "Love innovation and startups", "Problem solvers", "Future business leaders"]'::jsonb
),
(
  'Cultural Explorers',
  'Students fascinated by different cultures, languages, and global perspectives',
  '["Love learning languages", "Interested in world cultures", "Enjoy international events", "Celebrate diversity", "Global perspective"]'::jsonb
),
(
  'Health & Wellness',
  'Students focused on fitness, nutrition, mental health, and overall well-being',
  '["Prioritize physical health", "Mindful and balanced", "Enjoy fitness activities", "Nutrition-conscious", "Support mental wellness"]'::jsonb
),
(
  'Community Volunteers',
  'Service-oriented students dedicated to helping others and making a difference',
  '["Love volunteering", "Community-focused", "Empathetic helpers", "Organize charity events", "Social impact driven"]'::jsonb
),
(
  'STEM Innovators',
  'Science, math, and engineering enthusiasts who love hands-on innovation',
  '["Excel in STEM subjects", "Love building and creating", "Participate in science fairs", "Engineering mindset", "Research-oriented"]'::jsonb
),
(
  'Media & Communication',
  'Creative communicators interested in journalism, broadcasting, and digital media',
  '["Strong communicators", "Love storytelling", "Digital media savvy", "Enjoy public speaking", "Creative content creators"]'::jsonb
),
(
  'Outdoor Adventurers',
  'Nature-loving students who thrive on outdoor activities and adventure sports',
  '["Love the outdoors", "Adventurous spirit", "Enjoy hiking and camping", "Nature enthusiasts", "Active lifestyle"]'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  characteristics = EXCLUDED.characteristics;