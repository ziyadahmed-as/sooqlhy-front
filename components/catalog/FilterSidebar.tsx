"use client";
import { useEffect, useRef, useState } from "react";
import {
  SlidersHorizontal, X, Star, ChevronDown, ChevronUp,
  Tag, Layers, Store, DollarSign, CheckSquare, Percent,
  Package, Palette,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Filter State Types ───────────────────────────────────────────────────────

export interface ActiveFilters {
  category: string;
  subcategory: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  inStock: boolean;
  onSale: boolean;
  condition: string;
  vendor: string;
  color: string;
  size: string;
}

export const EMPTY_FILTERS: ActiveFilters = {
  category: "", subcategory: "", brand: "",
  minPrice: "", maxPrice: "",
  minRating: "", inStock: false, onSale: false,
  condition: "", vendor: "", color: "", size: "",
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CONDITIONS = ["New", "Used", "Refurbished", "Open Box"];
const COLORS     = ["Red", "Blue", "Black", "White", "Green", "Yellow", "Pink", "Gray", "Brown", "Orange"];
const SIZES      = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const PRICE_PRESETS = [
  { label: "Under $25",   min: "",    max: "25" },
  { label: "$25 – $50",   min: "25",  max: "50" },
  { label: "$50 – $100",  min: "50",  max: "100" },
  { label: "$100 – $250", min: "100", max: "250" },
  { label: "Over $250",   min: "250", max: "" },
];

// ─── Collapsible Section ─────────────────────────────────────────────────────

function FilterSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-left group"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-gray-800 group-hover:text-navy transition-colors">
          {icon}
          {title}
        </span>
        {open
          ? <ChevronUp   className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function CategoryOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
        active ? "bg-navy text-white font-semibold" : "text-gray-700 hover:bg-gray-50",
      )}
    >
      {label}
    </button>
  );
}

function CheckboxFilter({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 accent-navy cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-navy transition-colors select-none">{label}</span>
    </label>
  );
}

// ─── Inner content (shared between desktop & mobile) ─────────────────────────

interface InnerProps {
  categories: Category[];
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onMobileClose: () => void;
}

