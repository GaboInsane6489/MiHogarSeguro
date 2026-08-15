-- Migracion: Habilitar Row Level Security (RLS) y Politicas de Acceso para Auth

-- 1. Asegurar la tabla profiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    ai_context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Asegurar columna user_id en la tabla entries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entries' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.entries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indice para optimizar consultas por usuario
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);

-- 3. Habilitar RLS en las tablas principales
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Politicas RLS para la tabla entries
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias entradas o entradas publicas" ON public.entries;
CREATE POLICY "Usuarios pueden ver sus propias entradas o entradas publicas"
    ON public.entries
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR user_id IS NULL
    );

DROP POLICY IF EXISTS "Usuarios autenticados pueden crear entradas" ON public.entries;
CREATE POLICY "Usuarios autenticados pueden crear entradas"
    ON public.entries
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        OR user_id IS NULL
    );

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias entradas" ON public.entries;
CREATE POLICY "Usuarios pueden actualizar sus propias entradas"
    ON public.entries
    FOR UPDATE
    USING (
        auth.uid() = user_id 
        OR user_id IS NULL
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR user_id IS NULL
    );

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias entradas" ON public.entries;
CREATE POLICY "Usuarios pueden eliminar sus propias entradas"
    ON public.entries
    FOR DELETE
    USING (
        auth.uid() = user_id 
        OR user_id IS NULL
    );

-- 5. Politicas RLS para la tabla profiles
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden insertar su propio perfil"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
