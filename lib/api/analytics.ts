import api from './axios';

export interface DailyAnalytics {
    id: number;
    date: string;
    page_views: number;
    registrations: number;
    conversions: number;
}

export interface VendorAnalytics {
    total_orders: number;
    revenue_today: number;
    revenue_week: number;
    revenue_month: number;
    revenue_year: number;
    average_order_value: number;
    top_selling_products: Array<{ id: number; name: string; units_sold: number; revenue: number }>;
    customer_satisfaction: number;
    delivery_rating: number;
    revenue_trend: Array<{ date: string; revenue: number }>;
    order_volume: Array<{ date: string; count: number }>;
    rating_distribution: Record<string, number>;
    product_insights: Array<{
        product_id: number;
        name: string;
        views: number;
        add_to_cart: number;
        conversion_rate: number;
        stock: number;
        price: number;
        price_suggestion: number | null;
    }>;
}

export const fetchDailyAnalytics = async (): Promise<DailyAnalytics[]> => {
    const response = await api.get('/api/analytics/daily/');
    return response.data;
};
