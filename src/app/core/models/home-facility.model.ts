export interface HomeFacilityImage {
  id?: number;
  title: string;
  alt_text: string;
  image_url: string;
  file_name?: string | null;
  source_type?: 'upload' | 'url' | 'legacy';
  order_index: number;
  status: 'Active' | 'Inactive';
}

export interface HomeFacilityResponse {
  success: boolean;
  images: HomeFacilityImage[];
  content?: HomeFacilityContent;
}

export interface HomeFacilityContent {
  title: string;
  title_ar: string;
  lead: string;
  lead_ar: string;
  paragraph_one: string;
  paragraph_one_ar: string;
  paragraph_two: string;
  paragraph_two_ar: string;
}
