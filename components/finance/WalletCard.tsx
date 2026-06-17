import React, { useEffect, useState } from 'react';
import { fetchWallets, requestWithdrawal } from '@/lib/api/finance';

export const WalletCard: React.FC = () => {
  const [wallets, setWallets] = useState([]);
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await fetchWallets();
      setWallets(data);
    };
    load();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !bank) return;
    await requestWithdrawal({ amount, bank_details: bank });
    // refresh wallets
    const data = await fetchWallets();
    setWallets(data);
    setAmount('');
    setBank('');
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Your Wallets</h2>
      {wallets.map((w: any) => (
        <div key={w.id} className="border-b py-2">
          <p>Balance: <span className="font-mono">${w.balance}</span></p>
        </div>
      ))}
      <form onSubmit={handleWithdraw} className="mt-4 space-y-2">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Bank details"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button type="submit" className="w-full bg-indigo-600 text-white rounded p-2">Withdraw</button>
      </form>
    </div>
  );
};
