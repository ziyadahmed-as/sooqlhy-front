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
      </div>
      <div className="flex items-center space-x-2">
        {user && (
          <span className="mr-2">{user.name || user.email}</span>
        )}
        <Button variant="outline" onClick={logout} size="sm">
          Logout
        </Button>
      </div>
    </nav>
  );
};
