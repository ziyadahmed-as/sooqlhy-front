import api from './axios';

export const searchProducts = async (query: string): Promise<any[]> => {
    const response = await api.get(`/api/search/?q=${encodeURIComponent(query)}`);
    return response.data;
};
