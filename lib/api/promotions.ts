import api from './axios';

export interface Coupon {
    id: number;
    code: string;
    discount_type: 'PERCENTAGE' | 'FIXED';
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

export const fetchFlashSales = async (): Promise<FlashSale[]> => {
    const response = await api.get('/api/promotions/flash-sales/');
    return response.data;
};

export const validateCoupon = async (code: string): Promise<Coupon> => {
    const response = await api.post('/api/promotions/coupons/validate/', { code });
    return response.data;
};
