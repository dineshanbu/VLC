export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && (window as any).__env?.apiUrl) || 'https://vaccine.com.sa/api',
  serverUrl: (typeof window !== 'undefined' && (window as any).__env?.serverUrl) || 'https://vaccine.com.sa/backend',
  uploadsUrl: (typeof window !== 'undefined' && (window as any).__env?.uploadsUrl) || 'https://vaccine.com.sa/backend/uploads'
};
