-- SQL: register_push_token.sql
-- Objetivo: Añadir soporte para tokens de notificaciones push de Expo

-- 1. Añadir columna a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- 2. (Opcional) Índice para búsqueda rápida por token
CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token ON public.profiles(expo_push_token);

-- 3. Habilitar que el sistema pueda leer el token para enviar notificaciones
-- (Generalmente el rol postgrest o service_role ya tienen acceso)
GRANT SELECT (expo_push_token) ON public.profiles TO authenticated;

COMMENT ON COLUMN public.profiles.expo_push_token IS 'Token único de Expo para enviar notificaciones push al dispositivo Android del usuario.';
