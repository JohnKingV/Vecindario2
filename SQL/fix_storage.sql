-- SCRIPT PARA CONFIGURAR STORAGE BUCKETS Y POLÍTICAS
-- Ejecuta esto en el Editor SQL de Supabase

-- 1. Asegurar que los buckets existen y son públicos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('items', 'items', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Limpiar políticas antiguas para evitar duplicados
-- Avatars
DROP POLICY IF EXISTS "Cualquiera puede ver avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir su avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden borrar su avatar" ON storage.objects;

-- Posts
DROP POLICY IF EXISTS "Cualquiera puede ver posts images" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir imagenes de posts" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden borrar sus imagenes de posts" ON storage.objects;

-- Items
DROP POLICY IF EXISTS "Cualquiera puede ver items images" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir imagenes de items" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden borrar sus imagenes de items" ON storage.objects;

-- 3. Crear nuevas políticas

-- SELECT (Público)
CREATE POLICY "Acceso público lectura avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Acceso público lectura posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Acceso público lectura items" ON storage.objects FOR SELECT USING (bucket_id = 'items');

-- INSERT (Autenticados, en su propia carpeta)
CREATE POLICY "Usuarios pueden subir su avatar" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios pueden subir imagenes de posts" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios pueden subir imagenes de items" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'items' AND auth.uid()::text = (storage.foldername(name))[1]);

-- UPDATE/DELETE (Dueños)
CREATE POLICY "Usuarios pueden actualizar su avatar" ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios pueden borrar su avatar" ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios pueden gestionar sus imagenes de posts" ON storage.objects FOR ALL
USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios pueden gestionar sus imagenes de items" ON storage.objects FOR ALL
USING (bucket_id = 'items' AND auth.uid()::text = (storage.foldername(name))[1]);

SELECT 'Script de Storage ejecutado con éxito' as resultado;
