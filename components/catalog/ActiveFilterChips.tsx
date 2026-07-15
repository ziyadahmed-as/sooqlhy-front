"use client";
import { X } from "lucide-react";
import type { ActiveFilters } from "./FilterSidebar";
import type { Category } from "@/lib/types";

interface Props {
  filters: ActiveFilters;
  categories: Category[];
  onRemove: (key: keyof ActiveFilters) => void;
  onClearAll: () => void;
}

interface Chip {
  key: keyof ActiveFilters;
  label: string;
}

function buildChips(filters: ActiveFilters, categories: Category[]): Chip[] {
  const chips: Chip[] = [];

  if (filters.category) {
    const cat = categories.find((c) => String(c.id) === filters.category);
    chips.push({ key: "category", label: `Category: ${cat?.name ?? filters.category}` });
  }
  if (filters.subcategory) {
    const sub = categories.find((c) => String(c.id) === filters.subcategory);
    chips.push({ key: "subcategory", label: `Subcategory: ${sub?.name ?? filters.subcategory}` });
  }
  if (filters.brand) chips.push({ key: "brand", label: `Brand: ${filters.brand}` });
  if (filters.minPrice && filters.maxPrice)
    chips.push({ key: "minPrice", label: `$${filters.minPrice} – $${filters.maxPrice}` });
  else if (filters.minPrice)
    chips.push({ key: "minPrice", label: `From $${filters.minPrice}` });
  else if (filters.maxPrice)
    chips.push({ key: "maxPrice", label: `Up to $${filters.maxPrice}` });
  if (filters.minRating) chips.push({ key: "minRating", label: `${filters.minRating}★ & up` });
  if (filters.inStock) chips.push({ key: "inStock", label: "In Stock" });
  if (filters.onSale) chips.push({ key: "onSale", label: "On Sale" });
  if (filters.condition) chips.push({ key: "condition", label: `Condition: ${filters.condition}` });
  if (filters.vendor) chips.push({ key: "vendor", label: `Vendor: ${filters.vendor}` });
  if (filters.color) chips.push({ key: "color", label: `Color: ${filters.color}` });
  if (filters.size) chips.push({ key: "size", label: `Size: ${filters.size}` });

  return chips;
}

export default function ActiveFilterChips({ filters, categories, onRemove, onClearAll }: Props) {
  const chips = buildChips(filters, categories);
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Active:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy/10 text-navy text-xs font-semibold border border-navy/20 hover:bg-navy/15 transition-colors group"
        >
          {chip.label}
          <button
            onClick={() => onRemove(chip.key)}
            className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-navy/20 hover:bg-navy hover:text-white flex items-center justify-center transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors ml-1 underline underline-offset-2"
      >
        Clear All
      </button>
    </div>
  );
}
