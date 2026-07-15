-- Enable RLS on encomiendas
ALTER TABLE public.encomiendas ENABLE ROW LEVEL SECURITY;

-- Policy: Admin and Staff can view ALL encomiendas in their community
DROP POLICY IF EXISTS "Staff can view all community packages" ON public.encomiendas;
CREATE POLICY "Staff can view all community packages" 
ON public.encomiendas FOR SELECT 
TO authenticated 
USING (
  coalesce(comunidad_id, (select comunidad_id from profiles where id = auth.uid())) = (select comunidad_id from profiles where id = auth.uid())
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'conserje', 'mayordomo')
  )
);

-- Policy: Residents can view THEIR own encomiendas
DROP POLICY IF EXISTS "Residents can view own packages" ON public.encomiendas;
CREATE POLICY "Residents can view own packages" 
ON public.encomiendas FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid()
);

-- Policy: Staff can INSERT packages
DROP POLICY IF EXISTS "Staff can insert packages" ON public.encomiendas;
CREATE POLICY "Staff can insert packages" 
ON public.encomiendas FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'conserje', 'mayordomo')
);

-- Policy: Staff can UPDATE packages (mark as delivered)
DROP POLICY IF EXISTS "Staff can update packages" ON public.encomiendas;
CREATE POLICY "Staff can update packages" 
ON public.encomiendas FOR UPDATE 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'conserje', 'mayordomo')
);

-- Policy: Residents can UPDATE their own packages (confirm receipt)
DROP POLICY IF EXISTS "Residents can update own packages" ON public.encomiendas;
CREATE POLICY "Residents can update own packages" 
ON public.encomiendas FOR UPDATE 
TO authenticated 
USING (
  user_id = auth.uid()
);
