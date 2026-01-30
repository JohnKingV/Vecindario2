-- REPARAR POLÍTICAS DE STORAGE (RLS)
-- Ejecuta esto en el Editor SQL de Supabase para solucionar el error "new row violates row-level security policy"

-- 1. Asegurar que los buckets existen
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true), ('posts', 'posts', true), ('items', 'items', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar todas las políticas existentes para empezar de cero
DROP POLICY IF EXISTS "Acceso público lectura avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir su avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden borrar su avatar" ON storage.objects;
DROP POLICY IF EXISTS "Acceso público lectura posts" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir imagenes de posts" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus imagenes de posts" ON storage.objects;
DROP POLICY IF EXISTS "Acceso público lectura items" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir imagenes de items" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus imagenes de items" ON storage.objects;

-- 3. Crear Políticas Robustas usando el campo 'owner'

-- LECTURA PÚBLICA
CREATE POLICY "Lectura pública para avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Lectura pública para posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Lectura pública para items" ON storage.objects FOR SELECT USING (bucket_id = 'items');

-- INSERCIÓN (Para nuevos archivos)
CREATE POLICY "Usuarios pueden subir archivos" ON storage.objects FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    (bucket_id = 'avatars' OR bucket_id = 'posts' OR bucket_id = 'items')
);

-- ACTUALIZACIÓN (Para upsert)
CREATE POLICY "Usuarios pueden actualizar sus propios archivos" ON storage.objects FOR UPDATE
USING (auth.uid() = owner) 
WITH CHECK (auth.uid() = owner);

-- ELIMINACIÓN
CREATE POLICY "Usuarios pueden borrar sus propios archivos" ON storage.objects FOR DELETE
USING (auth.uid() = owner);

-- 4. Ajuste adicional para la carpeta por usuario (opcional pero recomendado con foldername)
-- Si prefieres restringir la carpeta, usa esta versión para INSERT:
-- DROP POLICY IF EXISTS "Usuarios pueden subir archivos" ON storage.objects;
-- CREATE POLICY "Usuarios pueden subir su avatar en su carpeta" ON storage.objects FOR INSERT 
-- WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

SELECT 'Políticas de Storage reparadas con éxito' as resultado;
