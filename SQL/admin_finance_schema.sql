-- Módulo Administrativo y Financiero (Proveedores, Nómina, Egresos)

-- ==========================================
-- 1. PROVEEDORES (Empresas Externas)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    rut TEXT,
    razon_social TEXT NOT NULL,
    giro TEXT,
    email TEXT,
    telefono TEXT,
    banco TEXT,
    tipo_cuenta TEXT CHECK (tipo_cuenta IN ('corriente', 'vista', 'ahorro', 'rut')),
    numero_cuenta TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. EMPLEADOS (Recursos Humanos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id), -- Opcional, si el empleado tiene cuenta en la app
    rut TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    cargo TEXT CHECK (cargo IN ('conserje', 'aseo', 'administrador', 'mayordomo', 'mantenimiento', 'otro')),
    sueldo_base NUMERIC DEFAULT 0,
    fecha_ingreso DATE,
    tipo_contrato TEXT CHECK (tipo_contrato IN ('indefinido', 'plazo_fijo', 'honorarios')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. PAGOS DE NÓMINA (Sueldos Trabajadores)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pagos_nomina (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES public.empleados(id) ON DELETE CASCADE,
    mes_periodo TEXT NOT NULL, -- Ej: '2026-03'
    dias_trabajados INTEGER DEFAULT 30,
    sueldo_base NUMERIC DEFAULT 0,
    horas_extra NUMERIC DEFAULT 0,
    bonos NUMERIC DEFAULT 0,
    descuentos NUMERIC DEFAULT 0, -- Anticipos, inasistencias
    total_a_pagar NUMERIC DEFAULT 0,
    estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado')),
    fecha_pago TIMESTAMP WITH TIME ZONE,
    comprobante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. EGRESOS (Gastos Generales y Proveedores)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.egresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunidad_id UUID REFERENCES public.comunidades(id) ON DELETE CASCADE,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL, -- Opcional
    categoria TEXT CHECK (categoria IN ('mantenimiento', 'servicios_basicos', 'insumos', 'honorarios', 'seguridad', 'reparaciones', 'otro')),
    descripcion TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'vencido', 'anulado')),
    fecha_pago TIMESTAMP WITH TIME ZONE,
    comprobante_url TEXT,
    registrado_por UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. POLÍTICAS DE RLS (SEGURIDAD POR ROL)
-- ==========================================

-- PROVEEDORES
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gestiona proveedores" ON public.proveedores
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'comite'))
);
CREATE POLICY "Comunidad ve proveedores" ON public.proveedores
FOR SELECT USING (comunidad_id IN (SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()));

-- EMPLEADOS
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo admin gestiona empleados" ON public.empleados
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'comite'))
);
CREATE POLICY "Empleado ve sus datos" ON public.empleados
FOR SELECT USING (user_id = auth.uid());

-- PAGOS DE NÓMINA
ALTER TABLE public.pagos_nomina ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo admin gestiona nomina" ON public.pagos_nomina
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'comite'))
);
CREATE POLICY "Empleado ve su nomina" ON public.pagos_nomina
FOR SELECT USING (
    empleado_id IN (SELECT id FROM public.empleados WHERE user_id = auth.uid())
);

-- EGRESOS
ALTER TABLE public.egresos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gestiona egresos" ON public.egresos
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'comite'))
);
CREATE POLICY "Comunidad ve egresos (Transparencia)" ON public.egresos
FOR SELECT USING (comunidad_id IN (SELECT comunidad_id FROM public.profiles WHERE id = auth.uid()));

