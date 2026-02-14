import axios from 'axios';
import { storage } from '../utils/storage';
import { BACKEND_URL, STORAGE_KEYS } from '../config/constants';
import { logDebug, logInfo, logError } from '../utils/logger';
import type { 
  AppDataResponse, 
  LoginRequest, 
  LoginResponse,
  LicenseCheckRequest,
  LicenseCheckResponse,
  LicenseAuthResponse
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      // Build full URL for logging
      const base = config.baseURL || '';
      const url = config.url || '';
      const fullUrl = base.endsWith('/') || url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;

      // Log method, url, params, and data
      logInfo(`API Request -> ${String(config.method).toUpperCase()} ${fullUrl}`);
      if (config.params) logDebug('Request params:', config.params);
      if (config.data) logDebug('Request body:', config.data);
    } catch (e) {
      logDebug('Failed to log request info', e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to log responses (status + url + data)
api.interceptors.response.use(
  (response) => {
    try {
      const config = response.config || {};
      const base = config.baseURL || '';
      const url = config.url || '';
      const fullUrl = base.endsWith('/') || url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
      logInfo(`API Response <- ${config.method?.toUpperCase() || 'GET'} ${fullUrl} [${response.status}]`);
      logDebug('Response data:', response.data);
    } catch (e) {
      logDebug('Failed to log response info', e);
    }
    return response;
  },
  (error) => {
    try {
      const resp = error.response;
      if (resp && resp.config) {
        const config = resp.config;
        const base = config.baseURL || '';
        const url = config.url || '';
        const fullUrl = base.endsWith('/') || url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
        logInfo(`API Error  <- ${config.method?.toUpperCase() || 'GET'} ${fullUrl} [${resp.status}]`);
        logDebug('Error response data:', resp.data);
      } else {
        logError('API Error (no response):', error.message || error);
      }
    } catch (e) {
      logDebug('Failed to log response error info', e);
    }
    // Sanitize error before rejecting to avoid sending non-clonable
    // objects (like functions in axios config) through test runner
    try {
      const resp = error && error.response ? error.response : null;
      const cfg = error && error.config ? error.config : null;
      const safeErr = new Error(error?.message || 'API Error');
      (safeErr as any).status = resp ? resp.status : undefined;
      (safeErr as any).data = resp ? resp.data : undefined;
      if (cfg) {
        (safeErr as any).config = {
          url: cfg.url,
          baseURL: cfg.baseURL,
          method: cfg.method,
          params: cfg.params,
        };
      }
      return Promise.reject(safeErr);
    } catch (e) {
      return Promise.reject(new Error('API Error'));
    }
  }
);

// API Service
export const apiService = {
  // Auth
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // License
  checkLicense: async (licenseKey: string): Promise<LicenseCheckResponse> => {
    const response = await api.get<LicenseCheckResponse>('/licenses/check', {
      params: { license_key: licenseKey },
    });
    return response.data;
  },

  // License Auth (login with license key)
  loginWithLicense: async (licenseKey: string): Promise<LicenseAuthResponse> => {
    const response = await api.post<LicenseAuthResponse>('/license-auth/login', {
      license_key: licenseKey,
    });
    return response.data;
  },

  // AppData
  getAppData: async (licenseKey: string): Promise<AppDataResponse> => {
    const response = await api.get<AppDataResponse>('/appdata', {
      params: { license_key: licenseKey },
    });
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  /**
   * Upload file using multipart/form-data
   * @param path - API endpoint path (e.g., '/products/upload')
   * @param file - File URI or blob to upload
   * @param fieldName - Form field name (e.g., 'image', 'file')
   * @param filename - Optional custom filename
   * @param storeId - Optional X-Store-Id header value
   * @returns Response data
   */
  uploadFile: async <T = any>(
    path: string,
    file: { uri: string; type?: string; name?: string } | Blob,
    fieldName: string = 'file',
    filename?: string,
    storeId?: string
  ): Promise<T> => {
    const formData = new FormData();
    
    // Handle different file types (React Native vs Web)
    if ('uri' in file) {
      // React Native file object
      const fileToUpload: any = {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: filename || file.name || 'upload.jpg',
      };
      formData.append(fieldName, fileToUpload);
    } else {
      // Web Blob
      formData.append(fieldName, file, filename || 'upload');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };

    if (storeId) {
      headers['X-Store-Id'] = storeId;
    }

    logDebug(`Uploading file to ${path}`, { fieldName, filename, storeId });
    
    const response = await api.post<T>(path, formData, { headers });
    
    logDebug('Upload response:', response.data);
    return response.data;
  },
};

export default api;
