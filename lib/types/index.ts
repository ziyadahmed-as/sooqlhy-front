/* lib/types/index.ts */

/**
 * Common type definitions used across the Sooqly frontend.
 */

export type Role = 'buyer' | 'vendor' | 'driver' | 'moderator' | 'admin';

/**
 * JWT payload shape expected from the authentication server.
 * Must contain the user role and optionally other user info.
 */
export interface JwtPayload {
  sub: string; // user id
  email?: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * Basic user information stored in the auth store.
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

/**
 * Product representation (simplified for the demo).
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // in cents or smallest currency unit
  imageUrl?: string;
}

/**
 * Item stored in the shopping cart.
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Generic API response wrapper.
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}
