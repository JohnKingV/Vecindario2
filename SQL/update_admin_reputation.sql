-- Actualizar reputación del administrador
-- Ejecutar en el SQL Editor de Supabase

UPDATE public.profiles
SET raiting_ventas = 4.9
WHERE role = 'admin' 
   OR nombre ILIKE '%Administrador%'
   OR email ILIKE '%admin%';

-- Verificar el cambio
SELECT id, nombre, email, role, raiting_ventas 
FROM public.profiles 
WHERE raiting_ventas = 4.9;
