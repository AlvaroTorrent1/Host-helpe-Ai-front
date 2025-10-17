// scripts/test-reservations-simple.js
// Test simple para verificar reservas en el browser console

// Este script debe ejecutarse en la consola del navegador
// cuando estés en la página de reservas

console.log('🔍 TEST DE RESERVAS - DIAGNÓSTICO SIMPLE');
console.log('='.repeat(70));

// 1. Verificar servicio de reservas
console.log('\n📌 PASO 1: Verificar servicio de reservas disponible');
if (typeof reservationService !== 'undefined') {
  console.log('✅ reservationService está disponible');
} else {
  console.error('❌ reservationService NO está disponible');
  console.log('💡 Importa el servicio manualmente:');
  console.log('   import { reservationService } from "@/services/reservationService"');
}

// 2. Obtener todas las reservas
console.log('\n📌 PASO 2: Obtener todas las reservas');
console.log('Ejecuta en la consola:');
console.log(`
// Importar el servicio
import { reservationService } from './src/services/reservationService';

// Obtener reservas
const reservations = await reservationService.getReservations();
console.log('Total reservas:', reservations.length);
console.log('Reservas:', reservations);

// Filtrar solo las sincronizadas
const synced = reservations.filter(r => r.isSynced);
console.log('Reservas sincronizadas:', synced.length);
console.log('Detalles:', synced);

// Ver property IDs
console.log('Property IDs de reservas sincronizadas:', 
  synced.map(r => ({ id: r.id, propertyId: r.propertyId, source: r.syncSource }))
);
`);

console.log('\n📌 PASO 3: Verificar directamente en Supabase');
console.log('Ejecuta en la consola:');
console.log(`
// Importar supabase
import { supabase } from './src/services/supabase';

// Query directa a synced_bookings
const { data, error } = await supabase
  .from('synced_bookings')
  .select(\`
    *,
    user_properties(property_name),
    ical_configs(ical_name)
  \`)
  .order('check_in_date', { ascending: false });

console.log('Error:', error);
console.log('Reservas en DB:', data);
console.log('Total:', data?.length);
`);

console.log('\n📌 PASO 4: Verificar filtrado en la UI');
console.log('Una vez que tengas las reservas, verifica:');
console.log('1. ¿Las reservas tienen el campo isSynced = true?');
console.log('2. ¿El propertyId coincide con el filtro de la UI?');
console.log('3. ¿Las fechas están en el rango correcto (actuales vs pasadas)?');
console.log('4. ¿El status está mapeado correctamente?');

console.log('\n' + '='.repeat(70));
console.log('✅ Instrucciones listadas. Copia y pega los comandos en la consola.');

