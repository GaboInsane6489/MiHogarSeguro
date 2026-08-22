-- Migracion: Soporte para Fecha Limite (due_date), Prioridad y Storage de Adjuntos Multimedia

-- 1. Asegurar columnas en entries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entries' AND column_name = 'due_date'
    ) THEN
        ALTER TABLE public.entries ADD COLUMN due_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entries' AND column_name = 'priority'
    ) THEN
        ALTER TABLE public.entries ADD COLUMN priority TEXT DEFAULT 'media';
    END IF;
END $$;

-- 2. Indices de busqueda y ordenamiento
CREATE INDEX IF NOT EXISTS idx_entries_due_date ON public.entries(due_date);
CREATE INDEX IF NOT EXISTS idx_entries_priority ON public.entries(priority);

-- 3. Crear el Bucket de Storage para adjuntos si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('entry-attachments', 'entry-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Politicas RLS para el Bucket entry-attachments
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir adjuntos" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden subir adjuntos" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'entry-attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Acceso publico de lectura a adjuntos" ON storage.objects;
CREATE POLICY "Acceso publico de lectura a adjuntos" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'entry-attachments');

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios adjuntos" ON storage.objects;
CREATE POLICY "Usuarios pueden eliminar sus propios adjuntos" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'entry-attachments' AND auth.uid() = owner);
