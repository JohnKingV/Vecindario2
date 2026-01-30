-- ==========================================
-- SCRIPT DE CORRECCIÓN PARA MARKETPLACE (ITEMS)
-- Ejecuta este script en el Editor SQL de Supabase
-- ==========================================

-- 1. Limpiar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Usuarios pueden ver items de su comunidad" ON items;
DROP POLICY IF EXISTS "Usuarios pueden crear items en su comunidad" ON items;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus propios items" ON items;
DROP POLICY IF EXISTS "ver_items_comunidad" ON items;
DROP POLICY IF EXISTS "crear_items_comunidad" ON items;
DROP POLICY IF EXISTS "gestionar_propio_item" ON items;

-- 2. Asegurar que RLS está activo
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 3. Crear política de LECTURA (SELECT)
-- Permite ver items solo si pertenecen a mi comunidad
CREATE POLICY "ver_items_comunidad"
ON items FOR SELECT
USING (
  comunidad_id = (SELECT get_auth_user_comunidad())
);

-- 4. Crear política de CREACIÓN (INSERT)
-- Permite crear items solo si coinciden con mi ID y mi comunidad
CREATE POLICY "crear_items_comunidad"
ON items FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  comunidad_id = (SELECT get_auth_user_comunidad())
);

-- 5. Crear política de GESTIÓN (UPDATE/DELETE)
-- Permite borrar/editar solo mis propios items
CREATE POLICY "gestionar_propio_item"
ON items FOR ALL
USING (
  user_id = auth.uid()
);

-- Confirmación visual
SELECT 'Políticas de Marketplace actualizadas correctamente' as mensaje;
