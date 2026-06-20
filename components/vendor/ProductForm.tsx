"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchCategories, createVendorProduct, updateVendorProduct, submitProductForReview } from '@/lib/api/vendor';
import type { VendorProduct, Category } from '@/lib/types';
import { Package, DollarSign, List, Tag, Image as ImageIcon, AlertTriangle, Layers, Tag as TagIcon, Settings, ClipboardList, FileText, Shield } from 'lucide-react';

interface ProductFormProps {
  initialData?: VendorProduct | null;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variants, setVariants] = useState<Array<any>>([]);
  const [tagsInput, setTagsInput] = useState('');
  const isEditing = !!initialData;

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      stock: initialData?.stock || 0,
      low_stock_threshold: initialData?.low_stock_threshold || 10,
      category: initialData?.category || '',
      is_active: initialData?.is_active ?? true,
      is_digital: initialData?.is_digital ?? false,
      sku: initialData?.sku || '',
      barcode: initialData?.barcode || '',
      weight: initialData?.weight || 0,
      length: initialData?.length || 0,
      width: initialData?.width || 0,
      height: initialData?.height || 0,
      brand: initialData?.brand || '',
      meta_title: initialData?.meta_title || '',
      meta_description: initialData?.meta_description || '',
      is_featured: initialData?.is_featured ?? false,
      is_archived: initialData?.is_archived ?? false,
      backorder_allowed: initialData?.backorder_allowed ?? false,
      out_of_stock_auto_hide: initialData?.out_of_stock_auto_hide ?? false,
    }
  });

  const productName = watch('name');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    if (initialData) {
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        stock: initialData.stock || 0,
        low_stock_threshold: initialData.low_stock_threshold || 10,
        category: initialData.category || '',
        is_active: initialData.is_active ?? true,
        is_digital: initialData.is_digital ?? false,
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        weight: initialData.weight || 0,
        length: initialData.length || 0,
        width: initialData.width || 0,
        height: initialData.height || 0,
        brand: initialData.brand || '',
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        is_featured: initialData.is_featured ?? false,
        is_archived: initialData.is_archived ?? false,
        backorder_allowed: initialData.backorder_allowed ?? false,
        out_of_stock_auto_hide: initialData.out_of_stock_auto_hide ?? false,
      });
      // Init tags as comma‑separated string
      setTagsInput((initialData.tags || []).join(', '));
      // Init variants if any
      if (initialData.variants) {
        setVariants(initialData.variants.map(v => ({
          sku: v.sku,
          price: v.price,
          name: v.name,
          value: v.value,
          stock: v.stock,
          price_adjustment: v.price_adjustment,
        })));
      }
    }
  }, [initialData, reset]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const addVariant = () => {
    setVariants([...variants, { sku: '', price: 0, name: '', value: '', stock: 0, price_adjustment: 0 }]);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const onSubmit = async (data: any, event: any) => {
    setIsSubmitting(true);
    const submitterName = event?.nativeEvent?.submitter?.name;
    try {
      const formData = new FormData();
      // Basic fields
      formData.append('name', data.name);
      formData.append('slug', generateSlug(data.name));
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('stock', data.stock.toString());
      formData.append('low_stock_threshold', data.low_stock_threshold.toString());
      formData.append('sku', data.sku);
      formData.append('barcode', data.barcode);
      formData.append('weight', data.weight.toString());
      formData.append('length', data.length.toString());
      formData.append('width', data.width.toString());
      formData.append('height', data.height.toString());
      formData.append('brand', data.brand);
      formData.append('meta_title', data.meta_title);
      formData.append('meta_description', data.meta_description);
      formData.append('is_featured', data.is_featured.toString());
      formData.append('is_archived', data.is_archived.toString());
      formData.append('backorder_allowed', data.backorder_allowed.toString());
      formData.append('out_of_stock_auto_hide', data.out_of_stock_auto_hide.toString());
      formData.append('is_active', data.is_active.toString());
      formData.append('is_digital', data.is_digital.toString());
      if (data.category) formData.append('category', data.category);
      // Tags – split by commas, trim, and JSON‑stringify for backend list field
      const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t);
      formData.append('tags', JSON.stringify(tagsArray));
      // Variants – send as JSON string
      if (variants.length) {
        formData.append('variants', JSON.stringify(variants));
      }
      // Images – support multiple uploads
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput && fileInput.files) {
        Array.from(fileInput.files).forEach((file, idx) => {
          formData.append(`images[${idx}]`, file);
        });
      }

      let savedProduct;
      if (isEditing && initialData?.id) {
        savedProduct = await updateVendorProduct(initialData.id, formData);
        toast.success('Product updated successfully and set to Draft.');
      } else {
        savedProduct = await createVendorProduct(formData);
        toast.success('Product created successfully!');
      }

      if (submitterName === 'submit_review') {
        const reviewRes = await submitProductForReview(savedProduct.id);
        toast.success(reviewRes.message);
      }

      router.push('/vendor/products');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'An error occurred while saving the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 transition-all">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
          <Package className="mr-3 h-6 w-6 text-primary-500" />
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Fill in the details below to {isEditing ? 'update your' : 'publish a new'} product to your store.
        </p>
      </div>

      {initialData?.status === 'REJECTED' && initialData?.rejection_reason && (
        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Product Rejected</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{initialData.rejection_reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
            <div className="mt-2 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800">
                <Tag className="h-4 w-4" />
              </span>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
                placeholder="e.g., Wireless Bluetooth Headphones"
              />
            </div>
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message as string}</p>}
            {productName && (
              <p className="mt-1 text-xs text-gray-500">Slug: {generateSlug(productName)}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <div className="mt-2">
              <textarea
                rows={4}
                {...register('description', { required: 'Description is required' })}
                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
                placeholder="Detailed description of the product..."
              />
            </div>
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message as string}</p>}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
            <div className="mt-2 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800">
                <DollarSign className="h-4 w-4" />
              </span>
              <input
                type="number"
                step="0.01"
                {...register('price', { required: 'Price is required', min: 0 })}
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
            <div className="mt-2">
              <input
                type="number"
                {...register('stock', { required: 'Stock is required', min: 0 })}
                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Threshold</label>
            <div className="mt-2">
              <input
                type="number"
                {...register('low_stock_threshold', { min: 0 })}
                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Categorization & Options */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <div className="mt-2 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800">
                <List className="h-4 w-4" />
              </span>
              <select
                {...register('category')}
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4 pt-8">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label className="font-medium text-gray-900 dark:text-white">Active Product</label>
                <p className="text-gray-500 dark:text-gray-400">Make this product visible in the store.</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  {...register('is_digital')}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label className="font-medium text-gray-900 dark:text-white">Digital Product</label>
                <p className="text-gray-500 dark:text-gray-400">This product does not require shipping.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Image</label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" aria-hidden="true" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500"
                >
                  <span>Upload a file</span>
                  <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-gray-200 dark:border-gray-800 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            name="save_draft"
            disabled={isSubmitting}
            className="rounded-md bg-white px-8 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="submit"
            name="submit_review"
            disabled={isSubmitting}
            className="rounded-md bg-primary-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Save & Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
