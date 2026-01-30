-- 1. Asegurar que la columna existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sexo TEXT DEFAULT 'hombre' CHECK (sexo IN ('hombre', 'mujer'));

-- 2. Actualizar usuarios existentes detectados en la app
UPDATE profiles SET sexo = 'mujer' WHERE nombre ILIKE '%carolina araneda%';
UPDATE profiles SET sexo = 'hombre' WHERE nombre ILIKE '%Pedro Guzman%';
UPDATE profiles SET sexo = 'mujer' WHERE nombre ILIKE '%Romina Maturana%';

-- 3. Opcional: Intento de actualización masiva por nombres comunes (solo como ayuda inicial)
UPDATE profiles SET sexo = 'mujer' 
WHERE sexo = 'hombre' -- solo actuar sobre los que tienen el default
AND (
    nombre ILIKE 'a%' OR 
    nombre ILIKE '% Maria%' OR 
    nombre ILIKE '% Claudia%' OR 
    nombre ILIKE '% Ana%' OR
    nombre ILIKE '% Patricia%' OR
    nombre ILIKE '% Javiera%'
);
