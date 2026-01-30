-- SCRIPT: production_final_schema.sql
-- Objetivo: Consolidar todas las mejoras de esquema y notificaciones para el lanzamiento.

-- 1. ESTRUCTURA BASE (Reparaciones y Tablas de Soporte)
-- ---------------------------------------------------

-- Posts: Actualizar check de tipos
DO $$ 
BEGIN 
    ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_tipo_check;
    ALTER TABLE public.posts ADD CONSTRAINT posts_tipo_check CHECK (tipo IN ('aviso', 'alerta', 'venta', 'pregunta', 'evento'));
END $$;

-- Items (Marketplace): Asegurar columnas categoria y estado
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='categoria') THEN
        ALTER TABLE public.items ADD COLUMN categoria TEXT DEFAULT 'Otros';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='estado') THEN
        ALTER TABLE public.items ADD COLUMN estado TEXT DEFAULT 'nuevo';
    END IF;
END $$;

-- Comentarios: Sincronizar columna 'contenido'
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comentarios' AND column_name='texto') THEN
        ALTER TABLE public.comentarios RENAME COLUMN texto TO contenido;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comentarios' AND column_name='contenido') THEN
        ALTER TABLE public.comentarios ADD COLUMN contenido TEXT DEFAULT '';
    END IF;
END $$;

-- Tablas de Likes (Item y Post)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.item_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(item_id, user_id)
);

-- Mensajes: Añadir soporte para estado de lectura
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_read') THEN
        ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. SISTEMA DE NOTIFICACIONES (Tabla y RLS)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuarios ven sus propias notificaciones') THEN
        CREATE POLICY "Usuarios ven sus propias notificaciones" ON notifications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sistema puede insertar notificaciones') THEN
        CREATE POLICY "Sistema puede insertar notificaciones" ON notifications FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuarios pueden actualizar sus notificaciones') THEN
        CREATE POLICY "Usuarios pueden actualizar sus notificaciones" ON notifications FOR UPDATE USING (auth.uid() = user_id);
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. FUNCIONES Y TRIGGERS (Automatización)
-- ---------------------------------------

-- Función: Notificar actividad de comunidad (Post/Item)
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
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.user_id;
    condo_id := NEW.comunidad_id;

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
        WHERE comunidad_id = condo_id AND id != NEW.user_id
    LOOP
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (neighbor_id, notif_type, notif_title, notif_message, jsonb_build_object('id', NEW.id, 'from_user_id', NEW.user_id));
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: Notificar interacciones (Likes/Comments)
CREATE OR REPLACE FUNCTION notify_interaction() 
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    sender_name TEXT;
BEGIN
    SELECT nombre INTO sender_name FROM profiles WHERE id = NEW.user_id;
    IF (TG_TABLE_NAME = 'comentarios') THEN
        SELECT user_id INTO target_user_id FROM posts WHERE id = NEW.post_id;
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
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: Notificar Chat
CREATE OR REPLACE FUNCTION public.notify_chat_message() 
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    recipient_id UUID;
BEGIN
    SELECT nombre INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    SELECT user_id INTO recipient_id FROM public.conversation_members 
    WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id LIMIT 1;

    IF recipient_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, data)
        VALUES (recipient_id, 'chat', 'Nuevo mensaje', sender_name || ': ' || LEFT(NEW.content, 50), jsonb_build_object('conversation_id', NEW.conversation_id, 'from_user_id', NEW.sender_id));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREACIÓN DE TRIGGERS
DROP TRIGGER IF EXISTS tr_notify_new_post ON posts;
CREATE TRIGGER tr_notify_new_post AFTER INSERT ON posts FOR EACH ROW EXECUTE FUNCTION notify_community_activity();

DROP TRIGGER IF EXISTS tr_notify_new_item ON items;
CREATE TRIGGER tr_notify_new_item AFTER INSERT ON items FOR EACH ROW EXECUTE FUNCTION notify_community_activity();

DROP TRIGGER IF EXISTS tr_notify_comment ON comentarios;
CREATE TRIGGER tr_notify_comment AFTER INSERT ON comentarios FOR EACH ROW EXECUTE FUNCTION notify_interaction();

DROP TRIGGER IF EXISTS tr_notify_like ON post_likes;
CREATE TRIGGER tr_notify_like AFTER INSERT ON post_likes FOR EACH ROW EXECUTE FUNCTION notify_interaction();

DROP TRIGGER IF EXISTS tr_notify_chat ON public.messages;
CREATE TRIGGER tr_notify_chat AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_chat_message();
