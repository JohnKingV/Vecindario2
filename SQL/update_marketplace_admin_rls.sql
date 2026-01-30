-- ACTUALIZAR POLÍTICAS DE MARKETPLACE PARA ADMINS
-- Ejecuta esto en el Editor SQL de Supabase para permitir que los admins gestionen todos los items

-- 1. Eliminar política restrictiva
DROP POLICY IF EXISTS "gestionar_propio_item" ON items;

-- 2. Crear nueva política que permite al dueño Y al admin gestionar el item
CREATE POLICY "gestionar_item_owner_or_admin"
ON items FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

SELECT 'Políticas de Marketplace actualizadas para permitir acceso administrativo.' as resultado;
