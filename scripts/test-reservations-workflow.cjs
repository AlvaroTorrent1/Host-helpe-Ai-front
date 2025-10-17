// scripts/test-reservations-workflow.cjs
// Script de diagnóstico completo para el flujo de reservas sincronizadas

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const SUPABASE_URL = 'https://blxngmtmknkdmikaflen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQyNDY5NzAsImV4cCI6MjAzOTgyMjk3MH0.lR-wRX8hYkNx2BFKDnmZMf78zpchMVJhhr49qcxMWBw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 DIAGNÓSTICO COMPLETO - FLUJO DE RESERVAS\n');
console.log('='.repeat(70));

async function runDiagnostics() {
  try {
    // 1. Verificar propiedades principales
    console.log('\n📌 PASO 1: Verificar tabla PROPERTIES');
    console.log('-'.repeat(70));
    
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name, user_id, status')
      .eq('name', 'Casa María Flora');
    
    if (propError) {
      console.error('❌ Error:', propError.message);
      return;
    }
    
    console.log('✅ Propiedades encontradas:', properties.length);
    properties.forEach(p => {
      console.log(`   - ID: ${p.id}`);
      console.log(`   - Nombre: ${p.name}`);
      console.log(`   - Estado: ${p.status}`);
      console.log(`   - User ID: ${p.user_id}`);
    });
    
    const mainPropertyId = properties[0]?.id;
    
    // 2. Verificar user_properties
    console.log('\n📌 PASO 2: Verificar tabla USER_PROPERTIES');
    console.log('-'.repeat(70));
    
    const { data: userProperties, error: upError } = await supabase
      .from('user_properties')
      .select('*');
    
    if (upError) {
      console.error('❌ Error:', upError.message);
      return;
    }
    
    console.log('✅ User Properties encontradas:', userProperties.length);
    userProperties.forEach(up => {
      console.log(`   - ID: ${up.id}`);
      console.log(`   - Nombre: ${up.property_name}`);
      console.log(`   - Main Property ID: ${up.main_property_id}`);
      console.log(`   - User ID: ${up.user_id}`);
    });
    
    const userPropertyId = userProperties[0]?.id;
    
    // 3. Verificar configuración iCal
    console.log('\n📌 PASO 3: Verificar tabla ICAL_CONFIGS');
    console.log('-'.repeat(70));
    
    const { data: icalConfigs, error: icalError } = await supabase
      .from('ical_configs')
      .select('*');
    
    if (icalError) {
      console.error('❌ Error:', icalError.message);
      return;
    }
    
    console.log('✅ Configuraciones iCal encontradas:', icalConfigs.length);
    icalConfigs.forEach(ic => {
      console.log(`   - ID: ${ic.id}`);
      console.log(`   - Nombre: ${ic.ical_name}`);
      console.log(`   - URL: ${ic.ical_url}`);
      console.log(`   - Property ID (user_properties): ${ic.property_id}`);
      console.log(`   - Estado: ${ic.sync_status}`);
      console.log(`   - Última sincronización: ${ic.last_sync_at}`);
      console.log(`   - Activo: ${ic.is_active}`);
    });
    
    // 4. Verificar reservas sincronizadas
    console.log('\n📌 PASO 4: Verificar tabla SYNCED_BOOKINGS');
    console.log('-'.repeat(70));
    
    const { data: syncedBookings, error: sbError } = await supabase
      .from('synced_bookings')
      .select('*')
      .order('check_in_date', { ascending: false });
    
    if (sbError) {
      console.error('❌ Error:', sbError.message);
      return;
    }
    
    console.log('✅ Reservas sincronizadas encontradas:', syncedBookings.length);
    syncedBookings.forEach(sb => {
      console.log(`   - ID: ${sb.id}`);
      console.log(`   - Property ID (user_properties): ${sb.property_id}`);
      console.log(`   - Booking Source: ${sb.booking_source}`);
      console.log(`   - Guest Name: ${sb.guest_name || '(no disponible)'}`);
      console.log(`   - Check-in: ${sb.check_in_date}`);
      console.log(`   - Check-out: ${sb.check_out_date}`);
      console.log(`   - Status: ${sb.booking_status}`);
      console.log('');
    });
    
    // 5. Probar query con JOIN (como lo hace el frontend)
    console.log('\n📌 PASO 5: Probar QUERY CON JOIN (simulando frontend)');
    console.log('-'.repeat(70));
    
    const { data: joinedData, error: joinError } = await supabase
      .from('synced_bookings')
      .select(`
        *,
        user_properties(property_name),
        ical_configs(ical_name)
      `)
      .order('check_in_date', { ascending: false });
    
    if (joinError) {
      console.error('❌ Error en JOIN:', joinError.message);
    } else {
      console.log('✅ Query con JOIN exitosa. Resultados:', joinedData.length);
      joinedData.forEach((item, index) => {
        console.log(`\n   Reserva ${index + 1}:`);
        console.log(`   - Booking UID: ${item.booking_uid}`);
        console.log(`   - Property Name (JOIN): ${item.user_properties?.property_name || 'NULL'}`);
        console.log(`   - iCal Name (JOIN): ${item.ical_configs?.ical_name || 'NULL'}`);
        console.log(`   - Check-in: ${item.check_in_date}`);
        console.log(`   - Guest: ${item.guest_name || '(no disponible)'}`);
      });
    }
    
    // 6. Verificar reservas manuales
    console.log('\n📌 PASO 6: Verificar tabla RESERVATIONS (manuales)');
    console.log('-'.repeat(70));
    
    const { data: manualReservations, error: manualError } = await supabase
      .from('reservations')
      .select('*')
      .order('checkin_date', { ascending: false });
    
    if (manualError) {
      console.error('❌ Error:', manualError.message);
    } else {
      console.log('✅ Reservas manuales encontradas:', manualReservations.length);
      manualReservations.forEach(r => {
        console.log(`   - ID: ${r.id}`);
        console.log(`   - Property ID (properties): ${r.property_id}`);
        console.log(`   - Property Name: ${r.property_name}`);
        console.log(`   - Guest: ${r.guest_name} ${r.guest_surname}`);
        console.log(`   - Check-in: ${r.checkin_date}`);
        console.log(`   - Status: ${r.status}`);
        console.log('');
      });
    }
    
    // 7. Análisis de compatibilidad de IDs
    console.log('\n📌 PASO 7: ANÁLISIS DE COMPATIBILIDAD DE IDs');
    console.log('-'.repeat(70));
    
    console.log('\n🔑 IDs en el sistema:');
    console.log(`   properties.id (main):          ${mainPropertyId}`);
    console.log(`   user_properties.id:            ${userPropertyId}`);
    console.log(`   user_properties.main_property: ${userProperties[0]?.main_property_id}`);
    console.log(`   synced_bookings.property_id:   ${syncedBookings[0]?.property_id}`);
    console.log(`   reservations.property_id:      ${manualReservations[0]?.property_id}`);
    
    console.log('\n🔍 Verificación de relaciones:');
    
    // Verificar si synced_bookings.property_id coincide con user_properties.id
    const syncedMatchesUserProp = syncedBookings.every(
      sb => sb.property_id === userPropertyId
    );
    console.log(`   ✓ synced_bookings.property_id → user_properties.id: ${syncedMatchesUserProp ? '✅ Correcto' : '❌ Incorrecto'}`);
    
    // Verificar si user_properties.main_property_id coincide con properties.id
    const userPropMatchesMain = userProperties.every(
      up => up.main_property_id === mainPropertyId
    );
    console.log(`   ✓ user_properties.main_property_id → properties.id: ${userPropMatchesMain ? '✅ Correcto' : '❌ Incorrecto'}`);
    
    // Verificar si reservations.property_id coincide con properties.id
    const manualMatchesMain = manualReservations.every(
      r => r.property_id === mainPropertyId
    );
    console.log(`   ✓ reservations.property_id → properties.id: ${manualMatchesMain ? '✅ Correcto' : '❌ Incorrecto'}`);
    
    // 8. Diagnóstico de mapeo del frontend
    console.log('\n📌 PASO 8: DIAGNÓSTICO DE MAPEO DEL FRONTEND');
    console.log('-'.repeat(70));
    
    console.log('\n🔍 Mapeo de reservas sincronizadas:');
    console.log('   El servicio mapea synced_bookings a FrontendReservation');
    console.log('   propertyId mapeado: synced_booking.property_id (user_properties.id)');
    console.log('   Problema detectado: ');
    console.log('   - synced_bookings.property_id apunta a user_properties.id');
    console.log('   - Pero el filtro en UI usa properties.id');
    console.log('   - En este caso son iguales, así que NO debería haber problema');
    
    // 9. Verificar por qué no se muestran
    console.log('\n📌 PASO 9: VERIFICAR CAUSA DE NO VISUALIZACIÓN');
    console.log('-'.repeat(70));
    
    // Simular el mapeo del frontend
    const mappedSynced = joinedData.map(booking => ({
      id: `synced-${booking.id}`,
      propertyId: booking.property_id, // Este es user_properties.id
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      guestName: booking.guest_name || 'No disponible',
      source: booking.ical_configs?.ical_name || 'iCal',
      status: booking.booking_status
    }));
    
    console.log('\n✅ Reservas sincronizadas mapeadas:', mappedSynced.length);
    mappedSynced.forEach(r => {
      console.log(`   - ID: ${r.id}`);
      console.log(`   - Property ID: ${r.propertyId}`);
      console.log(`   - Guest: ${r.guestName}`);
      console.log(`   - Dates: ${r.checkInDate} → ${r.checkOutDate}`);
      console.log('');
    });
    
    // 10. Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DEL DIAGNÓSTICO');
    console.log('='.repeat(70));
    
    console.log('\n✅ Datos encontrados:');
    console.log(`   - Propiedades: ${properties.length}`);
    console.log(`   - User Properties: ${userProperties.length}`);
    console.log(`   - Configuraciones iCal: ${icalConfigs.length}`);
    console.log(`   - Reservas sincronizadas: ${syncedBookings.length}`);
    console.log(`   - Reservas manuales: ${manualReservations.length}`);
    
    console.log('\n🔍 Estado del sistema:');
    console.log(`   - iCal sincronizado: ${icalConfigs[0]?.sync_status}`);
    console.log(`   - Última sync: ${icalConfigs[0]?.last_sync_at}`);
    console.log(`   - iCal activo: ${icalConfigs[0]?.is_active}`);
    
    console.log('\n⚠️  Posibles problemas:');
    if (syncedBookings.length === 0) {
      console.log('   ❌ No hay reservas sincronizadas en la BD');
    } else if (!joinedData || joinedData.length === 0) {
      console.log('   ❌ El JOIN no está retornando datos');
    } else {
      console.log('   ✅ Los datos existen y el JOIN funciona');
      console.log('   🤔 El problema podría estar en:');
      console.log('      1. Filtrado por propiedad en el frontend');
      console.log('      2. Filtrado por fechas (pasadas vs actuales)');
      console.log('      3. RLS (Row Level Security) policies');
      console.log('      4. Estado de autenticación del usuario');
    }
    
    console.log('\n✅ Diagnóstico completado');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error);
  }
}

// Ejecutar diagnóstico
runDiagnostics();

