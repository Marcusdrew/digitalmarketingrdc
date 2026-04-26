TRUNCATE TABLE public.site_visits;

ALTER TABLE public.site_visits
  ADD COLUMN IF NOT EXISTS visit_day date NOT NULL DEFAULT ((now() AT TIME ZONE 'UTC')::date);

DROP TRIGGER IF EXISTS enforce_visit_rate_limit ON public.site_visits;

CREATE OR REPLACE FUNCTION public.check_visit_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.visitor_id IS NULL OR length(trim(NEW.visitor_id)) = 0 THEN
    RAISE EXCEPTION 'visitor_id is required';
  END IF;

  IF NEW.visit_day IS NULL THEN
    NEW.visit_day := (now() AT TIME ZONE 'UTC')::date;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.site_visits
    WHERE visitor_id = NEW.visitor_id
      AND visit_day = NEW.visit_day
  ) THEN
    RAISE EXCEPTION 'Rate limit: one visit per device per day';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_visit_rate_limit
BEFORE INSERT ON public.site_visits
FOR EACH ROW
EXECUTE FUNCTION public.check_visit_rate_limit();

CREATE UNIQUE INDEX IF NOT EXISTS site_visits_one_device_per_day_idx
ON public.site_visits (visitor_id, visit_day);