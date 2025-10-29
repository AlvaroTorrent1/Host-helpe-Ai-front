// src/features/sesregistro/components/TravelerReportPDF.tsx
/**
 * Template PDF para partes de viajeros
 * Usa @react-pdf/renderer para generar documentos PDF descargables
 * Muestra datos completos del viajero, reserva y firma
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Registrar fuentes (opcional, por defecto usa Helvetica)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf',
// });

// Estilos del PDF (optimizado para una sola página)
const styles = StyleSheet.create({
  page: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 8,
    borderBottom: '2 solid #FF6B35',
    paddingBottom: 8,
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height: 110,
    objectFit: 'contain',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 3,
  },
  section: {
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
    backgroundColor: '#F3F4F6',
    padding: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '40%',
    fontSize: 9,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    fontSize: 9,
    color: '#1F2937',
  },
  signature: {
    marginTop: 5,
    alignItems: 'center',
  },
  signatureImage: {
    maxWidth: 180,
    maxHeight: 60,
    border: '1 solid #D1D5DB',
    padding: 3,
  },
  signatureLabel: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 7,
    color: '#9CA3AF',
    borderTop: '1 solid #E5E7EB',
    paddingTop: 5,
  },
});

// Individual traveler data
export interface TravelerData {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  nationality: string;
  birthDate: string;
  gender?: string;
  email: string;
  phone?: string;
  
  // Address (specific to each traveler)
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;
}

// Tipos para los datos del PDF
// NOW SUPPORTS MULTIPLE TRAVELERS (array)
export interface TravelerReportPDFData {
  // Datos de la reserva (shared across all travelers)
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights?: number;
  
  // Array of ALL travelers (supports 1 to N travelers)
  // Each traveler will get their own page in the PDF
  travelers: TravelerData[];
  
  // Pago (shared across all travelers)
  paymentMethod?: string;
  paymentHolder?: string;
  
  // Firma (shared across all travelers)
  signatureUrl?: string;
  
  // Logo de la empresa (base64)
  logoBase64?: string;
  
  // Metadata
  submittedAt: string;
  formRequestId?: string;
  
  // Legacy single-traveler fields (for backwards compatibility)
  // These will be ignored if 'travelers' array is provided
  firstName?: string;
  lastName?: string;
  documentType?: string;
  documentNumber?: string;
  nationality?: string;
  birthDate?: string;
  gender?: string;
  email?: string;
  phone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;
}

// Helper component to render a single traveler page
const TravelerPage: React.FC<{
  traveler: TravelerData;
  data: TravelerReportPDFData;
  travelerIndex: number;
  totalTravelers: number;
}> = ({ traveler, data, travelerIndex, totalTravelers }) => {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header con logo y título */}
      <View style={styles.header}>
        {/* Logo de Host Helper */}
        {data.logoBase64 && (
          <Image
            src={data.logoBase64}
            style={styles.logo}
          />
        )}
        
        {/* Título del documento */}
        <Text style={styles.title}>
          PARTE DE ENTRADA DE VIAJERO
          {totalTravelers > 1 && ` (${travelerIndex + 1} de ${totalTravelers})`}
        </Text>
      </View>

      {/* Datos de la Reserva */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATOS DE LA RESERVA</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Propiedad:</Text>
          <Text style={styles.value}>{data.propertyName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha de Entrada:</Text>
          <Text style={styles.value}>{new Date(data.checkInDate).toLocaleDateString('es-ES')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha de Salida:</Text>
          <Text style={styles.value}>{new Date(data.checkOutDate).toLocaleDateString('es-ES')}</Text>
        </View>
        {data.numberOfNights && (
          <View style={styles.row}>
            <Text style={styles.label}>Número de Noches:</Text>
            <Text style={styles.value}>{data.numberOfNights}</Text>
          </View>
        )}
      </View>

      {/* Datos del Viajero */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATOS DEL VIAJERO</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{traveler.firstName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Apellidos:</Text>
          <Text style={styles.value}>{traveler.lastName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo de Documento:</Text>
          <Text style={styles.value}>{traveler.documentType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Número de Documento:</Text>
          <Text style={styles.value}>{traveler.documentNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nacionalidad:</Text>
          <Text style={styles.value}>{traveler.nationality}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha de Nacimiento:</Text>
          <Text style={styles.value}>{new Date(traveler.birthDate).toLocaleDateString('es-ES')}</Text>
        </View>
        {traveler.gender && (
          <View style={styles.row}>
            <Text style={styles.label}>Género:</Text>
            <Text style={styles.value}>{traveler.gender}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{traveler.email}</Text>
        </View>
        {traveler.phone && (
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{traveler.phone}</Text>
          </View>
        )}
      </View>

      {/* Dirección */}
      {(traveler.addressStreet || traveler.addressCity) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DIRECCIÓN</Text>
          {traveler.addressStreet && (
            <View style={styles.row}>
              <Text style={styles.label}>Calle:</Text>
              <Text style={styles.value}>{traveler.addressStreet}</Text>
            </View>
          )}
          {traveler.addressCity && (
            <View style={styles.row}>
              <Text style={styles.label}>Ciudad:</Text>
              <Text style={styles.value}>{traveler.addressCity}</Text>
            </View>
          )}
          {traveler.addressPostalCode && (
            <View style={styles.row}>
              <Text style={styles.label}>Código Postal:</Text>
              <Text style={styles.value}>{traveler.addressPostalCode}</Text>
            </View>
          )}
          {traveler.addressCountry && (
            <View style={styles.row}>
              <Text style={styles.label}>País:</Text>
              <Text style={styles.value}>{traveler.addressCountry}</Text>
            </View>
          )}
        </View>
      )}

      {/* Datos de Pago (shared across all travelers) */}
      {data.paymentMethod && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DE PAGO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Método de Pago:</Text>
            <Text style={styles.value}>{data.paymentMethod}</Text>
          </View>
          {data.paymentHolder && (
            <View style={styles.row}>
              <Text style={styles.label}>Titular:</Text>
              <Text style={styles.value}>{data.paymentHolder}</Text>
            </View>
          )}
        </View>
      )}

      {/* Firma (shared across all travelers) */}
      {data.signatureUrl && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FIRMA DEL VIAJERO</Text>
          <View style={styles.signature}>
            <Image
              src={data.signatureUrl}
              style={styles.signatureImage}
            />
            <Text style={styles.signatureLabel}>
              Firmado digitalmente el {new Date(data.submittedAt).toLocaleDateString('es-ES')} a las{' '}
              {new Date(data.submittedAt).toLocaleTimeString('es-ES')}
            </Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Documento generado automáticamente por Host Helper
        </Text>
        <Text>
          ID del Formulario: {data.formRequestId || 'N/A'} | Fecha de generación:{' '}
          {new Date().toLocaleDateString('es-ES')}
        </Text>
      </View>
    </Page>
  );
};

// Componente del documento PDF
// NOW SUPPORTS MULTIPLE TRAVELERS: Generates one page per traveler
export const TravelerReportDocument: React.FC<{ data: TravelerReportPDFData }> = ({ data }) => {
  // Get travelers array (supports new format with multiple travelers)
  const travelers = data.travelers && data.travelers.length > 0
    ? data.travelers
    : [
        // Fallback to legacy single-traveler format for backwards compatibility
        {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          documentType: data.documentType || '',
          documentNumber: data.documentNumber || '',
          nationality: data.nationality || '',
          birthDate: data.birthDate || '',
          gender: data.gender,
          email: data.email || '',
          phone: data.phone,
          addressStreet: data.addressStreet,
          addressCity: data.addressCity,
          addressPostalCode: data.addressPostalCode,
          addressCountry: data.addressCountry,
        },
      ];

  return (
    <Document>
      {/* Generate one page per traveler */}
      {travelers.map((traveler, index) => (
        <TravelerPage
          key={index}
          traveler={traveler}
          data={data}
          travelerIndex={index}
          totalTravelers={travelers.length}
        />
      ))}
    </Document>
  );
};

export default TravelerReportDocument;

