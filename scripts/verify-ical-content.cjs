// scripts/verify-ical-content.cjs
// Verificar el contenido actual del iCal de Booking.com

const https = require('https');

const ICAL_URL = 'https://ical.booking.com/v1/export?t=dc154f3f-cc84-4db8-b8d2-36c3f4101f84';

console.log('🔍 VERIFICANDO CONTENIDO DEL ICAL\n');
console.log('='.repeat(70));
console.log(`URL: ${ICAL_URL}\n`);

https.get(ICAL_URL, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 CONTENIDO COMPLETO DEL ICAL:\n');
    console.log(data);
    console.log('\n' + '='.repeat(70));
    
    // Parsear eventos
    const events = [];
    const eventBlocks = data.split('BEGIN:VEVENT');
    
    for (let i = 1; i < eventBlocks.length; i++) {
      const block = eventBlocks[i];
      
      // Extraer datos del evento
      const uidMatch = block.match(/UID:(.+)/);
      const summaryMatch = block.match(/SUMMARY:(.+)/);
      const dtstartMatch = block.match(/DTSTART;VALUE=DATE:(\d{8})/);
      const dtendMatch = block.match(/DTEND;VALUE=DATE:(\d{8})/);
      
      if (dtstartMatch && dtendMatch) {
        const startDate = dtstartMatch[1];
        const endDate = dtendMatch[1];
        
        events.push({
          uid: uidMatch ? uidMatch[1] : 'unknown',
          summary: summaryMatch ? summaryMatch[1] : 'unknown',
          start: `${startDate.substr(0,4)}-${startDate.substr(4,2)}-${startDate.substr(6,2)}`,
          end: `${endDate.substr(0,4)}-${endDate.substr(4,2)}-${endDate.substr(6,2)}`,
        });
      }
    }
    
    console.log('\n📅 EVENTOS ENCONTRADOS:', events.length);
    console.log('='.repeat(70));
    
    const today = new Date().toISOString().split('T')[0];
    
    events.forEach((event, index) => {
      const isFuture = event.end >= today;
      console.log(`\n${index + 1}. ${isFuture ? '🔮 FUTURA' : '📜 PASADA'}`);
      console.log(`   Summary: ${event.summary}`);
      console.log(`   Dates: ${event.start} → ${event.end}`);
      console.log(`   UID: ${event.uid}`);
    });
    
    const futureEvents = events.filter(e => e.end >= today);
    const pastEvents = events.filter(e => e.end < today);
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN:');
    console.log(`   Total eventos: ${events.length}`);
    console.log(`   Futuras: ${futureEvents.length}`);
    console.log(`   Pasadas: ${pastEvents.length}`);
    console.log(`   Fecha actual: ${today}`);
    console.log('='.repeat(70));
    
    if (futureEvents.length > 0) {
      console.log('\n✅ HAY RESERVAS FUTURAS EN EL ICAL');
      console.log('⚠️  Necesitas ejecutar la sincronización para actualizar la BD');
    } else {
      console.log('\n❌ NO HAY RESERVAS FUTURAS EN EL ICAL');
      console.log('ℹ️  El iCal solo contiene reservas pasadas');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error al obtener el iCal:', err.message);
});

