// ─── Enums (mirror schema) ────────────────────────────────────────────────────

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";
export type SaleStatus = "COMPLETED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "CANCELED";
export type DiscountType = "PERCENT" | "FIXED";

// ─── Core domain types ────────────────────────────────────────────────────────

export interface Unit {
  id: number;
  name: string;
  symbol: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface ActivePromotion {
  id: number;
  name: string;
  discountType: DiscountType;
  value: number;
}

/** A single purchase batch that still has stock and hasn't expired */
export interface ProductBatch {
  id: number;
  sellPrice: number | null;
  costPerUnit: number | null;
  remaining: number;
  purchasedAt: string; // ISO date string
  expiryDate: string | null;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  lowStockThreshold: number;
  isActive: boolean;
  displayProductInApp: boolean;
  unit: Unit;
  category: Category;
  brand?: Brand | null;
  // Derived / computed from batches
  currentStock: number;
  sellPrice: number | null;       // from the first (oldest) active batch
  costPerUnit: number | null;
  activePromotion?: ActivePromotion | null;
  /** ALL valid batches (remaining > 0, not expired) – returned by the API */
  batches: ProductBatch[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;       // effective sell price (after promotion, or manual override)
  originalPrice: number;  // sell price before any discount
  discountAmount: number; // per-unit discount from active promotion
  lineTotal: number;
  /** The batch chosen for this line item (defaults to the first batch) */
  selectedBatch: ProductBatch | null;
  /** True when the cashier has manually overridden the unit price */
  isPriceOverridden: boolean;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface CreateSaleItemPayload {
  productId: number;
  quantity: number;
  price: number;
  costAtSale: number;
  batchId?: number;
}

export interface CreateSalePayload {
  shopId: number;
  cashierId?: number;
  customerId?: number;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  amountReceived?: number;
  items: CreateSaleItemPayload[];
}

export interface SaleResponse {
  id: number;
  totalAmount: number;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  shopId: number;
  cashierId?: number | null;
  customerId?: number | null;
  createdAt: string;
  items: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    costAtSale: number;
  }[];
}

export interface Customer {
  id: number;
  name: string;
  phone?: string | null;
}

// ─── Numpad ───────────────────────────────────────────────────────────────────

export type NumpadTarget = "payment" | "quantity" | "discount";