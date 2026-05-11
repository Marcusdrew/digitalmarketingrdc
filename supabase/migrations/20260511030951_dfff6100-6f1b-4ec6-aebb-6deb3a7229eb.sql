ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS country_code text;