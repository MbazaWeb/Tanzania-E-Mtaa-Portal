import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'citizen' | 'staff' | 'admin';

export interface VirtualOffice {
  id: string;
  name: string;
  level: 'region' | 'district';
  region: string;
  district?: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender?: string;
  sex?: string;
  nationality?: string;
  country_of_citizenship?: string;
  nida_number?: string;
  phone: string;
  email: string;
  photo_url?: string;
  role: UserRole;
  is_verified: boolean;
  is_diaspora?: boolean;
  country_of_residence?: string;
  passport_number?: string;
  office_id?: string;
  assigned_region?: string;
  assigned_district?: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  created_at?: string;
}

export interface Service {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  form_schema: any;
  document_template: any;
  fee: number;
  active: boolean;
  diaspora_form_schema?: any;
  created_at?: string;
}

export interface Application {
  id: string;
  user_id: string;
  service_id: string;
  form_data: any;
  status: 'submitted' | 'paid' | 'verified' | 'pending_review' | 'approved' | 'pending_payment' | 'issued' | 'rejected' | 'returned';
  application_number: string;
  assigned_staff_id?: string;
  buyer_accepted?: boolean;
  tenant_accepted?: boolean;
  sla_deadline?: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  feedback?: string;
  created_at: string;
  service?: Service;
  user?: UserProfile;
}

export interface SupportTicket {
  id: string;
  application_id: string;
  citizen_id: string;
  issue_type: 'payment_failure' | 'technical_error' | 'status_delay' | 'other';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  refund_processed: boolean;
  resolution_notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  application_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string;
  payment_method: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'push';
  status: 'queued' | 'sent' | 'failed';
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip_address?: string;
  previous_hash?: string;
  current_hash?: string;
  created_at: string;
  user?: UserProfile;
}
