"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  module: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string; email: string };
}

const MODULES = ["products", "sales", "customers", "debts", "employees", "roles", "warehouse", "settings"];

export default function AuditLogsPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [module, setModule] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (module) params.set("module", module);
    const res = await fetch(`/api/audit-logs?${params}`);
    const result = await res.json();
    if (result.success) { setData(result.data); setTotal(result.pagination.total); }
    setIsLoading(false);
  }, [page, module]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: "user", header: "Foydalanuvchi", cell: (r: AuditLog) => <div><p className="font-medium text-sm">{r.user.name}</p><p className="text-xs text-muted-foreground">{r.user.email}</p></div> },
    { key: "action", header: "Amal", cell: (r: AuditLog) => <Badge variant="outline">{r.action}</Badge> },
    { key: "module", header: "Modul", cell: (r: AuditLog) => <span className="text-muted-foreground text-sm">{r.module}</span> },
    { key: "entityId", header: "ID", cell: (r: AuditLog) => <span className="font-mono text-xs text-muted-foreground">{r.entityId?.slice(0, 8) || "—"}</span> },
    { key: "ip", header: "IP", cell: (r: AuditLog) => <span className="font-mono text-xs text-muted-foreground">{r.ipAddress || "—"}</span> },
    { key: "date", header: "Sana", cell: (r: AuditLog) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Audit jurnali</h1><p className="text-muted-foreground">Tizimda barcha o'zgarishlar</p></div>

      <Select value={module} onValueChange={(v) => { setModule(v === "all" ? "" : v); setPage(1); }}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Barcha modullar" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Barcha modullar</SelectItem>
          {MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Jurnal bo'sh" />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />
    </div>
  );
}
