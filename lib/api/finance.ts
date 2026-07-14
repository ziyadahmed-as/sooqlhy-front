// lib/api/finance.ts
import api from './axios';
import type { Wallet, Transaction, WithdrawalRequest, PaginatedResponse } from '@/lib/types';

export const fetchWallets = async (): Promise<Wallet[]> => {
  const { data } = await api.get('/api/finance/wallets/');
  return Array.isArray(data) ? data : data.results ?? [];
};

export const fetchTransactions = async (params?: Record<string, string | number>): Promise<Transaction[]> => {
  const { data } = await api.get('/api/finance/transactions/', { params });
  return Array.isArray(data) ? data : data.results ?? [];
};

export const fetchWithdrawals = async (): Promise<WithdrawalRequest[]> => {
  const { data } = await api.get('/api/finance/withdrawals/');
  return Array.isArray(data) ? data : data.results ?? [];
};

export const requestWithdrawal = async (payload: { amount: string; bank_details: string }): Promise<WithdrawalRequest> => {
  const { data } = await api.post<WithdrawalRequest>('/api/finance/withdrawals/', payload);
  return data;
};
