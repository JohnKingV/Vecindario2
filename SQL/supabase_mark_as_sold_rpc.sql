-- Función para marcar como vendido y actualizar estadísticas del usuario
CREATE OR REPLACE FUNCTION mark_item_as_sold(p_item_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 1. Marcar el item como vendido
  UPDATE items 
  SET vendido = true 
  WHERE id = p_item_id AND user_id = p_user_id;

  -- 2. Incrementar contador de ventas exitosas en el perfil
  -- 3. Aumentar ligeramente la reputación (0.1 por venta, tope 5.0)
  UPDATE profiles 
  SET 
    ventas_exitosas = COALESCE(ventas_exitosas, 0) + 1,
    raiting_ventas = LEAST(5.0, COALESCE(raiting_ventas, 0.0) + 0.1)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
