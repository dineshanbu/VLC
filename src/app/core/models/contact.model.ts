export interface ContactInquiry {
  id?: number;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Archived';
  is_starred: boolean | number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactListResponse {
  success: boolean;
  count: number;
  inquiries: ContactInquiry[];
}

export interface ContactSubmissionPayload {
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message: string;
}
