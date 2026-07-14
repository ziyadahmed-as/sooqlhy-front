"use client";
import { useAuthStore } from '@/stores/auth-store';
import { useState } from 'react';
import { toast } from 'sonner';
import { User, Lock } from 'lucide-react';

export default function BuyerProfilePage() {
  const { user, changePassword, loading, error } = useAuthStore();
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await changePassword(oldPwd, newPwd);
      toast.success('Password changed successfully');
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch {
      toast.error(error || 'Failed to change password');
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <User className="h-6 w-6" /> My Profile
      </h1>

      {/* Profile Info */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Account Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium text-gray-900 dark:text-white">{user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-gray-500">KYC Status</p>
            <p className={`font-medium ${user?.is_verified ? 'text-green-600' : 'text-amber-600'}`}>
              {user?.is_verified ? '✓ Verified' : 'Pending Verification'}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { label: 'Current Password', value: oldPwd, setter: setOldPwd },
            { label: 'New Password', value: newPwd, setter: setNewPwd },
            { label: 'Confirm New Password', value: confirmPwd, setter: setConfirmPwd },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
