-- AGREGAR COLUMNA IS_EDITED A LA TABLA MESSAGES
-- Ejecuta esto en el Editor SQL de Supabase para habilitar la marca de mensajes editados

-- 1. Agregar la columna si no existe
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- 2. (Opcional) Si quieres rastrear cuándo fue la última edición
-- ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

COMMENT ON COLUMN public.messages.is_edited IS 'Indica si el mensaje ha sido modificado por el autor después de enviarse';

SELECT 'Columna is_edited agregada exitosamente' as resultado;
