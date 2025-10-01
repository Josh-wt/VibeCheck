-- Add school_name to profiles table
ALTER TABLE public.profiles ADD COLUMN school_name text NOT NULL DEFAULT '';

-- Update the handle_new_user function to include school_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, grade, first_name, last_name, school_name)
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'grade')::integer, 9),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    COALESCE(new.raw_user_meta_data ->> 'school_name', '')
  );
  RETURN new;
END;
$function$;