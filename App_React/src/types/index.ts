// Product Option Type
export interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  price: number;
  is_required: boolean;
  display_order: number;
}

// Product Type
export interface Product {
  id: number;
  store_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  display_order: number;
  product_options: ProductOption[];
}

// Category Type
export interface Category {
  id: number;
  store_id: number;
  name: string;
  description?: string;
  display_order: number;
  products?: Product[];
}

// Store Type
export interface Store {
  id: number;
  name: string;
  owner_id: number;
  address?: string;
  timezone?: string;
}

// Cart Item Type
export interface CartItem {
  product: Product;
  selectedOptions: ProductOption[];
  quantity: number;
  totalPrice: number;
}

// AppData Response Type (from /appdata endpoint)
export interface AppDataResponse {
  id: number;
  device_id?: string;
  store?: Store;
  categories?: Category[];
  products?: Product[];
}

// Auth Types
export interface LoginRequest {
  user_Id: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    user_Id: string;
    role: string;
    name: string;
  };
}

export interface LicenseCheckRequest {
  license_key: string;
}

export interface LicenseCheckResponse {
  valid: boolean;
  store_id?: number;
  device_id?: string;
}

// License Auth Response (from /license-auth/login)
export interface LicenseAuthResponse {
  success: boolean;
  token: string;
  license_key: string;
}
