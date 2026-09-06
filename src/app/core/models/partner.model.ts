export interface PartnerPageSettings {
  id?: number;
  hero_badge: string;
  hero_title: string;
  hero_title_line2: string;
  hero_accent: string;
  hero_description: string;
  hero_image: string;
  cta_text: string;
  stats?: Array<{ label: string; value: string }>;
  updated_at?: string;
}

export interface Partner {
  id?: number;
  code?: string;
  name: string;
  category: string;
  tier: string;
  logo: string;
  website?: string;
  description: string;
  featured?: boolean | number;
  order_index: number;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface PartnershipSection {
  id?: number;
  section_key: string;
  badge?: string;
  title: string;
  subtitle?: string;
  content?: string;
  bullet_points?: string[];
  image_url?: string;
  icon?: string;
  cta_text?: string;
  cta_url?: string;
  layout_type: 'card' | 'split_left' | 'split_right' | 'stat_grid' | 'banner_highlight';
  order_index: number;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface PartnershipInquiry {
  id?: number;
  full_name: string;
  organization: string;
  email: string;
  phone?: string;
  category: string;
  message?: string;
  status: 'New' | 'Under Review' | 'Contacted' | 'Archived';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PartnerListResponse {
  success: boolean;
  count: number;
  partners: Partner[];
  categories: string[];
  tiers: string[];
}

export interface SectionListResponse {
  success: boolean;
  count: number;
  sections: PartnershipSection[];
}
