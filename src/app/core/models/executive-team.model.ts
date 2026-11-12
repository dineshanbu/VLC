export interface ExecutiveBioSection {
  heading: string;
  items?: string[];
  ordered_items?: string[];
  paragraphs?: string[];
}

export interface ExecutiveTeamMember {
  id?: number;
  name: string;
  name_ar?: string;
  title: string;
  title_ar?: string;
  role: string;
  role_ar?: string;
  badge: string | null;
  badge_ar?: string;
  initials?: string;
  image: string;
  bio_sections?: ExecutiveBioSection[];
  bio_sections_ar?: ExecutiveBioSection[];
  order_index?: number;
  status: 'Active' | 'Inactive';
}

export interface ExecutiveTeamMembersResponse {
  success: boolean;
  count: number;
  members: ExecutiveTeamMember[];
}

export interface ExecutiveTeamContent {
  hero: ExecutiveTeamHero | null;
  page: Record<string, any> | null;
}

export interface ExecutiveTeamHero {
  badge?: string;
  badge_ar?: string;
  title?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  description?: string;
  description_ar?: string;
  image_url?: string;
  image_url_ar?: string;
}
