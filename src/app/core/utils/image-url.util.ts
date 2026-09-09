import { environment } from '../../../environments/environment';

export function resolveImageUrl(url?: string | null, fallback = ''): string {
  if (!url || !url.trim()) return fallback ? resolveImageUrl(fallback) : '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return environment.serverUrl ? `${environment.serverUrl}${cleanPath}` : cleanPath;
  }
  return trimmed;
}
