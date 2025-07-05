// scripts/test-reservations-table.js
// Script para probar la tabla de reservas en Supabase

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Variables de entorno:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ No configurada');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar configuradas');
  console.error('Asegúrate de que estas variables estén definidas en tu archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReservationsTable() {
  console.log('🧪 Probando la tabla de reservas...\n');

  try {
    // 1. Obtener una propiedad existente para la prueba
    console.log('1️⃣ Obteniendo una propiedad existente...');
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name')
      .limit(1);

    if (propError) {
      throw new Error(`Error al obtener propiedades: ${propError.message}`);
    }

    if (!properties || properties.length === 0) {
      throw new Error('No se encontraron propiedades. Crea al menos una propiedad primero.');
    }

    const propertyId = properties[0].id;
    console.log(`✅ Propiedad encontrada: ${properties[0].name} (ID: ${propertyId})\n`);

    // 2. Crear una reserva de prueba
    console.log('2️⃣ Creando reserva de prueba...');
    const testReservation = {
      property_id: propertyId,
      guest_name: 'Juan',
      guest_surname: 'Pérez',
      phone_number: '+34 600 123 456',
      nationality: 'ES',
      checkin_date: '2025-02-01',
      checkout_date: '2025-02-05',
      notes: 'Reserva de prueba creada automáticamente',
      status: 'active'
    };

    const { data: newReservation, error: createError } = await supabase
      .from('reservations')
      .insert([testReservation])
      .select()
      .single();

    if (createError) {
      throw new Error(`Error al crear reserva: ${createError.message}`);
    }

    console.log('✅ Reserva creada exitosamente:');
    console.log(JSON.stringify(newReservation, null, 2));
    console.log('');

    // 3. Leer la reserva creada
    console.log('3️⃣ Leyendo la reserva creada...');
    const { data: readReservation, error: readError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', newReservation.id)
      .single();

    if (readError) {
      throw new Error(`Error al leer reserva: ${readError.message}`);
    }

    console.log('✅ Reserva leída correctamente');
    console.log('');

    // 4. Actualizar la reserva
    console.log('4️⃣ Actualizando la reserva...');
    const { data: updatedReservation, error: updateError } = await supabase
      .from('reservations')
      .update({ notes: 'Reserva actualizada por el script de prueba' })
      .eq('id', newReservation.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Error al actualizar reserva: ${updateError.message}`);
    }

    console.log('✅ Reserva actualizada correctamente');
    console.log('');

    // 5. Verificar disponibilidad
    console.log('5️⃣ Verificando disponibilidad para fechas conflictivas...');
    const { data: conflicts, error: availError } = await supabase
      .from('reservations')
      .select('id')
      .eq('property_id', propertyId)
      .neq('status', 'cancelled')
      .or(`checkin_date.lte.2025-02-03,checkout_date.gte.2025-02-03`);

    if (availError) {
      throw new Error(`Error al verificar disponibilidad: ${availError.message}`);
    }

    console.log(`✅ Encontradas ${conflicts?.length || 0} reservas conflictivas`);
    console.log('');

    // 6. Cancelar la reserva
    console.log('6️⃣ Cancelando la reserva...');
    const { error: cancelError } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', newReservation.id);

    if (cancelError) {
      throw new Error(`Error al cancelar reserva: ${cancelError.message}`);
    }

    console.log('✅ Reserva cancelada correctamente');
    console.log('');

    // 7. Eliminar la reserva de prueba
    console.log('7️⃣ Eliminando la reserva de prueba...');
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', newReservation.id);

    if (deleteError) {
      throw new Error(`Error al eliminar reserva: ${deleteError.message}`);
    }

    console.log('✅ Reserva eliminada correctamente');
    console.log('');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('La tabla de reservas está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar las pruebas
testReservationsTable(); 