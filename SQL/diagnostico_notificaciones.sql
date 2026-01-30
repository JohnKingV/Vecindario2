-- SQL: diagnostico_notificaciones.sql
-- Ejecuta esto en el SQL Editor de Supabase para ver qué está pasando.

-- 1. ¿Tienen los usuarios tokens registrados?
SELECT id, nombre, email, expo_push_token 
FROM profiles 
WHERE expo_push_token IS NOT NULL;

-- 2. ¿Se están generando notificaciones en la tabla base?
SELECT created_at, user_id, type, title, message 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. ¿Se están encolando para ser enviadas a Android?
SELECT created_at, user_id, title, body, status, error 
FROM push_notification_queue 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. ¿Existe el disparador de cola activo?
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'notifications';
