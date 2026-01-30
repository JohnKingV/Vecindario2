-- SCRIPT: add_unread_messages.sql
-- Objetivo: Añadir soporte para seguimiento de mensajes no leídos.

-- 1. Añadir columna is_read a la tabla messages
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_read') THEN
        ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Crear una función para contar mensajes no leídos por conversación y usuario
-- (Opcional, pero ayuda a simplificar consultas complejas si se desea usar RPC)
CREATE OR REPLACE FUNCTION get_unread_count(conv_id UUID, current_user_id UUID)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT count(*)
        FROM public.messages
        WHERE conversation_id = conv_id
        AND sender_id != current_user_id
        AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- 3. OPCIONAL: Marcar todos los mensajes actuales como LEÍDOS 
-- (Ejecuta esto solo una vez si quieres empezar el contador desde cero)
-- UPDATE public.messages SET is_read = TRUE;
