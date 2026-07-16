// lib/utils.ts
import { twMerge } from "tailwind-merge";

type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

function clsx(...inputs: ClassValue[]): string {
  const result: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      result.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = clsx(...input);
      if (inner) result.push(inner);
    } else if (typeof input === "object") {
      for (const [key, val] of Object.entries(input)) {
        if (val) result.push(key);
      }
    }
  }
  return result.join(" ");
}

/**
 * Merges Tailwind classes, deduplicating conflicting utilities.
 * Accepts strings, arrays, and conditional objects (clsx-style).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
