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
  [key: string]: any;
}

export interface Product {
  id: string;
  title?: string; // product name used in some UI
  name?: string;  // product name used in some UI
  images: any; // array of image URLs or objects
  price: number;
  avg_rating?: number; // average rating 0-5
  vendor?: any;
  status?: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
  rejection_reason?: string;
  [key: string]: any;
}
// Category definition for product filtering
export interface Category {
  id: string;
  name: string;
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

/** Review object used by ReviewList component */
export interface Review {
  id: string;
  author: string;
  rating: number; // 1‑5 stars
  comment: string;
  createdAt: string; // ISO date string
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
  price_adjustment?: number; // optional adjustment for variant pricing
  sku?: string; // optional SKU identifier
  name?: string; // optional human‑readable variant name
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

export interface AnalyticsData {
  total_orders: number;
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  revenue_year: number;
  average_order_value: number;
  top_selling_products: {
    product_id: string | number;
    name: string;
    units_sold: number;
    revenue: number;
  }[];
  customer_satisfaction: number;
  delivery_rating: number;
  revenue_trend: {
    date: string;
    revenue: number;
  }[];
  order_volume: {
    date: string;
    count: number;
  }[];
  rating_distribution: Record<string, number>;
  product_insights: {
    product_id: string | number;
    name: string;
    views: number;
    add_to_cart: number;
    conversion_rate: number;
    stock: number;
    price: number;
    price_suggestion: number | null;
  }[];
}
