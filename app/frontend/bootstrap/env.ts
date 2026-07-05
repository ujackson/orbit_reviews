// Environment configuration
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  wsUrl: import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/cable`,
  environment: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
