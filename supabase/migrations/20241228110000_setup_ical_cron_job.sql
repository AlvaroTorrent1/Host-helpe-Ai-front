-- Migración para configurar job automático de sincronización iCal
-- Archivo: 20241228110000_setup_ical_cron_job.sql

-- Habilitar extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Eliminar job existente si existe
SELECT cron.unschedule('ical-sync-job');

-- Crear job para ejecutar sincronización iCal cada 30 minutos
SELECT cron.schedule(
  'ical-sync-job',
  '*/30 * * * *', -- Cada 30 minutos
  $$
  SELECT net.http_post(
    url := 'https://vvgxadqlhfdpshqkwdpl.supabase.co/functions/v1/ical-sync',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Crear función helper para obtener la service role key
CREATE OR REPLACE FUNCTION get_service_role_key()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT current_setting('app.settings.service_role_key', true);
$$;

-- Comentarios descriptivos
COMMENT ON FUNCTION get_service_role_key() IS 'Helper function para obtener service role key de forma segura';

-- Verificar que el job se creó correctamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ical-sync-job') THEN
    RAISE NOTICE 'Job de sincronización iCal configurado exitosamente - se ejecutará cada 30 minutos';
  ELSE
    RAISE WARNING 'No se pudo configurar el job de sincronización iCal';
  END IF;
END $$;
