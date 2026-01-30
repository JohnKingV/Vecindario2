-- SQL: fix_self_notifications_unified.sql
-- Objetivo: Eliminar notificaciones a uno mismo y limpiar triggers duplicados

-- 1. FUNCIÓN UNIFICADA PARA ACTIVIDAD COMUNITARIA (Posts e Items)
CREATE OR REPLACE FUNCTION notify_community_activity() 
RETURNS TRIGGER AS $$
DECLARE
    neighbor_id UUID;
    sender_name TEXT;
    notif_title TEXT;
    notif_message TEXT;
    notif_type TEXT;
    condo_id UUID;
BEGIN
    -- Obtener nombre del que realiza la acción
    SELECT COALESCE(nombre, 'Un vecino') INTO sender_name FROM profiles WHERE id = NEW.user_id;
    condo_id := NEW.comunidad_id;

    -- Definir contenido según la tabla
    IF (TG_TABLE_NAME = 'posts') THEN
        notif_type := 'post';
        notif_title := 'Nueva publicación';
        notif_message := sender_name || ' publicó: ' || LEFT(NEW.contenido, 50);
    ELSIF (TG_TABLE_NAME = 'items') THEN
        notif_type := 'item';
        notif_title := 'Nuevo artículo en venta';
        notif_message := sender_name || ' vende: ' || NEW.titulo;
    END IF;

    -- INSERTAR SOLO PARA VECINOS, EXCLUYENDO AL AUTOR (NEW.user_id)
    FOR neighbor_id IN 
        SELECT id FROM profiles 
        WHERE comunidad_id = condo_id 
        AND id != NEW.user_id -- FILTRO CRÍTICO: NO NOTIFICAR AL AUTOR
    LOOP
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            neighbor_id, 
            notif_type, 
            notif_title, 
            notif_message, 
            jsonb_build_object('id', NEW.id, 'from_user_id', NEW.user_id)
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. FUNCIÓN UNIFICADA PARA CHAT (Mensajes)
CREATE OR REPLACE FUNCTION public.notify_chat_message() 
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    recipient_id UUID;
    v_sender_id UUID;
    v_content TEXT;
BEGIN
    -- Detectar nombres de columnas según la tabla (mensajes vs messages)
    IF (TG_TABLE_NAME = 'messages') THEN
        v_sender_id := NEW.sender_id;
        v_content := NEW.content;
    ELSE
        v_sender_id := NEW.sender_id; -- Asumimos sender_id es el estándar actual
        v_content := NEW.contenido;
    END IF;

    -- Obtener el nombre del remitente
    SELECT COALESCE(nombre, 'Alguien') INTO sender_name FROM public.profiles WHERE id = v_sender_id;

    -- Buscar destinatario en la conversación (que NO sea el remitente)
    SELECT user_id INTO recipient_id 
    FROM public.conversation_members 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != v_sender_id -- FILTRO CRÍTICO: NO NOTIFICAR AL QUE ENVÍA
    LIMIT 1;

    IF recipient_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, data)
        VALUES (
            recipient_id, 
            'chat', 
            'Nuevo mensaje', 
            sender_name || ': ' || LEFT(v_content, 50),
            jsonb_build_object('conversation_id', NEW.conversation_id, 'from_user_id', v_sender_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. LIMPIEZA DE TRIGGERS DUPLICADOS (posts e items)
DROP TRIGGER IF EXISTS tr_notify_new_post ON posts;
CREATE TRIGGER tr_notify_new_post AFTER INSERT ON posts FOR EACH ROW EXECUTE FUNCTION notify_community_activity();

DROP TRIGGER IF EXISTS tr_notify_new_item ON items;
CREATE TRIGGER tr_notify_new_item AFTER INSERT ON items FOR EACH ROW EXECUTE FUNCTION notify_community_activity();

-- 4. LIMPIEZA DE TRIGGERS DE CHAT (mensajes y messages)
DROP TRIGGER IF EXISTS tr_notify_chat ON public.messages;
DROP TRIGGER IF EXISTS tr_notify_chat ON public.mensajes;

-- Activar solo en la tabla que se esté usando (probablemente 'messages')
-- Si usas 'mensajes', el trigger se creará ahí también por seguridad.
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'messages') THEN
        CREATE TRIGGER tr_notify_chat AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_chat_message();
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'mensajes') THEN
        CREATE TRIGGER tr_notify_chat AFTER INSERT ON public.mensajes FOR EACH ROW EXECUTE FUNCTION public.notify_chat_message();
    END IF;
END $$;
