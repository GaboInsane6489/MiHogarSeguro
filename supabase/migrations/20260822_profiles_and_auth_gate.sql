-- Migracion: Tabla profiles extendida para Auth Gate y Personalizacion de IA

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{"theme": "dark", "default_horizon": "hoy"}'::jsonb,
    ai_context JSONB DEFAULT '{"profession": "", "goals": "", "custom_instructions": ""}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar columnas si la tabla ya existia
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'preferences'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{"theme": "dark", "default_horizon": "hoy"}'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politicas RLS para profiles
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
