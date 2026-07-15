-- ========================================================================================
-- ESQUEMA DE CONTABILIDAD AVANZADA Y CONCILIACIÓN CON IA
-- ========================================================================================
-- Este script crea las estructuras para soportar una contabilidad de partida doble
-- y el motor de conciliación bancaria inteligente.

-- 1. PLAN DE CUENTAS (Chart of Accounts)
CREATE TABLE IF NOT EXISTS plan_cuentas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) NOT NULL, -- Ej: '1.1.1.0' (Activo > Caja y Bancos)
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO')),
    comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(codigo, comunidad_id) -- Un código es único por comunidad
);

-- 2. TRANSACCIONES BANCARIAS (Cartolas Importadas)
CREATE TABLE IF NOT EXISTS transacciones_bancarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
    fecha_transaccion DATE NOT NULL,
    descripcion_banco TEXT NOT NULL,
    cargo NUMERIC(12, 2) DEFAULT 0, -- Salida de dinero del banco
    abono NUMERIC(12, 2) DEFAULT 0, -- Entrada de dinero al banco
    saldo_restante NUMERIC(12, 2),
    banco_origen VARCHAR(100),
    referencia_bancaria VARCHAR(150),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'conciliada', 'ignorada')),
    raw_data JSONB, -- Para guardar metadatos extra del CSV bancario
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referencia_bancaria, comunidad_id) -- Evita duplicar la misma transacción si se sube el CSV dos veces
);

-- 3. ASIENTOS CONTABLES (Libro Mayor / Journal Entries)
CREATE TABLE IF NOT EXISTS asientos_contables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    glosa TEXT NOT NULL, -- Descripción del movimiento
    estado VARCHAR(20) DEFAULT 'asentado' CHECK (estado IN ('borrador', 'asentado', 'anulado')),
    referencia_documento VARCHAR(100), -- Ej: "Factura N° 1234"
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DETALLE DE ASIENTOS (Líneas de Partida Doble)
CREATE TABLE IF NOT EXISTS detalle_asientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asiento_id UUID REFERENCES asientos_contables(id) ON DELETE CASCADE,
    cuenta_id UUID REFERENCES plan_cuentas(id) ON DELETE RESTRICT,
    debe NUMERIC(12, 2) DEFAULT 0,
    haber NUMERIC(12, 2) DEFAULT 0,
    descripcion_linea TEXT,
    CONSTRAINT partida_doble_positiva CHECK (debe >= 0 AND haber >= 0)
);

-- 5. CONCILIACIONES (Puente de Match IA)
CREATE TABLE IF NOT EXISTS conciliaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
    transaccion_bancaria_id UUID UNIQUE REFERENCES transacciones_bancarias(id) ON DELETE CASCADE,
    -- FKs exclusivas (Se enlaza con uno solo de estos)
    pago_expensa_id UUID REFERENCES pagos_expensas(id) ON DELETE SET NULL,
    egreso_id UUID REFERENCES egresos(id) ON DELETE SET NULL,
    pago_nomina_id UUID REFERENCES pagos_nomina(id) ON DELETE SET NULL,
    fecha_conciliacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metodo VARCHAR(50) DEFAULT 'manual' CHECK (metodo IN ('manual', 'ia_exacto', 'ia_sugerido')),
    nivel_confianza NUMERIC(5,2), -- % de seguridad de la IA (Ej: 99.9)
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Quien aprobó/concilió
    notas TEXT
);

-- ========================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================================================================

ALTER TABLE plan_cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_asientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conciliaciones ENABLE ROW LEVEL SECURITY;

-- Políticas base: Solo admin puede ver/editar
CREATE POLICY "Admin full access plan_cuentas" ON plan_cuentas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'comite')
        )
    );

CREATE POLICY "Admin full access transacciones" ON transacciones_bancarias
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'comite')
        )
    );

CREATE POLICY "Admin full access asientos" ON asientos_contables
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'comite')
        )
    );

CREATE POLICY "Admin full access detalle_asientos" ON detalle_asientos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'comite')
        )
    );

CREATE POLICY "Admin full access conciliaciones" ON conciliaciones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'comite')
        )
    );
