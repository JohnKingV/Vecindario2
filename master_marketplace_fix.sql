-- 1. Asegurar que existe la columna comprador_id
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS comprador_id UUID REFERENCES public.profiles(id);

-- 2. Asegurar que existe la columna updated_at (buena práctica)
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Crear índice para comprador_id
CREATE INDEX IF NOT EXISTS items_comprador_id_idx ON public.items(comprador_id);

-- 4. Corregir la función RPC (ahora actualizando updated_at que sabemos que existe)
CREATE OR REPLACE FUNCTION public.mark_item_as_sold(p_item_id UUID, p_user_id UUID, p_comprador_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    UPDATE public.items
    SET
        vendido = true,
        comprador_id = p_comprador_id,
        updated_at = NOW() -- Ahora sí podemos actualizar esto
    WHERE id = p_item_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo marcar como vendido: artículo no encontrado o no eres el dueño.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
