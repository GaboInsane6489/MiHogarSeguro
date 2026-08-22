-- Migración: Agregar columna banner_url a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
