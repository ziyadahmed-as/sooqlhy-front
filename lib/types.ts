export interface Product {
  id: string;
  name: string;
  price: number;
  // extend with any additional fields the backend returns
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  is_verified: boolean;
  role: string;
  // additional optional fields
  [key: string]: any;
}
