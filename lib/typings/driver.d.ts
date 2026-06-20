// File: lib/typings/driver.d.ts

export interface DriverProfile {
  id: number;
  userId: number;
  status: string; // AVAILABLE, BUSY, OFFLINE, RESTING
  maxConcurrentDeliveries: number;
  latitude?: number;
  longitude?: number;
  rating?: number;
  // add any other fields you expose via the driver profile endpoint
}

export interface DriverAssignment {
  id: number;
  orderId: number;
  customerName: string;
  address: string;
  status: string; // PENDING, ACCEPTED, REJECTED, IN_TRANSIT, DELIVERED
  // optional tracking info
  trackingNumber?: string;
  // timestamps etc.
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
}

export interface OrderStatusUpdate {
  status: string; // e.g., 'SHIPPED', 'DELIVERED', etc.
  eta?: string; // optional estimated arrival time
}
