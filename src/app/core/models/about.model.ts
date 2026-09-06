export interface LeaderSection {
  heading: string;
  items?: string[];
  paragraphs?: string[];
}

export interface AboutLeader {
  id?: number;
  name: string;
  name_ar?: string;
  title: string;
  title_ar?: string;
  role: string;
  role_ar?: string;
  badge: string;
  badge_ar?: string;
  initials?: string;
  image: string;
  bio_sections?: LeaderSection[];
  bio_sections_ar?: LeaderSection[];
  order_index?: number;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface AboutSectionContent {
  id?: number;
  section_key: string;
  title?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  badge?: string;
  badge_ar?: string;
  description?: string;
  description_ar?: string;
  image_url?: string;
  content_json?: any;
  content_json_ar?: any;
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
