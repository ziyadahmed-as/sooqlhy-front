"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/vendor/ProductForm";
import { fetchProductDetails } from "@/lib/api/vendor";
import type { VendorProduct } from "@/lib/types";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<VendorProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProductDetails(id)
      .then(setProduct)
      .catch(() => toast.error("Failed to fetch product details."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <VendorPageWrapper
      title="Edit Product"
      subtitle="Update your product details. Changes will require re-review."
      actions={
        <Link
          href="/vendor/products"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : product ? (
        <ProductForm initialData={product} />
      ) : (
        <div className="text-center py-20 text-gray-500">Product not found.</div>
      )}
    </VendorPageWrapper>
  );
}
