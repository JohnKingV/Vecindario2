-- Añadir campos de reputación y estadísticas a los perfiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS raiting_ventas NUMERIC(3,2) DEFAULT 0.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ventas_exitosas INTEGER DEFAULT 0;

-- Comentario: raiting_ventas es de 0.00 a 5.00
-- ventas_exitosas es el contador de items marcados como vendidos
