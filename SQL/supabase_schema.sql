-- Ejecutar esto en Supabase SQL Editor

-- Enable PostGIS for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla de comunidades
CREATE TABLE IF NOT EXISTS comunidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT DEFAULT 'Santiago',
  codigo_verificacion TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de usuarios (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT,
  depto TEXT,
  foto_url TEXT,
  comunidad_id UUID REFERENCES comunidades(id),
  verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comunidad_id UUID REFERENCES comunidades(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('aviso', 'alerta', 'venta', 'pregunta')),
  titulo TEXT,
  contenido TEXT NOT NULL,
  imagen_url TEXT,
  ubicacion GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índice para búsquedas rápidas por comunidad
CREATE INDEX IF NOT EXISTS posts_comunidad_idx ON posts(comunidad_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS comentarios_post_idx ON comentarios(post_id);

-- Tabla de items marketplace
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comunidad_id UUID REFERENCES comunidades(id) NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  precio INTEGER NOT NULL,
  imagen_url TEXT,
  vendido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS items_comunidad_idx ON items(comunidad_id);
CREATE INDEX IF NOT EXISTS items_vendido_idx ON items(vendido) WHERE vendido = FALSE;

-- Tabla de chats/mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS mensajes_users_idx ON mensajes(from_user_id, to_user_id);

-- Row Level Security (RLS)

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
DO $$ BEGIN
    CREATE POLICY "Usuarios pueden ver perfiles de su comunidad"
      ON profiles FOR SELECT
      USING (
        comunidad_id IN (
          SELECT comunidad_id FROM profiles WHERE id = auth.uid()
        )
      );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NEW: Permitir insertar perfil propio al registrarse
DO $$ BEGIN
    CREATE POLICY "Usuarios pueden insertar su propio perfil"
      ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuarios pueden actualizar su propio perfil"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies para posts
DO $$ BEGIN
    CREATE POLICY "Usuarios pueden ver posts de su comunidad"
      ON posts FOR SELECT
      USING (
        comunidad_id IN (
          SELECT comunidad_id FROM profiles WHERE id = auth.uid()
        )
      );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuarios pueden crear posts en su comunidad"
      ON posts FOR INSERT
      WITH CHECK (
        user_id = auth.uid() AND
        comunidad_id IN (
          SELECT comunidad_id FROM profiles WHERE id = auth.uid()
        )
      );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuarios pueden eliminar sus propios posts"
      ON posts FOR DELETE
      USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies similares para comentarios, items, mensajes
DO $$ BEGIN
    CREATE POLICY "Ver comentarios de posts accesibles"
      ON comentarios FOR SELECT
      USING (
        post_id IN (
          SELECT id FROM posts WHERE comunidad_id IN (
            SELECT comunidad_id FROM profiles WHERE id = auth.uid()
          )
        )
      );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Crear comentarios"
      ON comentarios FOR INSERT
      WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Storage buckets para imágenes
-- NOTA IMPORTANTISIMA:
-- La creación de políticas de STORAGE (Almacenamiento) suele fallar por permisos en el Editor SQL ("must be owner of table objects").
-- POR FAVOR, CONFIGURA ESTO MANUALMENTE EN EL DASHBOARD DE SUPABASE:
-- 1. Ve al menú "Storage" (Almacenamiento).
-- 2. Crea dos buckets públicos: 'avatars' y 'posts'.
-- 3. En la pestaña "Policies" (Políticas) de Storage, añade políticas para cada bucket:
--    - SELECT: Permitir anon (public) para ver imágenes.
--    - INSERT: Permitir a usuarios autenticados subir imágenes.

-- SQL para crear buckets (puede fallar si ya existen, es seguro ignorar el error de "duplicate"):
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true) ON CONFLICT DO NOTHING;

-- Storage policies (COMENTADAS PARA EVITAR ERRORES DE PERMISOS)
-- Si tienes permisos de superusuario, puedes descomentarlas. Si no, usa el Dashboard.
/*
DO $$ BEGIN
    CREATE POLICY "Cualquiera puede ver avatares"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuarios pueden subir su avatar"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Cualquiera puede ver posts images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'posts');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Usuarios pueden subir imagenes de posts"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'posts' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
*/

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- La comunidad ya está creada según el usuario.
-- INSERT INTO comunidades (nombre, direccion, ciudad, codigo_verificacion)
-- VALUES ('Condominio Las Flores', 'Av. Providencia 1234', 'Santiago', 'FLORES2026');
