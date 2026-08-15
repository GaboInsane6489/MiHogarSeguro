-- Enums para Áreas, Horizontes y Bloques de contenido
CREATE TYPE area_type AS ENUM ('trabajo', 'universidad', 'gimnasio', 'cashea', 'personal');
CREATE TYPE horizon_type AS ENUM ('hoy', 'corto', 'mediano', 'largo');
CREATE TYPE block_type AS ENUM ('heading', 'paragraph', 'todo', 'bullet', 'code', 'callout');

-- Tabla principal de Entradas del Second Brain
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB DEFAULT '[]'::jsonb NOT NULL,
  area area_type DEFAULT 'personal' NOT NULL,
  horizon horizon_type DEFAULT 'hoy' NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar filtrado por área, horizonte y fecha
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_area ON entries(area);
CREATE INDEX IF NOT EXISTS idx_entries_horizon ON entries(horizon);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);

-- Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad RLS
CREATE POLICY "Permitir lectura para todos o usuarios autenticados"
  ON entries FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción para todos o usuarios autenticados"
  ON entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización para todos o usuarios autenticados"
  ON entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación para todos o usuarios autenticados"
  ON entries FOR DELETE
  USING (true);
