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
export { KibaliUjenziForm } from './KibaliUjenziForm';
export { LeseniaBiasharaForm } from './LeseniaBiasharaForm';
export { BaruaShauriForm } from './BaruaShauriForm';
export { KibariShereheForm } from './KibariShereheForm';

// Service name to form component mapping
import { UtambulishoMkaziForm } from './UtambulishoMkaziForm';
import { BaruaUtambulishoForm } from './BaruaUtambulishoForm';
import { KibariMazishiForm } from './KibariMazishiForm';
import { MakubalianoMauzianoForm } from './MakubalianoMauzianoForm';
import { KibaliUjenziForm } from './KibaliUjenziForm';
import { LeseniaBiasharaForm } from './LeseniaBiasharaForm';
import { BaruaShauriForm } from './BaruaShauriForm';
import { KibariShereheForm } from './KibariShereheForm';
import React from 'react';
import { FormProps } from './types';

// Map service names to their form components
export const SERVICE_FORMS: Record<string, React.FC<FormProps>> = {
  'Utambulisho wa Mkazi': UtambulishoMkaziForm,
  'Barua ya Utambulisho': BaruaUtambulishoForm,
  'Kibari cha Mazishi': KibariMazishiForm,
  'Makubaliano ya Mauziano': MakubalianoMauzianoForm,
  'Kibali cha Ujenzi (Maboresho)': KibaliUjenziForm,
  'Leseni ya Biashara Ndogondogo': LeseniaBiasharaForm,
  'Barua ya Kufungua Shauri': BaruaShauriForm,
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
