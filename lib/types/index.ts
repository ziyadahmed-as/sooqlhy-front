/*
 * lib/types/index.ts
 * Central TypeScript type definitions for the Sooqly frontend.
 */

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
}

/** Cart item definition */
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

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
