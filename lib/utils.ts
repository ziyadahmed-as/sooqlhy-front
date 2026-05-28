// lib/utils.ts
/**
 * Simple utility to concatenate class names.
 * Works like `clsx` but without the extra bundle size.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
