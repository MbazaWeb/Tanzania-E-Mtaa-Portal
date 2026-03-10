/**
 * Documents Index
 * 
 * Central export for all service-specific PDF documents
 * Each service has its own dedicated PDF component for easier maintenance
 */

// Import all PDF components
export { UtambulishoMkaziPDF } from './UtambulishoMkaziPDF';
export { KibariMazishiPDF } from './KibariMazishiPDF';
export { MakubalianoMauzianoPDF } from './MakubalianoMauzianoPDF';
export { KibaliUjenziPDF } from './KibaliUjenziPDF';
export { LeseniaBiasharaPDF } from './LeseniaBiasharaPDF';
export { BaruaShouriPDF } from './BaruaShouriPDF';
export { KibariSherehePDF } from './KibariSherehePDF';
export { RisitiMalipoPDF } from './RisitiMalipoPDF';

// Export types
export * from './types';

// Import for mapping
import { UtambulishoMkaziPDF } from './UtambulishoMkaziPDF';
import { KibariMazishiPDF } from './KibariMazishiPDF';
import { MakubalianoMauzianoPDF } from './MakubalianoMauzianoPDF';
import { KibaliUjenziPDF } from './KibaliUjenziPDF';
import { LeseniaBiasharaPDF } from './LeseniaBiasharaPDF';
import { BaruaShouriPDF } from './BaruaShouriPDF';
import { KibariSherehePDF } from './KibariSherehePDF';
import { RisitiMalipoPDF } from './RisitiMalipoPDF';
import type { DocumentPDFProps } from './types';
import React from 'react';

/**
 * Mapping of service names to their PDF document components
 * 
 * Usage:
 * const PDFComponent = SERVICE_DOCUMENTS[application.service_name];
 * if (PDFComponent) {
 *   return <PDFComponent application={application} lang={language} />;
 * }
 */
export const SERVICE_DOCUMENTS: Record<string, React.FC<DocumentPDFProps>> = {
  // Residency Certificate / Barua ya Utambulisho wa Mkazi
  'Utambulisho wa Mkazi': UtambulishoMkaziPDF,
  
  // Funeral Permit / Kibali cha Mazishi
  'Kibari cha Mazishi': KibariMazishiPDF,
  
  // Sales Agreement / Makubaliano ya Mauzo
  'Makubaliano ya Mauziano': MakubalianoMauzianoPDF,
  
  // Building Permit / Kibali cha Ujenzi
  'Kibali cha Ujenzi (Maboresho)': KibaliUjenziPDF,
  
  // Petty Trader License / Leseni ya Biashara Ndogondogo
  'Leseni ya Biashara Ndogondogo': LeseniaBiasharaPDF,
  
  // Dispute Letter / Barua ya Kufungua Shauri
  'Barua ya Kufungua Shauri': BaruaShouriPDF,
  
  // Event Permit / Kibali cha Sherehe
  'Kibari cha Matukio / Sherehe': KibariSherehePDF,
};

/**
 * Get the appropriate PDF document component for a service
 * @param serviceName - The name of the service
 * @returns The PDF component or undefined if not found
 */
export function getServiceDocument(serviceName: string): React.FC<DocumentPDFProps> | undefined {
  return SERVICE_DOCUMENTS[serviceName];
}

/**
 * Check if a service has a dedicated PDF document component
 * @param serviceName - The name of the service
 * @returns true if the service has a PDF component
 */
export function hasServiceDocument(serviceName: string): boolean {
  return serviceName in SERVICE_DOCUMENTS;
}

/**
 * Get the receipt PDF component
 * This is a special PDF used for payment receipts across all services
 */
export function getReceiptDocument(): React.FC<DocumentPDFProps> {
  return RisitiMalipoPDF;
}

/**
 * List of all available services with PDF documents
 */
export const AVAILABLE_PDF_SERVICES = Object.keys(SERVICE_DOCUMENTS);
