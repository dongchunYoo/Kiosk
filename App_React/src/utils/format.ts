import { BACKEND_URL } from '../config/constants';

// Format price with comma separator
export const formatPrice = (price: number | string | null | undefined): string => {
  if (price == null) return '0';
  
  const numPrice = typeof price === 'string' ? parseInt(price, 10) : price;
  if (isNaN(numPrice)) return '0';
  
  return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Normalize image URL
export const normalizeImageUrl = (rawUrl: string | null | undefined): string | null => {
  if (!rawUrl) return null;
  
  const url = rawUrl.trim();
  if (url.length === 0) return null;
  
  // Already an absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Remove 'undefined' prefix if present
  let cleaned = url.replace(/^undefined\/*/, '');
  
  // Ensure leading slash
  if (!cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }
  
  const baseUrl = BACKEND_URL.replace(/\/$/, '');
  return `${baseUrl}${cleaned}`;
};

// Format time as HH:MM
export const formatTime = (date: Date = new Date()): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
