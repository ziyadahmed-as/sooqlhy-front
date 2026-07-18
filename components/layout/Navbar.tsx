// components/layout/Navbar.tsx
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingCart, Bell, LogOut, User, Package } from 'lucide-react';
import { useIsMounted } from '@/hooks/use-is-mounted';

export const Navbar = () => {
  const router = useRouter();
  const isMounted = useIsMounted();
  const { user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { unreadCount, loadNotifications } = useNotificationStore();

  // Load notifications on mount for authenticated users
  useEffect(() => {
    if (user) loadNotifications();
  }, [user, loadNotifications]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const roleNavLinks: Record<string, { href: string; label: string }[]> = {
    buyer: [
      { href: '/buyer/catalog', label: 'Catalog' },
      { href: '/buyer/orders', label: 'My Orders' },
    ],
    vendor: [
      { href: '/vendor/dashboard', label: 'Dashboard' },
      { href: '/vendor/products', label: 'Products' },
      { href: '/vendor/orders', label: 'Orders' },
      { href: '/vendor/finance', label: 'Finance' },
    ],
    driver: [
      { href: '/driver/dashboard', label: 'Dashboard' },
      { href: '/driver/deliveries', label: 'Deliveries' },
    ],
    moderator: [
      { href: '/moderator/kyc-review', label: 'KYC Review' },
      { href: '/moderator/products', label: 'Products' },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
    ],
  };

  const activeUser = isMounted ? user : null;
  const role = activeUser?.role?.toLowerCase() ?? '';
  const navLinks = roleNavLinks[role] ?? [];
  const activeCartCount = isMounted ? cartCount : 0;
  const activeUnreadCount = isMounted ? unreadCount : 0;

  return (
    <nav className={cn('bg-[#0B1F3A] text-white', 'flex items-center justify-between px-4 py-3 shadow-md')}>
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-lg font-bold text-white hover:text-amber-400 transition-colors">
          Sooqly
        </Link>
        {navLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block"
          >
            {item.label}
          </Link>
        ))}
        {!activeUser && (
          <Link href="/buyer/catalog" className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block">
            Catalog
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Cart */}
        {(role === 'buyer' || !activeUser) && (
          <Link href="/buyer/cart" className="relative text-gray-300 hover:text-white transition-colors" aria-label="Shopping cart">
            <ShoppingCart className="h-5 w-5" />
            {activeCartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {activeCartCount > 99 ? '99+' : activeCartCount}
              </span>
            )}
          </Link>
        )}

        {/* Notifications */}
        {activeUser && (
          <button className="relative text-gray-300 hover:text-white transition-colors" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {activeUnreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {activeUnreadCount > 99 ? '99+' : activeUnreadCount}
              </span>
            )}
          </button>
        )}

        {activeUser ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-300 hidden sm:block">{activeUser.name || activeUser.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        ) : (
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};
