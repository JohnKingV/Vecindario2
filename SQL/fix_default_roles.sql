-- ==========================================
-- SCRIPT DE LIMPIEZA Y NORMALIZACIÓN DE ROLES
-- Ejecuta este script en el Editor SQL de Supabase
-- ==========================================

-- 1. Actualizar roles existentes 'user' o NULL a 'vecino'
UPDATE public.profiles 
SET role = 'vecino' 
WHERE role = 'user' OR role IS NULL;

-- 2. Asegurar que la columna tenga el valor predeterminado 'vecino'
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'vecino';

-- 3. Reforzar el constraint de valores permitidos (opcional si ya existe, lo recreamos)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('vecino', 'conserje', 'admin', 'mayordomo', 'comite'));

SELECT 'Roles normalizados. Todos los "user" ahora son "vecino".' as resultado;
