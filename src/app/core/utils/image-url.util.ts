import { environment } from '../../../environments/environment';

export function resolveImageUrl(url?: string | null, fallback = ''): string {
  if (!url || !url.trim()) return fallback ? resolveImageUrl(fallback) : '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/backend/uploads/') || trimmed.startsWith('backend/uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const baseHost = (environment.serverUrl || '').replace(/\/backend\/?$/, '');
    return `${baseHost}${cleanPath}`;
  }
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return environment.serverUrl ? `${environment.serverUrl}${cleanPath}` : cleanPath;
  }
  // Local public assets must resolve beneath Angular's deployment base href
  // (for example /new/) instead of the web-server root.
  return trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
}
