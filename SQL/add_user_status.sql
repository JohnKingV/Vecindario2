-- ==========================================
-- AGREGAR ESTADOS DE USUARIO (PRESENCIA)
-- Ejecuta este script en el Editor SQL de Supabase
-- ==========================================

-- 1. Agregar columna de estado a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'online' 
CHECK (status IN ('online', 'busy', 'offline'));

-- 2. Agregar columna de última conexión (opcional pero recomendado)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Habilitar replicación para la tabla profiles si no está activa
-- Esto es necesario para que los cambios de estado se vean en tiempo real
-- (Suele estar activo por defecto para 'public', pero lo aseguramos)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

SELECT 'Tabla profiles actualizada con soporte para estados.' as mensaje;
