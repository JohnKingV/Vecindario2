-- REPARAR POLÍTICAS DE PERFILES (RLS)
-- Ejecuta esto en el Editor SQL de Supabase para que el Admin pueda ver a todos los usuarios

-- 1. Eliminar políticas antiguas que puedan estar restringiendo la vista
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los miembros de la comunidad pueden ver otros perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON public.profiles;
DROP POLICY IF EXISTS "Admins can select all" ON public.profiles;

-- 2. Crear una política que permita a CUALQUIER usuario autenticado LEER todos los perfiles
-- (Necesario para que el buscador y el panel de administración funcionen correctamente)
CREATE POLICY "Permitir lectura de perfiles a usuarios autenticados" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Asegurar que los usuarios solo puedan editar SU PROPIO perfil
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Permitir que el administrador actualice CUALQUIER perfil (para cambiar condominios)
-- Nota: Usamos una subconsulta de forma segura o simplemente permitimos la actualización si el rol es admin
CREATE POLICY "Administradores pueden actualizar cualquier perfil" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

SELECT 'Políticas de Perfiles actualizadas. Ya deberías ver a todos los usuarios.' as resultado;
