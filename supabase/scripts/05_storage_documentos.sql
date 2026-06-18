-- ============================================================
-- Script 05: Bucket Storage para documentos de campo
-- (App Flutter — captura DNI, negocio, legales)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_campo',
  'documentos_campo',
  FALSE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "upload_docs_anon" ON storage.objects;
CREATE POLICY "upload_docs_anon" ON storage.objects
  FOR ALL TO anon, authenticated
  USING (bucket_id = 'documentos_campo')
  WITH CHECK (bucket_id = 'documentos_campo');
