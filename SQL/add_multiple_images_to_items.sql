-- Migración para soportar múltiples imágenes en Marketplace
-- Ejecutar en el SQL Editor de Supabase

-- 1. Añadir la columna imagenes_url si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='imagenes_url') THEN
        ALTER TABLE public.items ADD COLUMN imagenes_url TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Migrar imagen_url existente al primer elemento del array (solo si el array está vacío)
UPDATE public.items 
SET imagenes_url = ARRAY[imagen_url] 
WHERE imagen_url IS NOT NULL 
AND (imagenes_url IS NULL OR array_length(imagenes_url, 1) IS NULL);

-- 3. Comentario informativo
COMMENT ON COLUMN public.items.imagenes_url IS 'Array de URLs de imágenes para el artículo (máximo 3 recomendado en UI)';
