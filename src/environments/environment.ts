export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && (window as any).__env?.apiUrl) || '/api',
  serverUrl: (typeof window !== 'undefined' && (window as any).__env?.serverUrl) || '',
  uploadsUrl: (typeof window !== 'undefined' && (window as any).__env?.uploadsUrl) || '/uploads'
};
