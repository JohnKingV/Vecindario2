-- CORRECCIÓN: Eliminar referencia a updated_at que no existe en la tabla items
CREATE OR REPLACE FUNCTION public.mark_item_as_sold(p_item_id UUID, p_user_id UUID, p_comprador_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    UPDATE public.items
    SET 
        vendido = true,
        comprador_id = p_comprador_id
    WHERE id = p_item_id AND user_id = p_user_id;

    -- Si la actualización no afectó a ninguna fila, lanzar error
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo marcar como vendido: artículo no encontrado o no eres el dueño.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
