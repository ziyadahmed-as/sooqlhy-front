"use client";
import ProductForm from "@/components/vendor/ProductForm";
import { VendorPageWrapper } from "@/components/vendor/VendorPageWrapper";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <VendorPageWrapper
      title="Add New Product"
      subtitle="Fill in the details below to create a new product listing."
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
      <ProductForm />
    </VendorPageWrapper>
  );
}
