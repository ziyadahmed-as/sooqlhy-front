import api from './axios';

export interface DailyAnalytics {
    id: number;
    date: string;
    page_views: number;
    registrations: number;
    conversions: number;
}

export const fetchDailyAnalytics = async (): Promise<DailyAnalytics[]> => {
    const response = await api.get('/api/analytics/daily/');
    return response.data;
};
