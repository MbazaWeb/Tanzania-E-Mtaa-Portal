// Shared types for all service forms

export interface UserProfile {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone: string;
  nida_number?: string;
  citizen_id?: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  [key: string]: any;
}

export interface FormProps {
  onSubmit: (data: any, attachments: string[], applicantType: string, representativeName?: string) => void;
  isLoading?: boolean;
  lang?: 'sw' | 'en';
  userProfile?: UserProfile | null;
}

export type ApplicantType = 'self' | 'minor' | 'representative';

// Common form field interface
export interface SelectOption {
  label: string;
  value: string;
}

// Labels in Swahili and English
export const labels = {
  sw: {
    submit: 'Wasilisha Maombi',
    submitting: 'Inatuma...',
    required: 'Lazima',
    optional: 'Si lazima',
    selectOption: 'Chagua...',
    uploadFile: 'Pakia Faili',
    fileUploaded: 'Faili limepakiwa',
    applicantType: 'Aina ya Mwombaji',
    self: 'Binafsi (Mimi Mwenyewe)',
    minor: 'Mtoto Mdogo (Chini ya Miaka 18)',
    representative: 'Mwakilishi',
    forMinor: 'Kwa Mtoto',
    forRepresentative: 'Kwa Mwakilishi',
  },
  en: {
    submit: 'Submit Application',
    submitting: 'Submitting...',
    required: 'Required',
    optional: 'Optional',
    selectOption: 'Select...',
    uploadFile: 'Upload File',
    fileUploaded: 'File Uploaded',
    applicantType: 'Applicant Type',
    self: 'Self (Myself)',
    minor: 'Minor (Under 18)',
    representative: 'Representative',
    forMinor: 'For Minor',
    forRepresentative: 'For Representative',
  }
};
