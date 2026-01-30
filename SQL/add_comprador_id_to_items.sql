-- 1. Añadir columna comprador_id a la tabla de items
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS comprador_id UUID REFERENCES public.profiles(id);

-- 2. Crear índice para mejorar el rendimiento de la búsqueda por comprador
CREATE INDEX IF NOT EXISTS items_comprador_id_idx ON public.items(comprador_id);

-- 3. Actualizar o crear función RPC para marcar como vendido con comprador
-- Esta función ahora acepta un p_comprador_id opcional
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
