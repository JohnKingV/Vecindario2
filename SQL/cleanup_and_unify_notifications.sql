-- SQL: cleanup_and_unify_notifications.sql
-- Objetivo: Eliminar disparadores duplicados y dejar una lógica limpia.

-- 1. ELIMINAR TODOS LOS DISPARADORES ANTIGUOS (Limpieza total)
DROP TRIGGER IF EXISTS tr_notify_new_post ON posts;
DROP TRIGGER IF EXISTS tr_notify_new_item ON items;
DROP TRIGGER IF EXISTS tr_notify_comment ON comentarios;
DROP TRIGGER IF EXISTS tr_notify_like ON post_likes; -- De repair_schema.sql
DROP TRIGGER IF EXISTS tr_notify_post_like ON post_likes; -- De setup_interaction_notifications.sql
DROP TRIGGER IF EXISTS tr_notify_item_like ON item_likes;
DROP TRIGGER IF EXISTS tr_notify_chat ON mensajes;

-- 2. FUNCIÓN UNIFICADA PARA ACTIVIDAD DE COMUNIDAD (Posts y Ventas)
CREATE OR REPLACE FUNCTION notify_community_activity() 
RETURNS TRIGGER AS $$
DECLARE
    neighbor_id UUID;
    sender_name TEXT;
    notif_title TEXT;
    notif_message TEXT;
    notif_type TEXT;
BEGIN
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.user_id;

    IF (TG_TABLE_NAME = 'posts') THEN
        notif_type := 'post';
        notif_title := 'Nueva publicación';
        notif_message := sender_name || ' publicó: ' || LEFT(NEW.contenido, 50);
    ELSIF (TG_TABLE_NAME = 'items') THEN
        notif_type := 'item';
        notif_title := 'Nuevo artículo en venta';
        notif_message := sender_name || ' vende: ' || NEW.titulo;
    END IF;

    FOR neighbor_id IN 
        SELECT id FROM profiles 
        WHERE comunidad_id = NEW.comunidad_id AND id != NEW.user_id
    LOOP
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (neighbor_id, notif_type, notif_title, notif_message, jsonb_build_object('id', NEW.id, 'from_user_id', NEW.user_id));
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCIÓN UNIFICADA PARA INTERACCIONES (Likes y Comentarios)
CREATE OR REPLACE FUNCTION notify_interaction() 
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    sender_name TEXT;
    content_title TEXT;
BEGIN
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.user_id;

    IF (TG_TABLE_NAME = 'comentarios') THEN
        SELECT user_id, titulo INTO target_user_id, content_title FROM posts WHERE id = NEW.post_id;
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (target_user_id, 'comment', 'Nuevo comentario', sender_name || ' comentó tu publicación.', jsonb_build_object('post_id', NEW.post_id, 'from_user_id', NEW.user_id));
        END IF;
    ELSIF (TG_TABLE_NAME = 'post_likes') THEN
        SELECT user_id INTO target_user_id FROM posts WHERE id = NEW.post_id;
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (target_user_id, 'like', '¡Le gusta tu post!', sender_name || ' le dio me gusta a tu publicación.', jsonb_build_object('post_id', NEW.post_id, 'from_user_id', NEW.user_id));
        END IF;
    ELSIF (TG_TABLE_NAME = 'item_likes') THEN
        SELECT user_id, titulo INTO target_user_id, content_title FROM items WHERE id = NEW.item_id;
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (target_user_id, 'item_like', 'Interés en tu artículo', sender_name || ' marcó como favorito: ' || content_title, jsonb_build_object('item_id', NEW.item_id, 'from_user_id', NEW.user_id));
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. FUNCIÓN UNIFICADA PARA CHAT (Mensajes)
CREATE OR REPLACE FUNCTION notify_chat_message() 
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    recipient_id UUID;
BEGIN
    -- Obtener nombre del remitente
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.sender_id;

    -- Obtener el ID del destinatario de la conversación
    SELECT user_id INTO recipient_id 
    FROM conversation_members 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id 
    LIMIT 1;

    IF (recipient_id IS NOT NULL) THEN
        INSERT INTO notifications (user_id, type, title, message, data)
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

-- 5. CREAR DISPARADORES NUEVOS (Sin duplicados)
CREATE TRIGGER tr_notify_new_post AFTER INSERT ON posts FOR EACH ROW EXECUTE FUNCTION notify_community_activity();
CREATE TRIGGER tr_notify_new_item AFTER INSERT ON items FOR EACH ROW EXECUTE FUNCTION notify_community_activity();
CREATE TRIGGER tr_notify_comment AFTER INSERT ON comentarios FOR EACH ROW EXECUTE FUNCTION notify_interaction();
CREATE TRIGGER tr_notify_post_like AFTER INSERT ON post_likes FOR EACH ROW EXECUTE FUNCTION notify_interaction();
CREATE TRIGGER tr_notify_item_like AFTER INSERT ON item_likes FOR EACH ROW EXECUTE FUNCTION notify_interaction();
CREATE TRIGGER tr_notify_chat AFTER INSERT ON mensajes FOR EACH ROW EXECUTE FUNCTION notify_chat_message();
