/**
 * Forms Index
 * 
 * Export all service-specific forms for easy import
 * Each form is a standalone component that handles its own validation and submission
 */

// Form Types
export * from './types';

// Individual Service Forms
export { UtambulishoMkaziForm } from './UtambulishoMkaziForm';
export { BaruaUtambulishoForm } from './BaruaUtambulishoForm';
export { KibariMazishiForm } from './KibariMazishiForm';
export { MakubalianoMauzianoForm } from './MakubalianoMauzianoForm';
export { MakubalianoPangoForm } from './MakubalianoPangoForm';
export { KibaliUjenziForm } from './KibaliUjenziForm';
export { LeseniaBiasharaForm } from './LeseniaBiasharaForm';
export { BaruaShauriForm } from './BaruaShauriForm';
export { KibariShereheForm } from './KibariShereheForm';

// Service name to form component mapping
import { UtambulishoMkaziForm } from './UtambulishoMkaziForm';
import { BaruaUtambulishoForm } from './BaruaUtambulishoForm';
import { KibariMazishiForm } from './KibariMazishiForm';
import { MakubalianoMauzianoForm } from './MakubalianoMauzianoForm';
import { MakubalianoPangoForm } from './MakubalianoPangoForm';
import { KibaliUjenziForm } from './KibaliUjenziForm';
import { LeseniaBiasharaForm } from './LeseniaBiasharaForm';
import { BaruaShauriForm } from './BaruaShauriForm';
import { KibariShereheForm } from './KibariShereheForm';
import React from 'react';
import { FormProps } from './types';

// Map service names to their form components
// IMPORTANT: These names must match exactly with HARDCODED_SERVICES in services.ts
export const SERVICE_FORMS: Record<string, React.FC<FormProps>> = {
  // Hati ya Mkazi - Residency Certificate
  'Hati ya Mkazi': UtambulishoMkaziForm,
  
  // Barua ya Utambulisho - Introduction Letter
  'Barua ya Utambulisho': BaruaUtambulishoForm,
  
  // Kibali cha Mazishi - Burial Permit
  'Kibali cha Mazishi': KibariMazishiForm,
  
  // Makubaliano ya Mauziano - Sales Agreement
  'Makubaliano ya Mauziano': MakubalianoMauzianoForm,
  
  // PANGISHA - Makubaliano ya Pango - Rent Agreement
  'PANGISHA - Makubaliano ya Pango': MakubalianoPangoForm,
  
  // Kibali cha Tukio - Event Permit
  'Kibali cha Tukio': KibariShereheForm,
  
  // TODO: Add these when services are added to HARDCODED_SERVICES
  // 'Kibali cha Ujenzi (Maboresho)': KibaliUjenziForm,
  // 'Leseni ya Biashara Ndogondogo': LeseniaBiasharaForm,
  // 'Barua ya Kufungua Shauri': BaruaShauriForm,
};

// Helper function to get form component by service name
export const getServiceForm = (serviceName: string): React.FC<FormProps> | null => {
  return SERVICE_FORMS[serviceName] || null;
};

// Check if a service has a dedicated form
export const hasServiceForm = (serviceName: string): boolean => {
  return serviceName in SERVICE_FORMS;
};
