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
 * IMPORTANT: These names must match exactly with HARDCODED_SERVICES in services.ts
 * 
 * Usage:
 * const PDFComponent = SERVICE_DOCUMENTS[application.service_name];
 * if (PDFComponent) {
 *   return <PDFComponent application={application} lang={language} />;
 * }
 */
export const SERVICE_DOCUMENTS: Record<string, React.FC<DocumentPDFProps>> = {
  // Hati ya Mkazi - Residency Certificate
  'Hati ya Mkazi': UtambulishoMkaziPDF,
  
  // Kibali cha Mazishi - Burial Permit
  'Kibali cha Mazishi': KibariMazishiPDF,
  
  // Makubaliano ya Mauziano - Sales Agreement
  'Makubaliano ya Mauziano': MakubalianoMauzianoPDF,
  
  // Kibali cha Tukio - Event Permit
  'Kibali cha Tukio': KibariSherehePDF,
  
  // TODO: Add these when services are added to HARDCODED_SERVICES
  // 'Kibali cha Ujenzi (Maboresho)': KibaliUjenziPDF,
  // 'Leseni ya Biashara Ndogondogo': LeseniaBiasharaPDF,
  // 'Barua ya Kufungua Shauri': BaruaShouriPDF,
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
