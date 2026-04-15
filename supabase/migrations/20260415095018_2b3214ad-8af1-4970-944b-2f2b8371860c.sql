
-- Add length constraints on text columns
ALTER TABLE public.site_visits
  ADD CONSTRAINT site_visits_ua_length CHECK (char_length(user_agent) <= 1000),
  ADD CONSTRAINT site_visits_referrer_length CHECK (char_length(referrer) <= 2000),
  ADD CONSTRAINT site_visits_visitor_id_format CHECK (visitor_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
  ADD CONSTRAINT site_visits_page_length CHECK (char_length(page) <= 500);

-- Rate-limit trigger: max 1 visit per visitor_id per day
CREATE OR REPLACE FUNCTION public.check_visit_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.visitor_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.site_visits
    WHERE visitor_id = NEW.visitor_id
      AND created_at >= date_trunc('day', now())
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
