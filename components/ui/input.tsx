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
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50',
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
