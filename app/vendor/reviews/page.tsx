"use client";
import { useCallback, useEffect, useState } from "react";
import { Star, RefreshCw, MessageSquare, Send } from "lucide-react";
import api from "@/lib/api/axios";
import type { Review } from "@/lib/types";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-3.5 h-3.5", s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700")} />
      ))}
    </div>
  );
}

export default function VendorReviewsPage() {
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [loading, setLoading]       = useState(true);
  const [replyingId, setReplyingId] = useState<string | number | null>(null);
  const [replyText, setReplyText]   = useState("");
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Get vendor's products then their reviews
      const { data: prods } = await api.get("/api/products/product/my_products/");
      const products = Array.isArray(prods) ? prods : prods.results ?? [];
      if (products.length === 0) { setReviews([]); return; }
      const productIds = products.map((p: any) => p.id);
      const all: Review[] = [];
      await Promise.allSettled(
        productIds.slice(0, 20).map(async (pid: number) => {
          const { data } = await api.get("/api/products/reviews/", { params: { product: pid } });
          const revs = Array.isArray(data) ? data : data.results ?? [];
          all.push(...revs.map((r: any) => ({ ...r, product_name: products.find((p: any) => p.id === pid)?.name })));
        })
      );
      all.sort((a: any, b: any) => new Date((b as any).created_at).getTime() - new Date((a as any).created_at).getTime());
      setReviews(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReply = async (reviewId: string | number) => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/api/products/reviews/${reviewId}/`, { vendor_response: replyText });
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, vendor_response: replyText } : r));
      setReplyingId(null);
      setReplyText("");
      toast.success("Reply posted");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSaving(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <VendorPageWrapper
      title="Product Reviews"
      subtitle="View and respond to customer reviews for your products."
      actions={
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{avgRating}</p>
          <div className="flex justify-center mt-1"><StarRow rating={Math.round(Number(avgRating))} /></div>
          <p className="text-xs text-gray-400 mt-1">Average Rating</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total Reviews</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{reviews.filter(r => r.vendor_response).length}</p>
          <p className="text-xs text-gray-400 mt-1">Replied</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Customer reviews will appear here once you have approved products." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(typeof r.user === "string" ? r.user : (r as any).user_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {typeof r.user === "string" ? r.user : (r as any).user_name || "Customer"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRow rating={r.rating} />
                      {r.is_verified_purchase && (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                  </p>
                  {(r as any).product_name && (
                    <p className="text-xs text-gray-500 mt-0.5">{(r as any).product_name}</p>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.comment}</p>

              {/* Existing vendor response */}
              {r.vendor_response && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Your Response</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{r.vendor_response}</p>
                </div>
              )}

              {/* Reply controls */}
              {replyingId === r.id ? (
                <div className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response…"
                    rows={3}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReply(r.id)}
                      disabled={saving || !replyText.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />{saving ? "Posting…" : "Post Reply"}
                    </button>
                    <button
                      onClick={() => { setReplyingId(null); setReplyText(""); }}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                !r.vendor_response && (
                  <button
                    onClick={() => { setReplyingId(r.id); setReplyText(""); }}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reply to this review
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </VendorPageWrapper>
  );
}
