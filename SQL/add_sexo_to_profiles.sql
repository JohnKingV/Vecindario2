-- Añadir columna de sexo a la tabla de perfiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sexo TEXT DEFAULT 'hombre' CHECK (sexo IN ('hombre', 'mujer'));

-- Comentario para el desarrollador: 
-- Ejecutar esto en el SQL Editor de Supabase.
