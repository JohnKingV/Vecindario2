-- SQL: setup_marketplace_comments.sql
-- Objetivo: Añadir comentarios a los artículos del Marketplace

-- 1. Crear tabla de comentarios para items
CREATE TABLE IF NOT EXISTS public.item_comentarios (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.item_comentarios ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de seguridad
DROP POLICY IF EXISTS "Cualquiera puede ver comentarios de items" ON public.item_comentarios;
CREATE POLICY "Cualquiera puede ver comentarios de items" 
ON public.item_comentarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden comentar en items" ON public.item_comentarios;
CREATE POLICY "Usuarios pueden comentar en items" 
ON public.item_comentarios FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Opcional: Notificaciones para comentarios en Marketplace
-- (Esto asume que ya tienes la función notify_interaction() definida)
DROP TRIGGER IF EXISTS tr_notify_item_comment ON item_comentarios;
CREATE TRIGGER tr_notify_item_comment 
AFTER INSERT ON item_comentarios 
FOR EACH ROW EXECUTE FUNCTION notify_interaction();
