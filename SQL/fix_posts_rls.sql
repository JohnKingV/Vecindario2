-- ==========================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA POSTS (NOVEDADES)
-- Ejecuta este script en el Editor SQL de Supabase
-- ==========================================

-- 1. Limpiar todas las políticas antiguas de la tabla posts para evitar conflictos
DROP POLICY IF EXISTS "Usuarios pueden ver posts de su comunidad" ON public.posts;
DROP POLICY IF EXISTS "Usuarios pueden crear posts en su comunidad" ON public.posts;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios posts" ON public.posts;
DROP POLICY IF EXISTS "gestionar_post_owner_or_admin" ON public.posts;
DROP POLICY IF EXISTS "ver_posts_comunidad" ON public.posts;
DROP POLICY IF EXISTS "crear_posts_comunidad" ON public.posts;
DROP POLICY IF EXISTS "gestionar_posts_owner_or_admin" ON public.posts;

-- 2. Asegurar que RLS está habilitado
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. Política de LECTURA (SELECT)
-- Permite que los usuarios vean posts si pertenecen a la misma comunidad
CREATE POLICY "ver_posts_comunidad"
ON public.posts FOR SELECT
TO authenticated
USING (
  comunidad_id IN (
    SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- 4. Política de INSERCIÓN (INSERT)
-- Permite crear posts solo con su propio user_id y en su comunidad
CREATE POLICY "crear_posts_comunidad"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  comunidad_id IN (
    SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- 5. Política de GESTIÓN TOTAL (UPDATE / DELETE)
-- Esta es la política que faltaba o estaba incompleta.
-- Permite al DUEÑO del post o al ADMINISTRADOR editar o borrar.
CREATE POLICY "gestionar_posts_owner_or_admin"
ON public.posts FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  user_id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Confirmación visual en la consola de Supabase
SELECT 'Políticas de Posts (Novedades) actualizadas correctamente. Ya puedes editar y borrar.' as mensaje;
