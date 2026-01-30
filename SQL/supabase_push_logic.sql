-- SQL: supabase_push_logic.sql
-- Objetivo: Configurar el envío automático de notificaciones push vía Expo

-- NOTA: Para que esto funcione, necesitas desplegar una Supabase Edge Function 
-- que haga el POST a https://exp.host/--/api/v2/push/send

-- 1. Crear una tabla de cola (queue) para notificaciones push (opcional pero recomendado)
-- Esto permite que el sistema intente re-enviar si falla.
CREATE TABLE IF NOT EXISTS public.push_notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Trigger para insertar en la cola cuando se crea una notificación interna
-- (Este trigger se conecta con el sistema de notificaciones que ya tienes)
CREATE OR REPLACE FUNCTION queue_push_notification() 
RETURNS TRIGGER AS $$
DECLARE
    target_token TEXT;
BEGIN
    -- Obtener el token del usuario destino
    SELECT expo_push_token INTO target_token FROM profiles WHERE id = NEW.user_id;

    -- Solo encolar si el usuario tiene un token registrado
    IF (target_token IS NOT NULL) THEN
        INSERT INTO push_notification_queue (user_id, title, body, data)
        VALUES (NEW.user_id, NEW.title, NEW.message, NEW.data);
        
        -- AQUÍ: Llamada a la Edge Function (vía HTTP Webhook)
        -- Puedes configurar un Webhook en el Dashboard de Supabase que vigile 
        -- la tabla 'push_notification_queue' e invoque tu función.
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_queue_push ON notifications;
CREATE TRIGGER tr_queue_push
AFTER INSERT ON notifications
FOR EACH ROW EXECUTE FUNCTION queue_push_notification();

-- INSTRUCCIONES PARA EL USUARIO:
-- 1. Ve a la sección 'Webhooks' o 'Edge Functions' en Supabase.
-- 2. Crea una función llamada 'send-push' que reciba el payload de la tabla 'push_notification_queue'.
-- 3. La función debe enviar un JSON a Expo con el 'expo_push_token' del perfil.
