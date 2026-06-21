export interface ProductVariantWithStock {
  id: string;
  barcode: string;
  sku?: string | null;
  costPrice?: number | null;
  sellPrice?: number | null;
  size?: { id: string; name: string } | null;
  color?: { id: string; name: string; hexCode?: string | null } | null;
  stockItems: { quantity: number; warehouseId: string }[];
  totalStock: number;
}

export interface ProductWithDetails {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  costPrice: number;
  sellPrice: number;
  isActive: boolean;
  createdAt: Date;
  category: { id: string; name: string };
  brand?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
  images: { id: string; url: string; isPrimary: boolean }[];
  variants: ProductVariantWithStock[];
}

export interface CartItem {
  variantId: string;
  productName: string;
  barcode: string;
  size?: string;
  color?: string;
  sellPrice: number;
  quantity: number;
  discount: number;
  maxStock: number;
}
