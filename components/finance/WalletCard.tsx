import React, { useEffect, useState } from 'react';
import { fetchWallets, requestWithdrawal, Wallet } from '@/lib/api/finance';

export const WalletCard: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWallets();
      setWallets(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !bank || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      await requestWithdrawal({ amount, bank_details: bank });
      await loadWallets();
      setAmount('');
      setBank('');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to request withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && wallets.length === 0) {
    return <div className="p-4 bg-white rounded shadow text-center">Loading wallets...</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Your Wallets</h2>
      
      {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
      
      {wallets.length === 0 ? (
        <p className="text-gray-500 mb-4">No wallets found.</p>
      ) : (
        wallets.map((w: Wallet) => (
          <div key={w.id} className="border-b py-2 mb-4">
            <p className="text-gray-600">Balance: <span className="font-mono font-bold text-gray-900">${w.balance}</span></p>
          </div>
        ))
      )}

      <form onSubmit={handleWithdraw} className="mt-4 space-y-2">
        <h3 className="font-medium text-gray-700">Request Withdrawal</h3>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded p-2"
          min="0.01"
          step="0.01"
          required
          disabled={submitting}
        />
        <input
          type="text"
          placeholder="Bank details"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="w-full border rounded p-2"
          required
          disabled={submitting}
        />
        <button 
          type="submit" 
          disabled={submitting || wallets.length === 0}
          className="w-full bg-indigo-600 text-white rounded p-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {submitting ? 'Processing...' : 'Withdraw'}
        </button>
      </form>
    </div>
  );
};
