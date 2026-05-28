import * as React from 'react';
import { cn } from '@/lib/utils'; // utility for clsx + tailwind-merge
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Additional class names */
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          cn(
            'flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-2 text-sm text-[#0B1F3A] backdrop-blur-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#1a5fa8]/20 focus:border-[#1a5fa8] focus:bg-white disabled:cursor-not-allowed disabled:opacity-50',
            className,
          ),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
