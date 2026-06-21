export type DebtStatus = "ACTIVE" | "PAID" | "OVERDUE" | "CANCELLED";

export interface DebtWithDetails {
  id: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: Date | null;
  status: DebtStatus;
  note?: string | null;
  createdAt: Date;
  customer: { id: string; name: string; phone?: string | null };
  sale?: { id: string; saleNumber: string } | null;
  payments: {
    id: string;
    amount: number;
    type: string;
    createdAt: Date;
    note?: string | null;
  }[];
}
