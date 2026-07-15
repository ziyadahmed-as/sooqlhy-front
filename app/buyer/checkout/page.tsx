"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, useCartTotal } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { checkout } from "@/lib/api/orders";
import { validateCoupon } from "@/lib/api/promotions";
import api from "@/lib/api/axios";
import { toast } from "sonner";
import {
  MapPin, CreditCard, ShoppingBag, ChevronRight, Plus,
  Tag, Check, Loader2, Package, Shield, Truck, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Address {
  id: string | number;
  street_address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  address_type?: string;
  is_default?: boolean;
}

// ─── Steps ───────────────────────────────────────────────────────────────────
const STEPS = ["Address", "Payment", "Review"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${i === current ? "bg-navy text-white" : i < current ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
            {i < current ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
            {label}
          </div>
          {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
        </div>
      ))}
    </div>
  );
}

// ─── Address Step ─────────────────────────────────────────────────────────────
function AddressStep({ onNext }: { onNext: (addr: Address) => void }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ street_address: "", city: "", state: "", country: "", postal_code: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/users/addresses/")
      .then((r) => {
        const data: Address[] = Array.isArray(r.data) ? r.data : r.data.results ?? [];
        setAddresses(data);
        const def = data.find((a) => a.is_default) ?? data[0] ?? null;
        setSelected(def);
        if (data.length === 0) setAdding(true);
      })
      .catch(() => setAdding(true))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.street_address || !form.city || !form.country) { toast.error("Street, city and country are required"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/api/users/addresses/", { ...form, address_type: "HOME", is_default: addresses.length === 0 });
      setAddresses((p) => [...p, data]);
      setSelected(data);
      setAdding(false);
      toast.success("Address saved");
    } catch { toast.error("Failed to save address"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-navy" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-navy" /> Delivery Address</h2>
      {addresses.map((addr) => (
        <button key={addr.id} onClick={() => setSelected(addr)}
          className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${selected?.id === addr.id ? "border-navy bg-navy/5" : "border-gray-200 hover:border-gray-300"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{addr.street_address}</p>
              <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.postal_code}</p>
              <p className="text-sm text-gray-500">{addr.country}</p>
            </div>
            {selected?.id === addr.id && <Check className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />}
            {addr.is_default && <span className="text-[10px] font-bold text-navy bg-navy/10 px-2 py-0.5 rounded-full ml-2">Default</span>}
          </div>
        </button>
      ))}
      {adding ? (
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-bold text-gray-700">New Address</p>
          {[["street_address", "Street address"], ["city", "City"], ["state", "Region / State"], ["country", "Country"], ["postal_code", "Postal code (optional)"]].map(([k, lbl]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lbl}</label>
              <input value={(form as any)[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy focus:outline-none" />
            </div>
          ))}
          <div className="flex gap-2">
            {addresses.length > 0 && <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>}
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-navy text-white text-sm font-bold hover:bg-trust disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Address
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm font-semibold text-navy hover:text-trust transition-colors">
          <Plus className="w-4 h-4" /> Add new address
        </button>
      )}
      <button onClick={() => selected && onNext(selected)} disabled={!selected}
        className="w-full py-3.5 rounded-xl bg-navy text-white font-bold hover:bg-trust disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
        Continue to Payment <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Payment Step ─────────────────────────────────────────────────────────────
function PaymentStep({ onNext, onBack }: { onNext: (gateway: string, currency: string) => void; onBack: () => void }) {
  const [gateway, setGateway] = useState("CHAPA");
  const [currency, setCurrency] = useState("ETB");
  const GATEWAYS = [
    { id: "CHAPA",  label: "Chapa",  sub: "Ethiopian Birr (ETB)", currency: "ETB",  logo: "🇪🇹" },
    { id: "STRIPE", label: "Stripe", sub: "US Dollar (USD)",       currency: "USD",  logo: "💳" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-navy" /> Payment Method</h2>
      {GATEWAYS.map((g) => (
        <button key={g.id} onClick={() => { setGateway(g.id); setCurrency(g.currency); }}
          className={`w-full text-left rounded-xl border-2 p-4 flex items-center gap-4 transition-colors ${gateway === g.id ? "border-navy bg-navy/5" : "border-gray-200 hover:border-gray-300"}`}>
          <span className="text-3xl">{g.logo}</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">{g.label}</p>
            <p className="text-xs text-gray-500">{g.sub}</p>
          </div>
          {gateway === g.id && <Check className="w-5 h-5 text-navy" />}
        </button>
      ))}
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 flex items-start gap-2">
        <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">Your payment is secured with end-to-end encryption. We never store your card details.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
        <button onClick={() => onNext(gateway, currency)} className="flex-1 py-3.5 rounded-xl bg-navy text-white font-bold hover:bg-trust transition-colors flex items-center justify-center gap-2">
          Review Order <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Order Summary sidebar ────────────────────────────────────────────────────
function OrderSummary({ coupon, setCoupon, discount, setDiscount, deliveryFee }:
  { coupon: string; setCoupon: (v: string) => void; discount: number; setDiscount: (v: number) => void; deliveryFee: number }) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartTotal();
  const [couponInput, setCouponInput] = useState("");
  const [validating, setValidating] = useState(false);

  const applyCode = async () => {
    if (!couponInput.trim()) return;
    setValidating(true);
    try {
      const c = await validateCoupon(couponInput.trim().toUpperCase());
      const disc = c.discount_type === "PERCENTAGE" ? (subtotal * Number(c.value)) / 100 : Number(c.value);
      setDiscount(Math.min(disc, subtotal));
      setCoupon(c.code);
      toast.success(`Coupon "${c.code}" applied — you save $${disc.toFixed(2)}`);
    } catch { toast.error("Invalid or expired coupon code"); }
    finally { setValidating(false); }
  };

  const total = subtotal - discount + deliveryFee;
  const getImg = (product: any): string => {
    if (!product.images?.length) return "/placeholder.jpg";
    const i = product.images[0];
    return typeof i === "string" ? i : i?.image || "/placeholder.jpg";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 sticky top-24">
      <h3 className="font-bold text-gray-900">Order Summary</h3>
      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image src={getImg(product)} alt={product.name || "Product"} fill className="object-cover" sizes="48px" />
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] flex items-center justify-center rounded-full bg-navy text-white text-[9px] font-black">{quantity}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{product.name || product.title}</p>
              <p className="text-xs text-gray-400">${Number(product.price).toFixed(2)} each</p>
            </div>
            <p className="text-xs font-bold text-gray-900">${(Number(product.price) * quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="COUPON CODE"
          className="flex-1 text-xs rounded-xl border border-gray-200 px-3 py-2 focus:border-navy focus:outline-none uppercase" />
        <button onClick={applyCode} disabled={validating || !!coupon}
          className="px-4 py-2 rounded-xl bg-gold text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1">
          {validating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />} Apply
        </button>
      </div>
      <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        {discount > 0 && <div className="flex justify-between text-emerald-600 font-medium"><span>Coupon ({coupon})</span><span>-${discount.toFixed(2)}</span></div>}
        <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{deliveryFee === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `$${deliveryFee.toFixed(2)}`}</span></div>
        <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Review Step ──────────────────────────────────────────────────────────────
function ReviewStep({ address, gateway, currency, discount, deliveryFee, onBack, onPlace }:
  { address: Address; gateway: string; currency: string; discount: number; deliveryFee: number; onBack: () => void; onPlace: () => void }) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartTotal();
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Package className="w-5 h-5 text-navy" /> Review Your Order</h2>
      <div className="rounded-xl border border-gray-200 p-4 space-y-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery to</p>
        <p className="text-sm font-semibold text-gray-900">{address.street_address}</p>
        <p className="text-sm text-gray-500">{address.city}, {address.state} · {address.country}</p>
      </div>
      <div className="rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment via</p>
        <p className="text-sm font-semibold text-gray-900">{gateway} · {currency}</p>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 flex items-center gap-2">
        <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">Estimated delivery: <span className="font-bold">3–5 business days</span> after confirmation.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
        <button onClick={onPlace} className="flex-2 flex-1 py-3.5 rounded-xl bg-emerald-500 text-white font-black hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm">
          <Shield className="w-4 h-4" /> Place Order · ${(subtotal - discount + deliveryFee).toFixed(2)}
        </button>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ orderId }: { orderId: string }) {
  return (
    <div className="text-center py-12 space-y-5">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-gray-900">Order Placed!</h2>
        <p className="text-gray-500 mt-1 text-sm">Order #{orderId} confirmed. You'll receive an email shortly.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/buyer/orders" className="px-6 py-3 rounded-xl bg-navy text-white text-sm font-bold hover:bg-trust transition-colors">View Orders</Link>
        <Link href="/buyer/catalog" className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Continue Shopping</Link>
      </div>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address | null>(null);
  const [gateway, setGateway] = useState("CHAPA");
  const [currency, setCurrency] = useState("ETB");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const DELIVERY_FEE = 0; // free shipping

  useEffect(() => {
    if (!user) { openAuthModal("login"); }
  }, [user, openAuthModal]);

  useEffect(() => {
    if (items.length === 0 && !orderId) router.replace("/buyer/cart");
  }, [items, orderId, router]);

  const handlePlace = async () => {
    setPlacing(true);
    try {
      const orders = await checkout({ currency, payment_gateway: gateway });
      clearCart();
      setOrderId(orders[0]?.id ?? "—");
      toast.success("Order placed successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-500 text-sm">Please sign in to continue checkout.</p>
          <button onClick={() => openAuthModal("login")} className="px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-trust transition-colors">Sign In</button>
        </div>
      </div>
    );
  }

  if (orderId) return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <SuccessScreen orderId={orderId} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/buyer/cart" className="text-sm text-gray-400 hover:text-navy transition-colors flex items-center gap-1">
            ← Back to Cart
          </Link>
          <h1 className="text-2xl font-black text-gray-900 mt-2 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-navy" /> Checkout
          </h1>
        </div>
        <StepIndicator current={step} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {placing ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-navy" />
                <p className="text-sm font-medium text-gray-600">Placing your order…</p>
              </div>
            ) : step === 0 ? (
              <AddressStep onNext={(addr) => { setAddress(addr); setStep(1); }} />
            ) : step === 1 ? (
              <PaymentStep onNext={(g, c) => { setGateway(g); setCurrency(c); setStep(2); }} onBack={() => setStep(0)} />
            ) : (
              <ReviewStep address={address!} gateway={gateway} currency={currency}
                discount={discount} deliveryFee={DELIVERY_FEE}
                onBack={() => setStep(1)} onPlace={handlePlace} />
            )}
          </div>
          <div>
            <OrderSummary coupon={coupon} setCoupon={setCoupon} discount={discount} setDiscount={setDiscount} deliveryFee={DELIVERY_FEE} />
          </div>
        </div>
      </div>
    </div>
  );
}
