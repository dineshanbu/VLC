export interface MediaItem {
  id?: number;
  title: string;
  description?: string;
  category: string;
  format: 'IMAGE' | 'PDF' | 'DOC' | 'VIDEO' | 'OTHER';
  file_size?: string;
  file_name: string;
  file_url: string;
  created_at?: string;
}

export interface MediaListResponse {
  success: boolean;
  count: number;
  media: MediaItem[];
}
