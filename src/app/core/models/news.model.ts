export interface AdminNewsArticle {
  id?: number;
  slug?: string;
  title: string;
  category: string;
  categories?: string[];
  date_str?: string;
  formatted_date?: string;
  read_time?: string;
  image?: string;
  badge?: string;
  summary?: string;
  content_html?: string;
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
