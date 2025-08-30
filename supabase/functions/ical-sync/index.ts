// supabase/functions/ical-sync/index.ts
// Edge function para sincronización automática de calendarios iCal

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface IcalConfig {
  id: string;
  property_id: string;
  user_id: string;
  ical_url: string;
  ical_name: string;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  sync_status: string;
  error_message: string | null;
  is_active: boolean;
}

interface IcalEvent {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
  description?: string;
}

serve(async (req) => {
  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    console.log('🔄 Iniciando sincronización automática de calendarios iCal');

    // Obtener todas las configuraciones activas
    const { data: icalConfigs, error: configError } = await supabase
      .from('ical_configs')
      .select('*')
      .eq('is_active', true)
      .in('sync_status', ['pending', 'active']);

    if (configError) {
      console.error('Error obteniendo configuraciones iCal:', configError);
      return new Response('Error obteniendo configuraciones', { status: 500 });
    }

    if (!icalConfigs || icalConfigs.length === 0) {
      console.log('📭 No hay configuraciones iCal activas para sincronizar');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No hay configuraciones activas',
        processed: 0 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Procesando ${icalConfigs.length} configuraciones iCal`);

    let processed = 0;
    let errors = 0;

    // Procesar cada configuración
    for (const config of icalConfigs) {
      try {
        // Verificar si necesita sincronización
        const shouldSync = await shouldSyncConfig(config);
        if (!shouldSync) {
          console.log(`⏭️ Saltando ${config.ical_name} - no necesita sync`);
          continue;
        }

        console.log(`🔄 Sincronizando ${config.ical_name} para property ${config.property_id}`);

        // Realizar sincronización
        await syncIcalConfig(config);
        processed++;

        console.log(`✅ ${config.ical_name} sincronizado exitosamente`);

      } catch (syncError) {
        console.error(`❌ Error sincronizando ${config.ical_name}:`, syncError);
        errors++;

        // Marcar configuración con error
        await supabase
          .from('ical_configs')
          .update({
            sync_status: 'error',
            error_message: syncError.message || 'Error desconocido',
            last_sync_at: new Date().toISOString()
          })
          .eq('id', config.id);
      }
    }

    const result = {
      success: true,
      processed,
      errors,
      total: icalConfigs.length,
      timestamp: new Date().toISOString()
    };

    console.log(`🎉 Sincronización completada:`, result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error en sincronización iCal:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Determinar si una configuración necesita sincronización
 */
async function shouldSyncConfig(config: IcalConfig): Promise<boolean> {
  // Si nunca se ha sincronizado, sincronizar
  if (!config.last_sync_at) {
    return true;
  }

  // Calcular tiempo transcurrido desde última sincronización
  const lastSyncTime = new Date(config.last_sync_at).getTime();
  const now = new Date().getTime();
  const minutesSinceLastSync = (now - lastSyncTime) / (1000 * 60);

  // Sincronizar si ha pasado el intervalo configurado
  return minutesSinceLastSync >= config.sync_interval_minutes;
}

/**
 * Sincronizar una configuración iCal específica
 */
async function syncIcalConfig(config: IcalConfig): Promise<void> {
  try {
    // 1. Descargar iCal
    console.log(`📥 Descargando iCal de ${config.ical_url}`);
    const icalData = await fetchIcalData(config.ical_url);

    // 2. Parsear eventos
    const events = parseIcalData(icalData);
    console.log(`📅 Parsed ${events.length} eventos del iCal`);

    // 3. Sincronizar eventos con la base de datos
    await syncEventsToDatabase(config, events);

    // 4. Actualizar estado de la configuración
    await supabase
      .from('ical_configs')
      .update({
        sync_status: 'active',
        error_message: null,
        last_sync_at: new Date().toISOString()
      })
      .eq('id', config.id);

  } catch (error) {
    console.error(`Error en syncIcalConfig para ${config.id}:`, error);
    throw error;
  }
}

/**
 * Descargar datos iCal desde URL
 */
async function fetchIcalData(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Host Helper AI Calendar Sync/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Parsear datos iCal y extraer eventos
 */
function parseIcalData(icalData: string): IcalEvent[] {
  const events: IcalEvent[] = [];
  const lines = icalData.split('\n').map(line => line.trim());

  let currentEvent: Partial<IcalEvent> = {};
  let inEvent = false;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent.uid && currentEvent.dtstart && currentEvent.dtend) {
        events.push(currentEvent as IcalEvent);
      }
      inEvent = false;
      currentEvent = {};
    } else if (inEvent) {
      // Parsear propiedades del evento
      if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4);
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('DTSTART')) {
        const value = line.split(':')[1];
        currentEvent.dtstart = formatIcalDate(value);
      } else if (line.startsWith('DTEND')) {
        const value = line.split(':')[1];
        currentEvent.dtend = formatIcalDate(value);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      }
    }
  }

  return events;
}

/**
 * Formatear fecha iCal a formato ISO
 */
function formatIcalDate(icalDate: string): string {
  // Formato iCal: YYYYMMDD o YYYYMMDDTHHMMSSZ
  if (icalDate.length === 8) {
    // Solo fecha: YYYYMMDD
    const year = icalDate.substring(0, 4);
    const month = icalDate.substring(4, 6);
    const day = icalDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  } else if (icalDate.length >= 15) {
    // Fecha y hora: YYYYMMDDTHHMMSSZ
    const year = icalDate.substring(0, 4);
    const month = icalDate.substring(4, 6);
    const day = icalDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  return icalDate; // Fallback
}

/**
 * Sincronizar eventos con la base de datos
 */
async function syncEventsToDatabase(config: IcalConfig, events: IcalEvent[]): Promise<void> {
  // Obtener eventos existentes
  const { data: existingBookings } = await supabase
    .from('synced_bookings')
    .select('booking_uid')
    .eq('property_id', config.property_id)
    .eq('ical_config_id', config.id);

  const existingUids = new Set(existingBookings?.map(b => b.booking_uid) || []);

  // Procesar cada evento
  for (const event of events) {
    if (existingUids.has(event.uid)) {
      // Evento ya existe, podríamos actualizarlo aquí si es necesario
      continue;
    }

    // Crear nueva reserva sincronizada
    const booking = {
      property_id: config.property_id,
      user_id: config.user_id,
      ical_config_id: config.id,
      booking_uid: event.uid,
      booking_source: config.ical_name.toLowerCase(),
      check_in_date: event.dtstart,
      check_out_date: event.dtend,
      booking_status: determineBookingStatus(event.summary),
      guest_name: extractGuestName(event.summary),
      raw_ical_event: event,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('synced_bookings')
      .insert(booking);

    if (error) {
      console.error(`Error insertando reserva ${event.uid}:`, error);
      // Continuar con otros eventos
    } else {
      console.log(`✅ Reserva ${event.uid} sincronizada`);
    }
  }
}

/**
 * Determinar estado de reserva basado en el summary
 */
function determineBookingStatus(summary: string): string {
  const lowerSummary = summary.toLowerCase();
  
  if (lowerSummary.includes('blocked') || lowerSummary.includes('bloqueado')) {
    return 'blocked';
  }
  if (lowerSummary.includes('available') || lowerSummary.includes('disponible')) {
    return 'available';
  }
  if (lowerSummary.includes('reserved') || lowerSummary.includes('reservado')) {
    return 'reserved';
  }
  
  return 'blocked'; // Default para eventos desconocidos
}

/**
 * Extraer nombre del huésped del summary si está disponible
 */
function extractGuestName(summary: string): string | null {
  // Intentar extraer nombre del formato común "Reserved for John Doe"
  const match = summary.match(/(?:reserved for|reservado para|for)\s+([a-zA-Z\s]+)/i);
  return match ? match[1].trim() : null;
}
