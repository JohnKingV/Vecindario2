-- ==============================================================================
-- SETUP DOCUMENTS MODULE
-- 1. Enable RLS
-- 2. Add Policies
-- 3. Insert Test Data
-- ==============================================================================

-- 1. Enable RLS
ALTER TABLE public.documentos_comunales ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view documents from their community" ON public.documentos_comunales;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.documentos_comunales;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.documentos_comunales;

-- 3. Create READ policy (Allow everyone to read for now to ensure visibility)
CREATE POLICY "Enable read access for all users"
ON public.documentos_comunales FOR SELECT
USING (true);

-- 4. Create INSERT policy
CREATE POLICY "Enable insert for authenticated users"
ON public.documentos_comunales FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 5. Insert Test Data (For ALL communities to ensure the user sees it)
-- We use a loop-like approach by selecting from comunidades

-- Document 1: Reglamento
INSERT INTO public.documentos_comunales (comunidad_id, titulo, url, categoria)
SELECT id, 'Manual de Convivencia 2024', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'reglamento'
FROM public.comunidades;

-- Document 2: Acta
INSERT INTO public.documentos_comunales (comunidad_id, titulo, url, categoria)
SELECT id, 'Acta Asamblea Marzo', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'acta'
FROM public.comunidades;

-- Document 3: Plano
INSERT INTO public.documentos_comunales (comunidad_id, titulo, url, categoria)
SELECT id, 'Plano General Hidráulico', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1000', 'plano'
FROM public.comunidades;

-- Document 4: Finanzas
INSERT INTO public.documentos_comunales (comunidad_id, titulo, url, categoria)
SELECT id, 'Balance Financiero Q1', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'finanzas'
FROM public.comunidades;
