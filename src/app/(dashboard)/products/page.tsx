"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Package, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  category: { name: string };
  brand: { name: string } | null;
  costPrice: number;
  sellPrice: number;
  isActive: boolean;
  variants: { stockItems: { quantity: number }[] }[];
}

export default function ProductsPage() {
  const router = useRouter();
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/products?${params}`);
    const result = await res.json();
    if (result.success) {
      setData(result.data);
      setTotal(result.pagination.total);
    }
    setIsLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Mahsulot o'chirildi");
      fetchData();
    } else {
      toast.error("O'chirishda xato");
    }
    setDeleteId(null);
  };

  const getTotalStock = (product: Product) =>
    product.variants.reduce((s, v) => s + v.stockItems.reduce((q, si) => q + si.quantity, 0), 0);

  const columns = [
    {
      key: "name",
      header: "Mahsulot nomi",
      cell: (row: Product) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.category.name}</p>
        </div>
      ),
    },
    {
      key: "brand",
      header: "Brend",
      cell: (row: Product) => row.brand?.name || <span className="text-muted-foreground">—</span>,
    },
    {
      key: "price",
      header: "Narx",
      cell: (row: Product) => (
        <div>
          <p className="font-medium text-green-700">{formatCurrency(row.sellPrice)}</p>
          <p className="text-xs text-muted-foreground">TN: {formatCurrency(row.costPrice)}</p>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Ombor",
      cell: (row: Product) => {
        const stock = getTotalStock(row);
        return (
          <Badge variant={stock === 0 ? "destructive" : stock < 5 ? "warning" : "success"}>
            {stock} ta
          </Badge>
        );
      },
    },
    {
      key: "variants",
      header: "Variantlar",
      cell: (row: Product) => <span className="text-muted-foreground">{row.variants.length} ta</span>,
    },
    {
      key: "status",
      header: "Holat",
      cell: (row: Product) => (
        <Badge variant={row.isActive ? "success" : "secondary"}>
          {row.isActive ? "Faol" : "Nofaol"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row: Product) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); router.push(`/products/${row.id}`); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); router.push(`/products/${row.id}/edit`); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-red-500 hover:text-red-600"
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.id); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-32",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mahsulotlar</h1>
          <p className="text-muted-foreground">Jami: {total} ta mahsulot</p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yangi mahsulot
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulot nomi bo'yicha qidirish..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Mahsulot topilmadi"
        onRowClick={(row) => router.push(`/products/${row.id}`)}
      />

      <Pagination
        page={page}
        totalPages={Math.ceil(total / 20)}
        onPageChange={setPage}
        total={total}
        pageSize={20}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Mahsulotni o'chirish"
        description="Bu mahsulot va uning barcha variantlari o'chiriladi. Bu amalni qaytarib bo'lmaydi."
        onConfirm={handleDelete}
        confirmText="O'chirish"
      />
    </div>
  );
}
