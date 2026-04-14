
-- Create portfolio_media table for multiple files per project
CREATE TABLE public.portfolio_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view portfolio media"
ON public.portfolio_media FOR SELECT
USING (true);

-- Admins can insert
CREATE POLICY "Admins can insert portfolio media"
ON public.portfolio_media FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update portfolio media"
ON public.portfolio_media FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete portfolio media"
ON public.portfolio_media FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for fast lookups
CREATE INDEX idx_portfolio_media_project_id ON public.portfolio_media(project_id);
