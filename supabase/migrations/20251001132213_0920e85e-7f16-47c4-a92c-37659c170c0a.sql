-- Add max_members column to club_proposals
ALTER TABLE public.club_proposals 
  ADD COLUMN IF NOT EXISTS max_members INTEGER;