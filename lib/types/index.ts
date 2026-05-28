/* lib/types/index.ts */

/** User role enumeration */
export type UserRole =
  | "buyer"
  | "vendor"
  | "driver"
  | "moderator"
  | "admin";

/** JWT payload shape (decoded) */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/** Authentication tokens */
export interface AuthTokens {
  access: string;
  refresh: string;
}

/** User object stored in the auth store */
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  /** Indicates whether the user's KYC verification is complete */
  is_verified: boolean;
}

/** Product definition */
export interface Product {
  id: string;
  title: string; // product name used in UI
  images: string[]; // array of image URLs
  price: number;
  avg_rating: number; // average rating 0-5
  vendor: Vendor;
}

/** Vendor information */
export interface Vendor {
  id: string;
  name: string;
  logoUrl?: string;
  is_verified: boolean;
  rating?: number;
}

/** Cart item definition */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Toast notification type */
export type ToastVariant = "success" | "error" | "info";
export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

/** ----- Vendor‑specific types (added) ----- */
export interface VendorStats {
  totalRevenue: number;
  ordersThisMonth: number;
  pendingOrders: number;
  lowStockCount: number;
  weeklyRevenue: { week: string; revenue: number }[];
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface VendorOrder {
  id: string;
  buyerName: string;
  items: OrderItem[];
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  created_at: string; // ISO timestamp
}

export interface Driver {
  id: string;
  name: string;
  vehicle?: string;
}

export interface Variant {
  type: "size" | "color" | "storage";
  value: string;
  price: number; // additional price over base product
  stock: number;
}

export interface VendorProduct extends Product {
  stock: number;
  variants?: Variant[];
  category?: string;
  description?: string;
}

export interface VendorProfile {
  business_name: string;
  description: string;
  logoUrl?: string;
  address: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
}
