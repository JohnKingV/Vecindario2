-- Ejecutar esto en el SQL Editor de Supabase
-- Añadir la columna 'torre' a la tabla 'profiles'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS torre TEXT;

-- Comentario: Esto permitirá guardar la información de la torre o bloque de cada vecino.
