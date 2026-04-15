-- Fix 1: Replace permissive storage policies with admin-only versions
DROP POLICY IF EXISTS "Authenticated users can upload portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio media" ON storage.objects;

CREATE POLICY "Admins can upload portfolio media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update portfolio media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete portfolio media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'::app_role));