// src/features/sesregistro/data/municipalities.ts
/**
 * Lista de municipios españoles con códigos INE
 * Fuente: Instituto Nacional de Estadística (INE)
 * 
 * Estructura del código INE: PPMMM
 * - PP: Código de provincia (2 dígitos)
 * - MMM: Código de municipio dentro de la provincia (3 dígitos)
 */

export interface Municipality {
  ineCode: string;      // Código INE (5 dígitos)
  name: string;         // Nombre del municipio
  province: string;     // Nombre de la provincia
  provinceCode: string; // Código de la provincia (2 dígitos)
}

/**
 * Lista de municipios españoles más importantes
 * Ordenados por provincia para facilitar búsquedas
 */
export const MUNICIPALITIES: Municipality[] = [
  // ANDALUCÍA
  // Almería (04)
  { ineCode: '04003', name: 'Almería', province: 'Almería', provinceCode: '04' },
  { ineCode: '04013', name: 'El Ejido', province: 'Almería', provinceCode: '04' },
  { ineCode: '04904', name: 'Roquetas de Mar', province: 'Almería', provinceCode: '04' },
  
  // Cádiz (11)
  { ineCode: '11012', name: 'Cádiz', province: 'Cádiz', provinceCode: '11' },
  { ineCode: '11020', name: 'Jerez de la Frontera', province: 'Cádiz', provinceCode: '11' },
  { ineCode: '11006', name: 'Algeciras', province: 'Cádiz', provinceCode: '11' },
  { ineCode: '11027', name: 'El Puerto de Santa María', province: 'Cádiz', provinceCode: '11' },
  { ineCode: '11001', name: 'Arcos de la Frontera', province: 'Cádiz', provinceCode: '11' },
  { ineCode: '11015', name: 'Chiclana de la Frontera', province: 'Cádiz', provinceCode: '11' },
  { ineCode: '11031', name: 'San Fernando', province: 'Cádiz', provinceCode: '11' },
  { ineCode: '11032', name: 'Sanlúcar de Barrameda', province: 'Cádiz', provinceCode: '11' },
  
  // Córdoba (14)
  { ineCode: '14021', name: 'Córdoba', province: 'Córdoba', provinceCode: '14' },
  { ineCode: '14050', name: 'Lucena', province: 'Córdoba', provinceCode: '14' },
  { ineCode: '14055', name: 'Puente Genil', province: 'Córdoba', provinceCode: '14' },
  
  // Granada (18)
  { ineCode: '18087', name: 'Granada', province: 'Granada', provinceCode: '18' },
  { ineCode: '18140', name: 'Motril', province: 'Granada', provinceCode: '18' },
  { ineCode: '18002', name: 'Almuñécar', province: 'Granada', provinceCode: '18' },
  
  // Huelva (21)
  { ineCode: '21041', name: 'Huelva', province: 'Huelva', provinceCode: '21' },
  { ineCode: '21050', name: 'Lepe', province: 'Huelva', provinceCode: '21' },
  
  // Jaén (23)
  { ineCode: '23050', name: 'Jaén', province: 'Jaén', provinceCode: '23' },
  { ineCode: '23003', name: 'Andújar', province: 'Jaén', provinceCode: '23' },
  { ineCode: '23055', name: 'Linares', province: 'Jaén', provinceCode: '23' },
  
  // Málaga (29)
  { ineCode: '29067', name: 'Málaga', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29054', name: 'Marbella', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29051', name: 'Mijas', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29025', name: 'Benalmádena', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29047', name: 'Fuengirola', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29094', name: 'Torremolinos', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29015', name: 'Antequera', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29100', name: 'Vélez-Málaga', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29040', name: 'Estepona', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29075', name: 'Rincón de la Victoria', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29901', name: 'Ronda', province: 'Málaga', provinceCode: '29' },
  { ineCode: '29093', name: 'Torre del Mar', province: 'Málaga', provinceCode: '29' },
  
  // Sevilla (41)
  { ineCode: '41091', name: 'Sevilla', province: 'Sevilla', provinceCode: '41' },
  { ineCode: '41020', name: 'Dos Hermanas', province: 'Sevilla', provinceCode: '41' },
  { ineCode: '41004', name: 'Alcalá de Guadaíra', province: 'Sevilla', provinceCode: '41' },
  { ineCode: '41038', name: 'Mairena del Aljarafe', province: 'Sevilla', provinceCode: '41' },
  { ineCode: '41087', name: 'San Juan de Aznalfarache', province: 'Sevilla', provinceCode: '41' },
  { ineCode: '41086', name: 'Écija', province: 'Sevilla', provinceCode: '41' },
  
  // ARAGÓN
  // Huesca (22)
  { ineCode: '22125', name: 'Huesca', province: 'Huesca', provinceCode: '22' },
  
  // Teruel (44)
  { ineCode: '44216', name: 'Teruel', province: 'Teruel', provinceCode: '44' },
  
  // Zaragoza (50)
  { ineCode: '50297', name: 'Zaragoza', province: 'Zaragoza', provinceCode: '50' },
  { ineCode: '50085', name: 'Calatayud', province: 'Zaragoza', provinceCode: '50' },
  
  // ASTURIAS
  // Asturias (33)
  { ineCode: '33044', name: 'Oviedo', province: 'Asturias', provinceCode: '33' },
  { ineCode: '33024', name: 'Gijón', province: 'Asturias', provinceCode: '33' },
  { ineCode: '33001', name: 'Avilés', province: 'Asturias', provinceCode: '33' },
  
  // ISLAS BALEARES
  // Baleares (07)
  { ineCode: '07040', name: 'Palma', province: 'Illes Balears', provinceCode: '07' },
  { ineCode: '07064', name: 'Calvià', province: 'Illes Balears', provinceCode: '07' },
  { ineCode: '07026', name: 'Ibiza', province: 'Illes Balears', provinceCode: '07' },
  { ineCode: '07032', name: 'Manacor', province: 'Illes Balears', provinceCode: '07' },
  
  // CANARIAS
  // Las Palmas (35)
  { ineCode: '35016', name: 'Las Palmas de Gran Canaria', province: 'Las Palmas', provinceCode: '35' },
  { ineCode: '35031', name: 'Telde', province: 'Las Palmas', provinceCode: '35' },
  { ineCode: '35006', name: 'Arrecife', province: 'Las Palmas', provinceCode: '35' },
  
  // Santa Cruz de Tenerife (38)
  { ineCode: '38038', name: 'Santa Cruz de Tenerife', province: 'Santa Cruz de Tenerife', provinceCode: '38' },
  { ineCode: '38023', name: 'San Cristóbal de La Laguna', province: 'Santa Cruz de Tenerife', provinceCode: '38' },
  { ineCode: '38004', name: 'Adeje', province: 'Santa Cruz de Tenerife', provinceCode: '38' },
  { ineCode: '38001', name: 'Arona', province: 'Santa Cruz de Tenerife', provinceCode: '38' },
  
  // CANTABRIA
  // Cantabria (39)
  { ineCode: '39075', name: 'Santander', province: 'Cantabria', provinceCode: '39' },
  { ineCode: '39087', name: 'Torrelavega', province: 'Cantabria', provinceCode: '39' },
  
  // CASTILLA Y LEÓN
  // Ávila (05)
  { ineCode: '05019', name: 'Ávila', province: 'Ávila', provinceCode: '05' },
  
  // Burgos (09)
  { ineCode: '09059', name: 'Burgos', province: 'Burgos', provinceCode: '09' },
  { ineCode: '09017', name: 'Aranda de Duero', province: 'Burgos', provinceCode: '09' },
  
  // León (24)
  { ineCode: '24089', name: 'León', province: 'León', provinceCode: '24' },
  { ineCode: '24115', name: 'Ponferrada', province: 'León', provinceCode: '24' },
  
  // Palencia (34)
  { ineCode: '34120', name: 'Palencia', province: 'Palencia', provinceCode: '34' },
  
  // Salamanca (37)
  { ineCode: '37274', name: 'Salamanca', province: 'Salamanca', provinceCode: '37' },
  
  // Segovia (40)
  { ineCode: '40194', name: 'Segovia', province: 'Segovia', provinceCode: '40' },
  
  // Soria (42)
  { ineCode: '42173', name: 'Soria', province: 'Soria', provinceCode: '42' },
  
  // Valladolid (47)
  { ineCode: '47186', name: 'Valladolid', province: 'Valladolid', provinceCode: '47' },
  
  // Zamora (49)
  { ineCode: '49275', name: 'Zamora', province: 'Zamora', provinceCode: '49' },
  
  // CASTILLA-LA MANCHA
  // Albacete (02)
  { ineCode: '02003', name: 'Albacete', province: 'Albacete', provinceCode: '02' },
  
  // Ciudad Real (13)
  { ineCode: '13034', name: 'Ciudad Real', province: 'Ciudad Real', provinceCode: '13' },
  { ineCode: '13075', name: 'Puertollano', province: 'Ciudad Real', provinceCode: '13' },
  
  // Cuenca (16)
  { ineCode: '16078', name: 'Cuenca', province: 'Cuenca', provinceCode: '16' },
  
  // Guadalajara (19)
  { ineCode: '19130', name: 'Guadalajara', province: 'Guadalajara', provinceCode: '19' },
  
  // Toledo (45)
  { ineCode: '45168', name: 'Toledo', province: 'Toledo', provinceCode: '45' },
  { ineCode: '45165', name: 'Talavera de la Reina', province: 'Toledo', provinceCode: '45' },
  
  // CATALUÑA
  // Barcelona (08)
  { ineCode: '08019', name: 'Barcelona', province: 'Barcelona', provinceCode: '08' },
  { ineCode: '08015', name: 'Badalona', province: 'Barcelona', provinceCode: '08' },
  { ineCode: '08245', name: 'L\'Hospitalet de Llobregat', province: 'Barcelona', provinceCode: '08' },
  { ineCode: '08277', name: 'Sabadell', province: 'Barcelona', provinceCode: '08' },
  { ineCode: '08279', name: 'Terrassa', province: 'Barcelona', provinceCode: '08' },
  { ineCode: '08101', name: 'Granollers', province: 'Barcelona', provinceCode: '08' },
  { ineCode: '08171', name: 'Mataró', province: 'Barcelona', provinceCode: '08' },
  { ineCode: '08301', name: 'Santa Coloma de Gramenet', province: 'Barcelona', provinceCode: '08' },
  { ineCode: '08193', name: 'El Prat de Llobregat', province: 'Barcelona', provinceCode: '08' },
  
  // Girona (17)
  { ineCode: '17079', name: 'Girona', province: 'Girona', provinceCode: '17' },
  
  // Lleida (25)
  { ineCode: '25120', name: 'Lleida', province: 'Lleida', provinceCode: '25' },
  
  // Tarragona (43)
  { ineCode: '43148', name: 'Tarragona', province: 'Tarragona', provinceCode: '43' },
  { ineCode: '43123', name: 'Reus', province: 'Tarragona', provinceCode: '43' },
  
  // COMUNIDAD VALENCIANA
  // Alicante (03)
  { ineCode: '03014', name: 'Alicante', province: 'Alicante', provinceCode: '03' },
  { ineCode: '03065', name: 'Elche', province: 'Alicante', provinceCode: '03' },
  { ineCode: '03031', name: 'Benidorm', province: 'Alicante', provinceCode: '03' },
  { ineCode: '03012', name: 'Alcoy', province: 'Alicante', provinceCode: '03' },
  { ineCode: '03139', name: 'Torrevieja', province: 'Alicante', provinceCode: '03' },
  { ineCode: '03089', name: 'Orihuela', province: 'Alicante', provinceCode: '03' },
  
  // Castellón (12)
  { ineCode: '12040', name: 'Castellón de la Plana', province: 'Castellón', provinceCode: '12' },
  
  // Valencia (46)
  { ineCode: '46250', name: 'València', province: 'Valencia', provinceCode: '46' },
  { ineCode: '46102', name: 'Gandia', province: 'Valencia', provinceCode: '46' },
  { ineCode: '46186', name: 'Paterna', province: 'Valencia', provinceCode: '46' },
  { ineCode: '46258', name: 'Torrent', province: 'Valencia', provinceCode: '46' },
  { ineCode: '46131', name: 'Mislata', province: 'Valencia', provinceCode: '46' },
  
  // EXTREMADURA
  // Badajoz (06)
  { ineCode: '06015', name: 'Badajoz', province: 'Badajoz', provinceCode: '06' },
  { ineCode: '06083', name: 'Mérida', province: 'Badajoz', provinceCode: '06' },
  
  // Cáceres (10)
  { ineCode: '10037', name: 'Cáceres', province: 'Cáceres', provinceCode: '10' },
  
  // GALICIA
  // A Coruña (15)
  { ineCode: '15030', name: 'A Coruña', province: 'A Coruña', provinceCode: '15' },
  { ineCode: '15078', name: 'Santiago de Compostela', province: 'A Coruña', provinceCode: '15' },
  { ineCode: '15036', name: 'Ferrol', province: 'A Coruña', provinceCode: '15' },
  
  // Lugo (27)
  { ineCode: '27028', name: 'Lugo', province: 'Lugo', provinceCode: '27' },
  
  // Ourense (32)
  { ineCode: '32054', name: 'Ourense', province: 'Ourense', provinceCode: '32' },
  
  // Pontevedra (36)
  { ineCode: '36038', name: 'Vigo', province: 'Pontevedra', provinceCode: '36' },
  { ineCode: '36057', name: 'Pontevedra', province: 'Pontevedra', provinceCode: '36' },
  
  // LA RIOJA
  // La Rioja (26)
  { ineCode: '26089', name: 'Logroño', province: 'La Rioja', provinceCode: '26' },
  
  // COMUNIDAD DE MADRID
  // Madrid (28)
  { ineCode: '28079', name: 'Madrid', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28006', name: 'Alcalá de Henares', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28007', name: 'Alcobendas', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28013', name: 'Alcorcón', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28047', name: 'Fuenlabrada', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28058', name: 'Getafe', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28065', name: 'Leganés', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28080', name: 'Majadahonda', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28092', name: 'Móstoles', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28123', name: 'Pozuelo de Alarcón', province: 'Madrid', provinceCode: '28' },
  { ineCode: '28148', name: 'Torrejón de Ardoz', province: 'Madrid', provinceCode: '28' },
  
  // REGIÓN DE MURCIA
  // Murcia (30)
  { ineCode: '30030', name: 'Murcia', province: 'Murcia', provinceCode: '30' },
  { ineCode: '30016', name: 'Cartagena', province: 'Murcia', provinceCode: '30' },
  { ineCode: '30024', name: 'Lorca', province: 'Murcia', provinceCode: '30' },
  
  // COMUNIDAD FORAL DE NAVARRA
  // Navarra (31)
  { ineCode: '31201', name: 'Pamplona', province: 'Navarra', provinceCode: '31' },
  
  // PAÍS VASCO
  // Álava (01)
  { ineCode: '01059', name: 'Vitoria-Gasteiz', province: 'Álava', provinceCode: '01' },
  
  // Gipuzkoa (20)
  { ineCode: '20069', name: 'Donostia-San Sebastián', province: 'Gipuzkoa', provinceCode: '20' },
  { ineCode: '20055', name: 'Irún', province: 'Gipuzkoa', provinceCode: '20' },
  
  // Bizkaia (48)
  { ineCode: '48020', name: 'Bilbao', province: 'Bizkaia', provinceCode: '48' },
  { ineCode: '48015', name: 'Barakaldo', province: 'Bizkaia', provinceCode: '48' },
  { ineCode: '48044', name: 'Getxo', province: 'Bizkaia', provinceCode: '48' },
  
  // CEUTA Y MELILLA
  // Ceuta (51)
  { ineCode: '51001', name: 'Ceuta', province: 'Ceuta', provinceCode: '51' },
  
  // Melilla (52)
  { ineCode: '52001', name: 'Melilla', province: 'Melilla', provinceCode: '52' },
];

/**
 * Normalizar texto para búsquedas: elimina tildes, convierte a minúsculas
 * Ejemplos: "Málaga" → "malaga", "Córdoba" → "cordoba"
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                    // Descompone "á" en "a" + tilde
    .replace(/[\u0300-\u036f]/g, '')     // Elimina diacríticos (tildes)
    .trim();
}

/**
 * Buscar municipios por nombre con ranking inteligente
 * 
 * Ranking de resultados:
 * 1. Coincidencia exacta normalizada (ej: "malaga" → "Málaga")
 * 2. Comienza con el query (ej: "torre" → "Torremolinos", "Torre del Mar")
 * 3. Contiene el query (ej: "villa" → "Sevilla")
 * 
 * @param query - Texto de búsqueda
 * @param maxResults - Máximo número de resultados (default: 10)
 * @returns Array de municipios ordenados por relevancia
 */
export function searchMunicipalities(query: string, maxResults: number = 10): Municipality[] {
  if (query.length < 2) {
    return [];
  }

  const normalizedQuery = normalizeText(query);
  
  // Clasificar resultados por tipo de match
  const exactMatches: Municipality[] = [];
  const startsWithMatches: Municipality[] = [];
  const containsMatches: Municipality[] = [];

  for (const municipality of MUNICIPALITIES) {
    const normalizedName = normalizeText(municipality.name);
    
    if (normalizedName === normalizedQuery) {
      // Coincidencia exacta: máxima prioridad
      exactMatches.push(municipality);
    } else if (normalizedName.startsWith(normalizedQuery)) {
      // Comienza con: segunda prioridad
      startsWithMatches.push(municipality);
    } else if (normalizedName.includes(normalizedQuery)) {
      // Contiene: tercera prioridad
      containsMatches.push(municipality);
    }
  }

  // Combinar resultados: exact > startsWith > contains
  return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, maxResults);
}

/**
 * Buscar municipio por nombre exacto (normalizado)
 * Útil para auto-corrección de autocompletado del navegador
 * 
 * @param name - Nombre del municipio (puede tener o no tildes)
 * @returns Municipio encontrado o undefined
 */
export function findMunicipalityByName(name: string): Municipality | undefined {
  const normalizedQuery = normalizeText(name);
  return MUNICIPALITIES.find(m => normalizeText(m.name) === normalizedQuery);
}

/**
 * Buscar municipio por código INE
 * 
 * @param ineCode - Código INE (5 dígitos)
 * @returns Municipio encontrado o undefined
 */
export function findMunicipalityByIneCode(ineCode: string): Municipality | undefined {
  return MUNICIPALITIES.find(m => m.ineCode === ineCode);
}

