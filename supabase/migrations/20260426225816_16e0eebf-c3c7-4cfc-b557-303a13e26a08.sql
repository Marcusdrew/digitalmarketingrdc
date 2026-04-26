DROP POLICY IF EXISTS "Anyone can log a visit" ON public.site_visits;

CREATE POLICY "Anyone can log a valid visit"
ON public.site_visits
FOR INSERT
TO public
WITH CHECK (
  visitor_id IS NOT NULL
  AND length(trim(visitor_id)) >= 12
  AND length(trim(visitor_id)) <= 128
  AND page IS NOT NULL
  AND page LIKE '/%'
);