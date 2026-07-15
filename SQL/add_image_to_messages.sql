-- Add image_url column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.messages.image_url IS 'URL de la imagen enviada en el chat';

-- Asegurar que el bucket de chat exista
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat', 'chat', true) 
ON CONFLICT (id) DO NOTHING;

-- POLÍTICAS DE SEGURIDAD PARA EL BUCKET 'chat'

-- 1. Permitir que cualquier usuario autenticado vea las imágenes del chat
CREATE POLICY "Cualquiera puede ver imágenes de chat"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat');

-- 2. Permitir que usuarios autenticados suban sus propias fotos
-- Nota: La lógica de la app usa el ID del usuario como carpeta
CREATE POLICY "Usuarios pueden subir fotos de chat"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat');

-- 3. Permitir que los usuarios borren sus propias fotos si fuera necesario
CREATE POLICY "Usuarios pueden borrar sus fotos de chat"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat' AND (storage.foldername(name))[1] = auth.uid()::text);
