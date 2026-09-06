export interface LeaderSection {
  heading: string;
  items?: string[];
  paragraphs?: string[];
}

export interface AboutLeader {
  id?: number;
  name: string;
  title: string;
  role: string;
  badge: string;
  initials?: string;
  image: string;
  bio_sections?: LeaderSection[];
  order_index?: number;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface AboutSectionContent {
  id?: number;
  section_key: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  image_url?: string;
  content_json?: any;
  updated_at?: string;
}

export interface AboutPageContentMap {
  hero: AboutSectionContent;
  overview_modal: AboutSectionContent;
  vision_mission: AboutSectionContent;
  vision_2030: AboutSectionContent;
}

export interface AboutContentResponse {
  success: boolean;
  content: AboutPageContentMap;
}

export interface AboutLeadersResponse {
  success: boolean;
  count: number;
  leaders: AboutLeader[];
  badges: string[];
}
