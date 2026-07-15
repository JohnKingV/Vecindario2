-- 1. Asegurar que la columna 'is_featured' existe en profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 2. Asegurar que la columna 'raiting_ventas' existe (por si acaso)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS raiting_ventas NUMERIC(3,2) DEFAULT 0.0;

-- 3. Destacar a Juan Araneda (jaraneda1596@gmail.com)
-- Le damos 5.0 de rating y activamos el flag is_featured para que siempre sea visible
UPDATE public.profiles 
SET 
  raiting_ventas = 5.00,
  is_featured = TRUE
WHERE email = 'jaraneda1596@gmail.com';

-- 4. Opcional: Asegurar que Ramon Araneda también tenga buena reputación si ya existe
UPDATE public.profiles 
SET 
  raiting_ventas = 4.50
WHERE nombre ILIKE '%Ramon Araneda%';
