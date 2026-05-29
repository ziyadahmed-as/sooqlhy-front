"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#1a5fa8] text-white hover:bg-[#1a5fa8]/90',
  accent: 'bg-[#f4a92a] text-white hover:bg-[#f4a92a]/90',
  outline: 'bg-transparent border-2 border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A]/5',
  ghost: 'bg-transparent text-[#0B1F3A] hover:bg-[#0B1F3A]/10 shadow-none',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );
    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {loading ? (
          <motion.span
            className="mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full inline-block"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        ) : null as React.ReactNode}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
