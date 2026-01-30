-- SCRIPT: setup_notifications.sql
-- Objetivo: Implementar notificaciones automáticas para toda la actividad del condominio.

-- 1. Crear tabla de notificaciones si no existe
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'post', 'item', 'comment', 'like', 'chat'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- { post_id: uuid, from_user_id: uuid, type: string }
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar RLS para la tabla de notificaciones
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias notificaciones
DO $$ BEGIN
    CREATE POLICY "Users can view own notifications"
      ON public.notifications FOR SELECT
      USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Política: Los usuarios pueden actualizar sus propias notificaciones (marcar como leídas)
DO $$ BEGIN
    CREATE POLICY "Users can update own notifications"
      ON public.notifications FOR UPDATE
      USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Función genérica para notificar a toda la comunidad
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
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.user_id;
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

    -- Insertar notificación para cada vecino del mismo condominio (excepto el autor)
    FOR neighbor_id IN 
        SELECT id FROM profiles 
        WHERE comunidad_id = condo_id AND id != NEW.user_id
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

-- 3. Triggers para nuevas publicaciones y ventas
DROP TRIGGER IF EXISTS tr_notify_new_post ON posts;
CREATE TRIGGER tr_notify_new_post
AFTER INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION notify_community_activity();

DROP TRIGGER IF EXISTS tr_notify_new_item ON items;
CREATE TRIGGER tr_notify_new_item
AFTER INSERT ON items
FOR EACH ROW EXECUTE FUNCTION notify_community_activity();

-- 4. Función para notificar interacciones (Likes y Comentarios)
CREATE OR REPLACE FUNCTION notify_interaction() 
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    sender_name TEXT;
    notif_title TEXT;
    notif_message TEXT;
    content_name TEXT;
BEGIN
    -- Obtener nombre del que realiza la acción
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.user_id;

    -- Definir contenido y destinatario según la interacción
    IF (TG_TABLE_NAME = 'comentarios') THEN
        -- Obtener autor del post
        SELECT user_id, titulo INTO target_user_id, content_name FROM posts WHERE id = NEW.post_id;
        IF (target_user_id != NEW.user_id) THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (
                target_user_id, 
                'comment', 
                'Nuevo comentario', 
                sender_name || ' comentó tu publicación: ' || LEFT(NEW.contenido, 30),
                jsonb_build_object('post_id', NEW.post_id, 'from_user_id', NEW.user_id)
            );
        END IF;
    ELSIF (TG_TABLE_NAME = 'post_likes') THEN
        -- Obtener autor del post
        SELECT user_id INTO target_user_id FROM posts WHERE id = NEW.post_id;
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
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para interacciones
DROP TRIGGER IF EXISTS tr_notify_comment ON comentarios;
CREATE TRIGGER tr_notify_comment
AFTER INSERT ON comentarios
FOR EACH ROW EXECUTE FUNCTION notify_interaction();

-- Nota: Asumimos que la tabla post_likes existe y tiene estructura simple
-- Si no existe, se puede omitir o ajustar.

-- 5. Notificación de Chat
CREATE OR REPLACE FUNCTION notify_chat_message() 
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.from_user_id;

    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
        NEW.to_user_id, 
        'chat', 
        'Nuevo mensaje', 
        sender_name || ': ' || LEFT(NEW.mensaje, 50),
        jsonb_build_object('from_user_id', NEW.from_user_id)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_notify_chat ON mensajes;
CREATE TRIGGER tr_notify_chat
AFTER INSERT ON mensajes
FOR EACH ROW EXECUTE FUNCTION notify_chat_message();
