export type PaymentType = "CASH" | "CARD" | "TRANSFER" | "MIXED" | "DEBT";
export type SaleStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "RETURNED";

export interface SaleWithDetails {
  id: string;
  saleNumber: string;
  totalAmount: number;
  paidAmount: number;
  discount: number;
  paymentType: PaymentType;
  status: SaleStatus;
  note?: string | null;
  createdAt: Date;
  customer?: { id: string; name: string; phone?: string | null } | null;
  user: { id: string; name: string };
  branch: { id: string; name: string };
  items: SaleItemDetail[];
}

export interface SaleItemDetail {
  id: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  variant: {
    id: string;
    barcode: string;
    product: { name: string };
    size?: { name: string } | null;
    color?: { name: string } | null;
  };
}
