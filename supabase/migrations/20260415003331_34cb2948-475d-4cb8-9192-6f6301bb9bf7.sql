
CREATE TABLE public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a visit (anonymous tracking)
CREATE POLICY "Anyone can log a visit"
ON public.site_visits FOR INSERT
WITH CHECK (true);

-- Only admins can read visits
CREATE POLICY "Admins can view visits"
ON public.site_visits FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_site_visits_created_at ON public.site_visits(created_at);
