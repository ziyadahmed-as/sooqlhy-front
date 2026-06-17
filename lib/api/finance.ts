import api from './axios';

export interface Wallet {
    id: string;
    user: number;
    balance: string;
    created_at: string;
    updated_at: string;
    transactions: Transaction[];
}

export interface Transaction {
    id: number;
    wallet: number;
    amount: string;
    transaction_type: 'CREDIT' | 'DEBIT' | 'FEE' | 'WITHDRAWAL';
    description: string;
    created_at: string;
}

export interface WithdrawalRequest {
    id: number;
    wallet: number;
    amount: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    bank_details: string;
    created_at: string;
    processed_at: string | null;
}

export const fetchWallets = async (): Promise<Wallet[]> => {
    const response = await api.get('/api/finance/wallets/');
    return response.data;
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
    const response = await api.get('/api/finance/transactions/');
    return response.data;
};

export const fetchWithdrawals = async (): Promise<WithdrawalRequest[]> => {
    const response = await api.get('/api/finance/withdrawals/');
    return response.data;
};

export const requestWithdrawal = async (data: { amount: string; bank_details: string }): Promise<WithdrawalRequest> => {
    const response = await api.post('/api/finance/withdrawals/', data);
    return response.data;
};
