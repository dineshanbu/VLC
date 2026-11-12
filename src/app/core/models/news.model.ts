export interface AdminNewsArticle {
  id?: number;
  slug?: string;
  title: string;
  title_ar?: string | null;
  category: string;
  categories?: string[];
  date_str?: string;
  formatted_date?: string;
  read_time?: string;
  image?: string;
  badge?: string;
  summary?: string;
  summary_ar?: string | null;
  content_html?: string;
  content_html_ar?: string | null;
  official_link?: string;
  status: 'Published' | 'Draft' | 'Archived';
  views?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NewsListResponse {
  success: boolean;
  count: number;
  articles: AdminNewsArticle[];
}

export interface NewsPageSettings {
  id?: number;
  hero_eyebrow: string;
  hero_eyebrow_ar: string;
  hero_title: string;
  hero_title_ar: string;
  hero_description: string;
  hero_description_ar: string;
  hero_button_text: string;
  hero_button_text_ar: string;
  hero_image: string;
  hero_image_ar?: string;
}
