export interface HomePageSection {
  section_key: 'landing' | 'supporting' | 'platform' | 'about' | 'our_office';
  badge: string;
  badge_ar: string;
  title: string;
  title_ar: string;
  title_line2?: string;
  title_line2_ar?: string;
  landing_title_customized?: number | boolean;
  about_title_customized?: number | boolean;
  description: string;
  description_ar: string;
  image_url: string;
  image_url_ar?: string;
  video_url?: string | null;
  corporate_video_url?: string | null;
  button_text?: string;
  button_text_ar?: string;
  button_url?: string;
  content_json?: PlatformCardContent[];
}

export interface PlatformCardContent {
  tag: string;
  tag_ar: string;
  description: string;
  description_ar: string;
  image_url: string;
}

export interface HomePageContentResponse {
  success: boolean;
  content: { landing: HomePageSection; supporting: HomePageSection; platform: HomePageSection; about: HomePageSection; our_office: HomePageSection };
}