function SidebarInner({ categories, filters, onChange, onApply, onReset, onMobileClose }: InnerProps) {
  const set = <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const topCategories = categories.filter((c) => c.parent == null);
  const subcategories = categories.filter((c) => c.parent != null);

  const isPricePresetActive = (p: typeof PRICE_PRESETS[0]) =>
    filters.minPrice === p.min && filters.maxPrice === p.max;

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="font-black text-navy flex items-center gap-2 text-base">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </h2>
        <button
          onClick={onReset}
          className="text-xs text-trust hover:text-navy font-semibold transition-colors"
        >
          Reset all
        </button>
      </div>

      {/* ── Scrollable body ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-0">
        {/* Categories */}
        <FilterSection title="Categories" icon={<Tag className="w-4 h-4 text-navy" />}>
          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            <CategoryOption label="All Categories" active={!filters.category} onClick={() => set("category", "")} />
            {topCategories.map((c) => (
              <CategoryOption
                key={c.id}
                label={c.name}
                active={filters.category === String(c.id)}
                onClick={() => set("category", String(c.id))}
              />
            ))}
          </div>
        </FilterSection>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <FilterSection title="Subcategories" icon={<Layers className="w-4 h-4 text-navy" />} defaultOpen={false}>
            <div className="space-y-0.5 max-h-44 overflow-y-auto">
              {subcategories.map((c) => (
                <CategoryOption
                  key={c.id}
                  label={c.name}
                  active={filters.subcategory === String(c.id)}
                  onClick={() => set("subcategory", String(c.id))}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection title="Price Range" icon={<DollarSign className="w-4 h-4 text-navy" />}>
          <div className="space-y-2.5">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => set("minPrice", e.target.value)}
                min={0}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
              />
              <span className="text-gray-400 flex-shrink-0 text-sm">–</span>
              <input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => set("maxPrice", e.target.value)}
                min={0}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
              />
            </div>
            <div className="space-y-0.5">
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onChange({ ...filters, minPrice: p.min, maxPrice: p.max })}
                  className={cn(
                    "w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors",
                    isPricePresetActive(p)
                      ? "bg-navy/10 text-navy font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Product Rating" icon={<Star className="w-4 h-4 text-navy" />}>
          <div className="space-y-0.5">
            {[
              { label: "Any Rating", val: "" },
              { label: "4★ & up",    val: "4" },
              { label: "3★ & up",    val: "3" },
              { label: "2★ & up",    val: "2" },
            ].map(({ label, val }) => (
              <button
                key={val}
                onClick={() => set("minRating", val)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  filters.minRating === val
                    ? "bg-navy text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {val ? (
                  <>
                    <span className="flex gap-0.5">
                      {Array.from({ length: Number(val) }).map((_, i) => (
                        <Star key={i} className={cn("w-3 h-3 fill-current", filters.minRating === val ? "text-amber-300" : "text-amber-400")} />
                      ))}
                    </span>
                    {label}
                  </>
                ) : label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability" icon={<CheckSquare className="w-4 h-4 text-navy" />}>
          <CheckboxFilter
            label="In Stock Only"
            checked={filters.inStock}
            onChange={(v) => set("inStock", v)}
          />
        </FilterSection>

        {/* Promotions */}
        <FilterSection title="Promotions" icon={<Percent className="w-4 h-4 text-navy" />} defaultOpen={false}>
          <CheckboxFilter
            label="On Sale / Discounted"
            checked={filters.onSale}
            onChange={(v) => set("onSale", v)}
          />
        </FilterSection>

        {/* Condition */}
        <FilterSection title="Condition" icon={<Package className="w-4 h-4 text-navy" />} defaultOpen={false}>
          <div className="space-y-0.5">
            <CategoryOption
              label="All Conditions"
              active={!filters.condition}
              onClick={() => set("condition", "")}
            />
            {CONDITIONS.map((c) => (
              <CategoryOption
                key={c}
                label={c}
                active={filters.condition === c}
                onClick={() => set("condition", c)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Color */}
        <FilterSection title="Color" icon={<Palette className="w-4 h-4 text-navy" />} defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set("color", filters.color === c ? "" : c)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs border transition-all",
                  filters.color === c
                    ? "border-navy bg-navy text-white font-semibold"
                    : "border-gray-200 text-gray-600 hover:border-navy hover:text-navy"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Size */}
        <FilterSection title="Size" icon={<Store className="w-4 h-4 text-navy" />} defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => set("size", filters.size === s ? "" : s)}
                className={cn(
                  "min-w-[40px] h-9 px-2 rounded-lg text-xs border font-medium transition-all",
                  filters.size === s
                    ? "border-navy bg-navy text-white"
                    : "border-gray-200 text-gray-600 hover:border-navy hover:text-navy"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* ── Mobile footer actions ──────────────────────────────────────── */}
      <div className="lg:hidden px-5 py-4 border-t border-gray-100 flex gap-3 bg-white">
        <button
          onClick={() => { onReset(); onMobileClose(); }}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => { onApply(); onMobileClose(); }}
          className="flex-1 py-3 rounded-xl bg-navy text-white text-sm font-bold hover:bg-trust transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// ─── Public Component ─────────────────────────────────────────────────────────

interface Props {
  categories: Category[];
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
  onApply: () => void;
  onReset: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function FilterSidebar({
  categories, filters, onChange, onApply, onReset, mobileOpen, onMobileClose,
}: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const innerProps: InnerProps = { categories, filters, onChange, onApply, onReset, onMobileClose };

  return (
    <>
      {/* ── Desktop sticky sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-[104px] h-[calc(100vh-7.5rem)] overflow-hidden">
        <SidebarInner {...innerProps} />
      </aside>

      {/* ── Mobile full-screen drawer ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Product Filters"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Slide-in panel from right */}
          <div
            ref={drawerRef}
            className="relative ml-auto w-80 max-w-[90vw] bg-white h-full flex flex-col shadow-2xl"
            style={{ animation: "slideInRight 0.25s ease-out" }}
          >
            {/* Close button */}
            <button
              onClick={onMobileClose}
              className="absolute top-3.5 right-4 z-20 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <SidebarInner {...innerProps} />
          </div>
        </div>
      )}

      {/* Slide animation keyframe */}
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
