// components/layout/Navbar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, logout } = useAuthStore();

  const navigation = [
    { href: '/', label: 'Home' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className={cn('bg-navy text-white', 'flex items-center justify-between px-4 py-2')}>
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-lg font-bold">
          Sooqly
        </Link>
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className="hover:underline">
            {item.label}
          </Link>
        ))}
        {user?.role === 'vendor' && (
          <Link href="/vendor/products" className="hover:underline">
            Vendor Products
          </Link>
        )}
        {user?.role === 'driver' && (
          <Link href="/driver/deliveries" className="hover:underline">
            Deliveries
          </Link>
        )}
        {user?.role === 'admin' && (
          <Link href="/admin/dashboard" className="hover:underline">
            Admin Dashboard
          </Link>
        )}
        {user?.role === 'moderator' && (
          <Link href="/moderator/reports" className="hover:underline">
            Moderation
          </Link>
        )}
        {user?.role === 'buyer' && (
          <Link href="/buyer/orders" className="hover:underline">
            My Orders
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {user && (
          <>
            <span className="mr-2">{user.name || user.email}</span>
            <Button variant="outline" onClick={logout} size="sm">
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};
