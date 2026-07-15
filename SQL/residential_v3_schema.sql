-- EXECUTAR EN SUPABASE SQL EDITOR
-- Agente 1: Infraestructura y Datos

-- ==========================================
-- 1. EXTENSIÓN DE ROLES EN PROFILES
-- ==========================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'vecino' CHECK (role IN ('vecino', 'conserje', 'admin', 'mayordomo', 'comite'));
    END IF;
END $$;

-- ==========================================
-- 2. GESTIÓN DE ESTACIONAMIENTOS (SEGURIDAD)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.parqueaderos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    identificador TEXT NOT NULL, -- Ej: V-01, V-02
    tipo TEXT DEFAULT 'visita',
    estado TEXT DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.uso_parqueaderos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parqueadero_id UUID REFERENCES public.parqueaderos(id) ON DELETE CASCADE,
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Vecino que invita
    visita_id UUID, -- Referencia a tabla visitas si existe
    patente TEXT,
    nombre_visitante TEXT,
    hora_entrada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    hora_salida TIMESTAMP WITH TIME ZONE,
    registrado_por UUID REFERENCES public.profiles(id), -- Conserje
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. LOGÍSTICA Y LIBRO DE NOVEDADES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.encomiendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Residente
    conserje_id UUID REFERENCES public.profiles(id),
    descripcion TEXT,
    codigo_retiro TEXT,
    retirado BOOLEAN DEFAULT FALSE,
    fecha_recepcion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    fecha_retiro TIMESTAMP WITH TIME ZONE,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.libro_novedades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    autor_id UUID REFERENCES public.profiles(id),
    categoria TEXT CHECK (categoria IN ('turno', 'seguridad', 'mantenimiento', 'general', 'siniestro')),
    contenido TEXT NOT NULL,
    importante BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. FINANZAS Y CEREBRO ADMINISTRATIVO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.nomina_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    mes_periodo TEXT NOT NULL, -- Ej: '2026-02'
    sueldo_base NUMERIC DEFAULT 0,
    horas_extra NUMERIC DEFAULT 0,
    bonos NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    pagado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.medidores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    tipo TEXT CHECK (tipo IN ('agua', 'gas', 'electricidad')),
    lectura NUMERIC NOT NULL,
    foto_url TEXT,
    fecha_lectura DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. DEMOCRACIA Y DOCUMENTACIÓN
-- ==========================================
CREATE TABLE IF NOT EXISTS public.votaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    quorum_minimo NUMERIC DEFAULT 50, -- Porcentaje
    estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada', 'borrador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.votos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    votacion_id UUID REFERENCES public.votaciones(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    opcion TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(votacion_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.documentos_comunales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    categoria TEXT CHECK (categoria IN ('acta', 'reglamento', 'plano', 'finanzas')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 6. MANTENIMIENTO PREVENTIVO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.mantencion_preventiva (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
    estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'en_curso', 'completada')),
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 7. POLÍTICAS DE RLS (SEGURIDAD POR ROL)
-- ==========================================

-- 7.1 PARQUEADEROS
CREATE POLICY "Comunidad puede ver parqueaderos" ON public.parqueaderos
FOR SELECT USING (comunidad_id IN (SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admin/Staff puede gestionar parqueaderos" ON public.parqueaderos
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'conserje'))
);

-- 7.2 LIBRO DE NOVEDADES
CREATE POLICY "Comunidad puede leer novedades" ON public.libro_novedades
FOR SELECT USING (comunidad_id IN (SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Staff puede insertar novedades" ON public.libro_novedades
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'conserje', 'comite'))
);

-- 7.3 ENCOMIENDAS
CREATE POLICY "Residentes ven sus propias encomiendas" ON public.encomiendas
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff puede ver todas las encomiendas" ON public.encomiendas
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'conserje'))
);

CREATE POLICY "Staff gestiona encomiendas" ON public.encomiendas
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'conserje'))
);

-- 7.4 FINANZAS (NÓMINA)
CREATE POLICY "Solo admin y comite ven nominas" ON public.nomina_staff
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'comite'))
);

-- 7.5 MEDIDORES
CREATE POLICY "Residentes ven sus lecturas" ON public.medidores
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff ve todas las lecturas" ON public.medidores
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'conserje'))
);

CREATE POLICY "Staff registra lecturas" ON public.medidores
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'conserje'))
);

-- 7.6 VOTACIONES
CREATE POLICY "Comunidad lee votaciones" ON public.votaciones
FOR SELECT USING (comunidad_id IN (SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admin gestiona votaciones" ON public.votaciones
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'comite'))
);

-- 7.7 VOTOS
CREATE POLICY "Usuarios ven sus propios votos" ON public.votos
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden votar una vez" ON public.votos
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 7.8 MANTENCIÓN PREVENTIVA
CREATE POLICY "Comunidad ve mantenciones" ON public.mantencion_preventiva
FOR SELECT USING (comunidad_id IN (SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admin gestiona mantenciones" ON public.mantencion_preventiva
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo'))
);

-- 7.9 DOCUMENTOS COMUNALES
CREATE POLICY "Comunidad ve documentos" ON public.documentos_comunales
FOR SELECT USING (comunidad_id IN (SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admin gestiona documentos" ON public.documentos_comunales
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'mayordomo', 'comite'))
);
