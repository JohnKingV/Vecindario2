-- Crear tabla de likes para comentarios
CREATE TABLE IF NOT EXISTS public.comentario_likes (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    comentario_id UUID REFERENCES public.comentarios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(comentario_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.comentario_likes ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Cualquiera puede ver los likes de comentarios" 
ON public.comentario_likes FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden dar like" 
ON public.comentario_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden quitar su propio like" 
ON public.comentario_likes FOR DELETE USING (auth.uid() = user_id);

-- Opcional: Trigger para notificaciones (si existe la lógica de notificaciones de interacciones)
-- Esto dependerá de si quieres que el autor del comentario reciba una notificación.
