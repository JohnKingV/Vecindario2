-- PERMITIR QUE LOS ADMINISTRADORES ELIMINEN PERFILES
-- Ejecuta esto en el Editor SQL de Supabase para activar la función de eliminación

DROP POLICY IF EXISTS "Administradores pueden eliminar cualquier perfil" ON public.profiles;

CREATE POLICY "Administradores pueden eliminar cualquier perfil" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Verificar que se aplicó la política
SELECT 'Política de eliminación habilitada para administradores' as resultado;
