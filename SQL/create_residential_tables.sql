-- Tablas para el módulo Residencial y Reservas

-- 1. Tabla de Amenidades
CREATE TABLE IF NOT EXISTS public.amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    ubicacion TEXT,
    capacidad_max INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Reservas de Amenidades
CREATE TABLE IF NOT EXISTS public.reservas_amenidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TEXT NOT NULL,
    estado TEXT DEFAULT 'confirmada',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Pagos de Expensas
CREATE TABLE IF NOT EXISTS public.pagos_expensas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mes_periodo TEXT NOT NULL, -- Ej: '2026-01'
    monto NUMERIC NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    fecha_pago TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas_amenidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_expensas ENABLE ROW LEVEL SECURITY;

-- Políticas para Amenidades (Lectura para todos los de la comunidad)
CREATE POLICY "Amenities visible for community members" ON public.amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.comunidad_id = amenities.comunidad_id
        )
    );

-- Políticas para Reservas (Los usuarios ven y crean sus propias reservas)
CREATE POLICY "Users can view their own reservations" ON public.reservas_amenidades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations" ON public.reservas_amenidades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update/cancel their own reservations" ON public.reservas_amenidades
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para Pagos (Los usuarios ven sus propios pagos)
CREATE POLICY "Users can view their own payments" ON public.pagos_expensas
    FOR SELECT USING (auth.uid() = user_id);

-- Datos de ejemplo iniciales
-- Esto insertará amenidades básicas en todas las comunidades existentes
DO $$
DECLARE
    com_record RECORD;
BEGIN
    FOR com_record IN SELECT id FROM public.comunidades LOOP
        -- Piscina
        INSERT INTO public.amenities (comunidad_id, nombre, descripcion, ubicacion, imagen_url)
        VALUES (
            com_record.id, 
            'Piscina Adultos', 
            'Piscina exterior de nado libre', 
            'Piso 1', 
            'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=800'
        ) ON CONFLICT DO NOTHING;

        -- Gym
        INSERT INTO public.amenities (comunidad_id, nombre, descripcion, ubicacion, imagen_url)
        VALUES (
            com_record.id, 
            'Gimnasio', 
            'Equipado con máquinas de cardio y pesas', 
            'Piso 2', 
            'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800'
        ) ON CONFLICT DO NOTHING;

        -- Quincho / BBQ
        INSERT INTO public.amenities (comunidad_id, nombre, descripcion, ubicacion, imagen_url)
        VALUES (
            com_record.id, 
            'Área BBQ / Quincho', 
            'Espacio techado con parrilla y mesones', 
            'Terraza', 
            'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?auto=compress&cs=tinysrgb&w=800'
        ) ON CONFLICT DO NOTHING;

        -- Lavandería
        INSERT INTO public.amenities (comunidad_id, nombre, descripcion, ubicacion, imagen_url)
        VALUES (
            com_record.id, 
            'Lavandería', 
            'Lavarropas y secadoras industriales', 
            'Subsuelo', 
            'https://images.pexels.com/photos/7464670/pexels-photo-7464670.jpeg?auto=compress&cs=tinysrgb&w=800'
        ) ON CONFLICT DO NOTHING;

        -- Sala de Reuniones
        INSERT INTO public.amenities (comunidad_id, nombre, descripcion, ubicacion, imagen_url)
        VALUES (
            com_record.id, 
            'Sala de Reuniones', 
            'Espacio de co-work y reuniones privadas', 
            'Piso 1', 
            'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=800'
        ) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
