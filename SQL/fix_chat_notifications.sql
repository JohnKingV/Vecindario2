-- SCRIPT: fix_chat_notifications.sql
-- Objetivo: Corregir el trigger de notificaciones para mensajes de chat.

-- 1. Asegurar que el tipo 'chat' sea procesable por la UI
-- (No requiere cambios en tabla, solo lógica de trigger)

-- 2. Función para notificar mensajes de chat
CREATE OR REPLACE FUNCTION public.notify_chat_message() 
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    recipient_id UUID;
BEGIN
    -- Obtener el nombre del remitente
    SELECT nombre INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

    -- Obtener el ID del destinatario buscando en los miembros de la conversación
    -- (el miembro que NO sea el remitente)
    SELECT user_id INTO recipient_id 
    FROM public.conversation_members 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
    LIMIT 1;

    -- Si encontramos destinatario, insertar notificación
    IF recipient_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, data)
        VALUES (
            recipient_id, 
            'chat', 
            'Nuevo mensaje', 
            sender_name || ': ' || LEFT(NEW.content, 50),
            jsonb_build_object('conversation_id', NEW.conversation_id, 'from_user_id', NEW.sender_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear el trigger sobre la tabla correcta: 'messages'
-- NOTA: Si tu tabla se llama 'mensajes', cambia el nombre aquí abajo.
DROP TRIGGER IF EXISTS tr_notify_chat ON public.messages;
CREATE TRIGGER tr_notify_chat
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_chat_message();
