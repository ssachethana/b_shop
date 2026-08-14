// types/product-types.ts
// Shared types for the product details feature.
// Import from here in both ProductDetailsPage and BatchesTab.

export interface Supplier {
  id: number;
  name: string;
}

export interface Batch {
  id: number;
  quantity: number;
  remaining: number;
  costPerUnit: number;
  sellPrice: number | null;
  purchasedAt: string;
  expiryDate: string | null;
  supplier: Supplier | null;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  category: { name: string } | null;
  unit: { name: string; symbol: string } | null;
  brand: { name: string } | null;
  shopId: number;
  batches: Batch[];
  valuationMethod: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface EditForm {
  name: string;
  sku: string;
  barcode: string;
  description: string;
  valuationMethod: string;
  imageUrl: string;
}

export interface BatchForm {
  quantity: string;
  costPerUnit: string;
  sellPrice: string;
  expiryDate: string;
  supplierId: string;
}

export const BATCH_FORM_DEFAULT: BatchForm = {
  quantity: '',
  costPerUnit: '',
  sellPrice: '',
  expiryDate: '',
  supplierId: '',
};