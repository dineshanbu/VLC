const runtime = typeof window !== 'undefined' ? window : undefined;
const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(runtime?.location.hostname ?? '');
const overrides = (runtime as (Window & {
  __env?: { apiUrl?: string; serverUrl?: string; uploadsUrl?: string };
}) | undefined)?.__env;

export const environment = {
  production: true,
  apiUrl: overrides?.apiUrl || (isLoopback ? '/api' : 'https://vaccine.com.sa/api'),
  serverUrl: overrides?.serverUrl || (isLoopback ? '' : 'https://vaccine.com.sa/backend'),
  uploadsUrl: overrides?.uploadsUrl || (isLoopback ? '/uploads' : 'https://vaccine.com.sa/backend/uploads')
};
