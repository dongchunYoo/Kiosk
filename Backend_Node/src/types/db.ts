// Auto-generated DB types (refined) based on `docs/dev_db.sql`
import { Generated } from 'kysely';

export interface UsersRow {
  id: Generated<number>;
  user_Id: string;
  name: string;
  phone?: string | null;
  role?: string | null; // e.g. 'A' or 'U'
  show_group?: string | null;
  show_store?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  password?: string | null; // hashed
}

export interface ProductsRow {
  id: Generated<number>;
  category_id: number;
  store_id: number;
  name: string;
  description?: string | null;
  price: string; // decimal stored as string by mysql2
  image_url?: string | null;
  is_available?: number | null; // tinyint
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CategoriesRow {
  id: Generated<number>;
  store_id: number;
  name: string;
  description?: string | null;
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StoresRow {
  id: Generated<number>;
  name: string;
  address?: string | null;
  phone?: string | null;
  open_dt?: string | null;
  close_dt?: string | null;
  store_group_id?: number | null;
  enable?: number | null;
  bizNumber?: string | null;
  PG_MERCHANT_ID?: string | null;
  PG_PRIVATE_KEY?: string | null;
  PG_PAYMENT_KEY?: string | null;
  vanType?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StoreGroupsRow {
  id: Generated<number>;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LicenseRow {
  id: Generated<number>;
  license_key: string;
  store_id?: number | null;
  issued_at?: string | null;
  valid_until?: string | null;
  active?: number | null;
  meta?: any;
  created_at?: string | null;
  updated_at?: string | null;
  expiry_dt?: string | null;
  enable?: number | null;
  uuid?: string | null;
  device_id?: string | null;
}

export interface PaymentReceiptRow {
  id: Generated<number>;
  bizNumber?: string | null;
  orderNo?: string | null;
  device_id?: string | null;
  storeId?: number | null;
  payment_time?: string | null;
  total_amount?: string | null;
  card_payment?: string | null;
  other_payment?: string | null;
  is_cancelled?: number | null;
  status?: string | null;
  products_snapshot?: any;
  retry_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PaymentProductsRow {
  id: Generated<number>;
  receipt_id: number;
  store_id?: number | null;
  name?: string | null;
  price?: string | null;
  image_url?: string | null;
  is_available?: number | null;
  display_order?: number | null;
  orderNo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductOptionsRow {
  id: Generated<number>;
  product_id: number;
  name: string;
  price?: string | null;
  is_available?: number | null;
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrdersRow {
  id: Generated<number>;
  order_number: string;
  store_id: number;
  total_amount: string;
  payment_method?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrderItemsRow {
  id: Generated<number>;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  options_json?: any;
  created_at?: string | null;
}

export type DbTypes = {
  users: UsersRow;
  products: ProductsRow;
  categories: CategoriesRow;
  stores: StoresRow;
  license: LicenseRow;
  PaymentReceipt: PaymentReceiptRow;
  PaymentProducts: PaymentProductsRow;
  product_options: ProductOptionsRow;
  orders: OrdersRow;
  order_items: OrderItemsRow;
  store_groups: StoreGroupsRow;
};

export default DbTypes;

// Generic ID type that can be either a runtime number or Kysely's Generated<number>
export type Id = number | Generated<number>;
