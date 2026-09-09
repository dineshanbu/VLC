export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && (window as any).__env?.apiUrl) || 'http://localhost:5000/api',
  serverUrl: (typeof window !== 'undefined' && (window as any).__env?.serverUrl) || 'http://localhost:5000',
  uploadsUrl: (typeof window !== 'undefined' && (window as any).__env?.uploadsUrl) || 'http://localhost:5000/uploads'
};
