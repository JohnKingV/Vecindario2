-- SQL: add_comment_like_notifications.sql
-- Objetivo: Añadir notificaciones para cuando alguien le da like a un comentario

-- 1. Actualizar la función de interacción para incluir likes en comentarios
CREATE OR REPLACE FUNCTION notify_interaction() 
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    sender_name TEXT;
    content_title TEXT;
    parent_post_id UUID;
BEGIN
    -- Obtener nombre del que realiza la acción
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.user_id;

    -- Caso: COMENTARIOS en Posts
    IF (TG_TABLE_NAME = 'comentarios') THEN
        SELECT user_id, titulo INTO target_user_id, content_title FROM posts WHERE id = NEW.post_id;
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (
                target_user_id, 
                'comment', 
                'Nuevo comentario', 
                sender_name || ' comentó tu publicación: "' || LEFT(content_title, 30) || '"',
                jsonb_build_object('post_id', NEW.post_id, 'from_user_id', NEW.user_id)
            );
        END IF;

    -- Caso: LIKES en Posts
    ELSIF (TG_TABLE_NAME = 'post_likes') THEN
        SELECT user_id, titulo INTO target_user_id, content_title FROM posts WHERE id = NEW.post_id;
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (
                target_user_id, 
                'like', 
                '¡Le gusta tu post!', 
                sender_name || ' le dio me gusta a tu publicación.',
                jsonb_build_object('post_id', NEW.post_id, 'from_user_id', NEW.user_id)
            );
        END IF;

    -- Caso: LIKES en Marketplace (Favoritos)
    ELSIF (TG_TABLE_NAME = 'item_likes') THEN
        SELECT user_id, titulo INTO target_user_id, content_title FROM items WHERE id = NEW.item_id;
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (
                target_user_id, 
                'item_like', 
                'Interés en tu artículo', 
                sender_name || ' marcó como favorito tu artículo: ' || content_title,
                jsonb_build_object('item_id', NEW.item_id, 'from_user_id', NEW.user_id)
            );
        END IF;

    -- Caso: LIKES en Comentarios (NUEVO)
    ELSIF (TG_TABLE_NAME = 'comentario_likes') THEN
        -- Obtener el dueño del comentario y el post_id para navegación
        SELECT user_id, post_id INTO target_user_id, parent_post_id FROM comentarios WHERE id = NEW.comentario_id;
        
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (
                target_user_id, 
                'comment_like', 
                '¡Les gusta tu comentario!', 
                sender_name || ' le dio me gusta a tu comentario.',
                jsonb_build_object(
                    'post_id', parent_post_id, 
                    'comment_id', NEW.comentario_id,
                    'from_user_id', NEW.user_id
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Asegurar el Trigger para comentario_likes
DROP TRIGGER IF EXISTS tr_notify_comment_like ON comentario_likes;
CREATE TRIGGER tr_notify_comment_like 
AFTER INSERT ON comentario_likes 
FOR EACH ROW EXECUTE FUNCTION notify_interaction();
