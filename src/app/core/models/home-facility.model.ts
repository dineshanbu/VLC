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
}
