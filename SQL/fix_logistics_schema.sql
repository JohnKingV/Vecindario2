-- Add missing columns to encomiendas
ALTER TABLE public.encomiendas ADD COLUMN IF NOT EXISTS empresa_transporte TEXT;
ALTER TABLE public.encomiendas ADD COLUMN IF NOT EXISTS codigo_retiro TEXT;
ALTER TABLE public.encomiendas ADD COLUMN IF NOT EXISTS conserje_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.encomiendas ADD COLUMN IF NOT EXISTS fecha_retiro TIMESTAMPTZ;
ALTER TABLE public.encomiendas ADD COLUMN IF NOT EXISTS retirado BOOLEAN DEFAULT false;
ALTER TABLE public.encomiendas ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente';
ALTER TABLE public.encomiendas ADD COLUMN IF NOT EXISTS fecha_recepcion TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.encomiendas ADD COLUMN IF NOT EXISTS descripcion TEXT;


-- Ensure notifications table exists
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to notifications (in case table already existed without them)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT; -- 'package', 'general', etc.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_id UUID; -- Links to encomiendas.id or other resources
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;


-- Enable RLS on notifications if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: System/Admins can insert notifications (or anyone for now to simplify triggers)
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Users can update (mark read) their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE
TO authenticated 
USING (auth.uid() = user_id);
