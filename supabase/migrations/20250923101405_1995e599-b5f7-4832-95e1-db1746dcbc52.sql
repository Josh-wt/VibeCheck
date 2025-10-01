-- Fix search path for all existing functions to resolve security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_club_interest_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_plan_participant_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_suggestion_interest_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;