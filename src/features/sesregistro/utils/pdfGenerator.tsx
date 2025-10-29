// src/features/sesregistro/utils/pdfGenerator.tsx
/**
 * Utilidad para generar y descargar PDFs de partes de viajeros
 * Usa @react-pdf/renderer con renderizado en browser
 */

import { pdf } from '@react-pdf/renderer';
import { TravelerReportDocument, TravelerReportPDFData } from '../components/TravelerReportPDF';

/**
 * Genera un PDF del parte de viajero y lo descarga
 * @param data - Datos del viajero y reserva
 * @param filename - Nombre del archivo a descargar (opcional)
 */
export async function downloadTravelerReportPDF(
  data: TravelerReportPDFData,
  filename?: string
): Promise<void> {
  try {
    // Crear el documento PDF
    const doc = <TravelerReportDocument data={data} />;

    // Generar blob del PDF
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    // Crear nombre del archivo si no se proporciona
    const defaultFilename = `parte-viajero-${data.documentNumber}-${new Date().getTime()}.pdf`;
    const finalFilename = filename || defaultFilename;

    // Crear URL temporal y descargar
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    link.click();

    // Limpiar URL temporal
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error al generar el PDF');
  }
}

/**
 * Genera un blob del PDF sin descargarlo (útil para subir a storage)
 * @param data - Datos del viajero y reserva
 */
export async function generateTravelerReportPDFBlob(
  data: TravelerReportPDFData
): Promise<Blob> {
  try {
    const doc = <TravelerReportDocument data={data} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    return blob;
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw new Error('Error al generar el PDF');
  }
}

/**
 * Genera un Data URL del PDF (útil para previews)
 * @param data - Datos del viajero y reserva
 */
export async function generateTravelerReportPDFDataURL(
  data: TravelerReportPDFData
): Promise<string> {
  try {
    const blob = await generateTravelerReportPDFBlob(data);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating PDF data URL:', error);
    throw new Error('Error al generar el PDF');
  }
}

