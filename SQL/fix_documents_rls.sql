-- Enable RLS
ALTER TABLE public.documentos_comunales ENABLE ROW LEVEL SECURITY;

-- Policy to allow viewing documents from your own community
CREATE POLICY "Users can view documents from their community"
ON public.documentos_comunales
FOR SELECT
USING (
    comunidad_id IN (
        SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()
    )
);

-- Just in case, grant permissions (sometimes needed if public/anon roles are weird)
GRANT SELECT ON public.documentos_comunales TO authenticated;
GRANT SELECT ON public.documentos_comunales TO anon;
