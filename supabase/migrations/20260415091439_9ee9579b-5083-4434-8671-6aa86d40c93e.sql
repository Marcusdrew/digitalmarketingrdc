ALTER TABLE public.site_visits ADD COLUMN visitor_id text;
CREATE INDEX idx_site_visits_visitor_id ON public.site_visits(visitor_id);