/* lib/types/index.ts – Strict, comprehensive type definitions */

// ─── Auth & Users ────────────────────────────────────────────────────────────

/** Backend roles are uppercase strings; middleware uses lowercase for route segments */
export type UserRoleUpper = "BUYER" | "VENDOR" | "DRIVER" | "MODERATOR" | "ADMIN";
export type UserRoleLower = "buyer" | "vendor" | "driver" | "moderator" | "admin";
/** Union type covering both forms as they appear across token/store/API */
export type UserRole = UserRoleUpper | UserRoleLower;

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  is_verified: boolean;
  is_active?: boolean;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Products ────────────────────────────────────────────────────────────────

export type ProductStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
}

export interface Variant {
  id?: string;
  type?: "size" | "color" | "storage" | string;
  value: string;
  price: number;
  stock: number;
  price_adjustment?: number;
  sku?: string;
  name?: string;
}

export interface Product {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  price: number;
  original_price?: number;
  images: ProductImage[] | string[];
  image?: string;
  avg_rating?: number;
  average_rating?: number;
  rating?: number;
  total_reviews?: number;
  vendor?: Vendor | string;
  category?: string | number;
  category_name?: string;
  status?: ProductStatus;
  rejection_reason?: string;
  stock?: number;
  is_featured?: boolean;
  is_digital?: boolean;
  is_active?: boolean;
  created_at?: string;
  variants?: Variant[];
}

export interface VendorProduct extends Product {
  stock: number;
  description?: string;
  category?: string;
  variants?: Variant[];
  low_stock_threshold?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  brand?: string;
  meta_title?: string;
  meta_description?: string;
  is_archived?: boolean;
  backorder_allowed?: boolean;
  out_of_stock_auto_hide?: boolean;
  tags?: string[];
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  id: string | number;
  name: string;
  slug?: string;
  parent?: number | null;
  image?: string | null;
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  business_name?: string;
  logoUrl?: string;
  logo?: string;
  is_verified: boolean;
  rating?: number;
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

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id?: string;
  product: Product | string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
}

export interface Order {
  id: string;
  order_number?: string;
  buyer?: string | User;
  buyerName?: string;
  items: OrderItem[];
  total: number;
  total_amount?: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  shipping_address?: string;
  tracking_number?: string;
}

export interface VendorOrder extends Order {
  buyerName: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  variant_id?: string;
}

// ─── Finance / Wallet ────────────────────────────────────────────────────────

export type TransactionType = "CREDIT" | "DEBIT" | "FEE" | "WITHDRAWAL";

export interface Transaction {
  id: number;
  wallet: number;
  amount: string;
  transaction_type: TransactionType;
  description: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user: number;
  balance: string;
  created_at: string;
  updated_at: string;
  transactions: Transaction[];
}

export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface WithdrawalRequest {
  id: number;
  wallet: number;
  amount: string;
  status: WithdrawalStatus;
  bank_details: string;
  created_at: string;
  processed_at: string | null;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DailyAnalytics {
  id: number;
  date: string;
  page_views: number;
  registrations: number;
  conversions: number;
}

export interface TopSellingProduct {
  product_id: string | number;
  name: string;
  units_sold: number;
  revenue: number;
}

export interface ProductInsight {
  product_id: string | number;
  name: string;
  views: number;
  add_to_cart: number;
  conversion_rate: number;
  stock: number;
  price: number;
  price_suggestion: number | null;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface OrderVolumePoint {
  date: string;
  count: number;
}

export interface AnalyticsData {
  total_orders: number;
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  revenue_year: number;
  average_order_value: number;
  top_selling_products: TopSellingProduct[];
  customer_satisfaction: number;
  delivery_rating: number;
  revenue_trend: RevenueTrendPoint[];
  order_volume: OrderVolumePoint[];
  rating_distribution: Record<string, number>;
  product_insights: ProductInsight[];
}

// ─── Vendor Stats ────────────────────────────────────────────────────────────

export interface VendorStats {
  totalRevenue: number;
  total_revenue?: number;
  ordersThisMonth: number;
  orders_this_month?: number;
  pendingOrders: number;
  pending_orders?: number;
  lowStockCount: number;
  low_stock_count?: number;
  weeklyRevenue?: { week: string; revenue: number }[];
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  notification_type?: string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string | number;
  author?: string;
  user?: string | { id: string; name: string };
  rating: number;
  comment: string;
  createdAt?: string;
  created_at?: string;
  is_verified_purchase?: boolean;
  vendor_response?: string;
}

// ─── Driver ──────────────────────────────────────────────────────────────────

export interface Driver {
  id: string;
  name: string;
  vehicle?: string;
  status?: string;
  rating?: number;
}

export interface DriverAssignment {
  id: number;
  orderId: number;
  order_id?: number;
  customerName: string;
  customer_name?: string;
  address: string;
  status: string;
  trackingNumber?: string;
  tracking_number?: string;
}

// Delivery status values used in the driver workflow
export type DriverDeliveryStatus =
  | 'TRAVELING_TO_VENDOR'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'CANCELLED';

export type DriverAvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'RESTING';

// ─── KYC ─────────────────────────────────────────────────────────────────────

export type KycStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface KycRecord {
  id: number;
  user: number;
  user_email?: string;
  status: KycStatus;
  grace_expiry_date?: string;
  submitted_at?: string;
  reviewed_at?: string;
  documents?: KycDocument[];
}

export interface KycDocument {
  id: number;
  requirement: number;
  requirement_name?: string;
  file: string;
  reference_number?: string;
  expiry_date?: string;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  buyer: number;
  seller: number;
  buyer_username?: string;
  seller_username?: string;
  product_id: string | null;
  created_at: string;
  unread_count: number;
  last_message?: ChatMessage;
}

export interface ChatMessage {
  id: number;
  room: string;
  sender: number | string;
  text: string;
  is_read: boolean;
  created_at: string;
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export interface Coupon {
  id: number;
  code: string;
  discount_type: "PERCENTAGE" | "FIXED";
  value: string;
  valid_from: string;
  valid_to: string;
  active: boolean;
  max_uses: number | null;
}

export interface FlashSale {
  id: number;
  name: string;
  discount_percentage: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_vendors: number;
  total_buyers: number;
  total_drivers: number;
  total_orders: number;
  total_revenue: number;
  pending_kyc: number;
  pending_moderation: number;
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
