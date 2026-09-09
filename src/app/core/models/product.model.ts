export interface ProductSpecItem {
  label: string;
  value: string;
}

export interface ProductResourceItem {
  name: string;
  name_ar?: string;
  type: string;
  size: string;
  icon: 'document' | 'prescribing' | 'patient' | 'certificate';
  url?: string;
}

export interface Product {
  id: number;
  product_code: string;
  category: 'our-products' | 'future-portfolio';
  name: string;
  name_ar?: string;
  subtitle: string;
  subtitle_ar?: string;
  image: string;
  featured_image?: string;
  description: string;
  description_ar?: string;
  features: string[];
  features_ar?: string[];
  specs: ProductSpecItem[];
  specs_ar?: ProductSpecItem[];
  storage: ProductSpecItem[];
  storage_ar?: ProductSpecItem[];
  indication_desc?: string;
  indication_desc_ar?: string;
  indication_target?: string;
  indication_target_ar?: string;
  indication_route?: string;
  indication_route_ar?: string;
  indication_items?: ProductSpecItem[];
  indication_items_ar?: ProductSpecItem[];
  gallery: string[];
  resources: ProductResourceItem[];
  resources_ar?: ProductResourceItem[];
  order_index: number;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface ProductPageSettings {
  id?: number;
  hero_badge: string;
  hero_badge_ar?: string;
  hero_title_part1: string;
  hero_title_part1_ar?: string;
  hero_title_part2: string;
  hero_title_part2_ar?: string;
  hero_title_accent: string;
  hero_title_accent_ar?: string;
  hero_description: string;
  hero_description_ar?: string;
  hero_image: string;
  section_eyebrow: string;
  section_eyebrow_ar?: string;
  cta_badge: string;
  cta_badge_ar?: string;
  cta_title_part1: string;
  cta_title_part1_ar?: string;
  cta_title_accent: string;
  cta_title_accent_ar?: string;
  cta_description: string;
  cta_description_ar?: string;
  cta_btn_text: string;
  cta_btn_text_ar?: string;
  cta_link: string;
  page_resources: ProductResourceItem[];
  updated_at?: string;
}

export interface ProductsListResponse {
  success: boolean;
  count: number;
  products: Product[];
}

export interface ProductDetailResponse {
  success: boolean;
  product: Product;
}

export interface ProductSettingsResponse {
  success: boolean;
  settings: ProductPageSettings;
}
