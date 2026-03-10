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
export { KibariMazishiForm } from './KibariMazishiForm';
export { MakubalianoMauzianoForm } from './MakubalianoMauzianoForm';
export { KibaliUjenziForm } from './KibaliUjenziForm';
export { LeseniaBiasharaForm } from './LeseniaBiasharaForm';
export { BaruaShouriForm } from './BaruaShouriForm';
export { KibariShereheForm } from './KibariShereheForm';
export { BaruaUtambulishoForm } from './BaruaUtambulishoForm'; // New form

// Service name to form component mapping
import { UtambulishoMkaziForm } from './UtambulishoMkaziForm';
import { KibariMazishiForm } from './KibariMazishiForm';
import { MakubalianoMauzianoForm } from './MakubalianoMauzianoForm';
import { KibaliUjenziForm } from './KibaliUjenziForm';
import { LeseniaBiasharaForm } from './LeseniaBiasharaForm';
import { BaruaShouriForm } from './BaruaShouriForm';
import { KibariShereheForm } from './KibariShereheForm';
import { BaruaUtambulishoForm } from './BaruaUtambulishoForm'; // New form
import React from 'react';
import { FormProps } from './types';

// Map service names to their form components
export const SERVICE_FORMS: Record<string, React.FC<FormProps>> = {
  'Utambulisho wa Mkazi': UtambulishoMkaziForm,
  'Barua ya Utambulisho': BaruaUtambulishoForm, // New service
  'Kibari cha Mazishi': KibariMazishiForm,
  'Makubaliano ya Mauziano': MakubalianoMauzianoForm,
  'Kibali cha Ujenzi (Maboresho)': KibaliUjenziForm,
  'Leseni ya Biashara Ndogondogo': LeseniaBiasharaForm,
  'Barua ya Kufungua Shauri': BaruaShouriForm,
  'Kibari cha Matukio / Sherehe': KibariShereheForm,
};

// Helper function to get form component by service name
export const getServiceForm = (serviceName: string): React.FC<FormProps> | null => {
  return SERVICE_FORMS[serviceName] || null;
};

// Check if a service has a dedicated form
export const hasServiceForm = (serviceName: string): boolean => {
  return serviceName in SERVICE_FORMS;
};