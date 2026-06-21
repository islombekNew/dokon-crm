"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  role: { id: string; name: string };
  branch: { name: string } | null;
}

export default function EmployeesPage() {
  const [data, setData] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", roleId: "", branchId: "" });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/employees?${params}`);
    const result = await res.json();
    if (result.success) { setData(result.data); setTotal(result.pagination.total); }
    setIsLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    Promise.all([fetch("/api/roles").then((r) => r.json()), fetch("/api/branches").then((r) => r.json())])
      .then(([r, b]) => { setRoles(r.data || []); setBranches(b.data || []); });
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password || !form.roleId) { toast.error("Barcha majburiy maydonlarni to'ldiring"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await res.json();
      if (result.success) { toast.success("Xodim qo'shildi"); setOpen(false); fetchData(); }
      else toast.error(result.error);
    } finally { setSaving(false); }
  };

  const columns = [
    {
      key: "name",
      header: "Xodim",
      cell: (r: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{r.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Rol", cell: (r: Employee) => <Badge variant="secondary">{r.role.name}</Badge> },
    { key: "branch", header: "Filial", cell: (r: Employee) => r.branch?.name || <span className="text-muted-foreground">—</span> },
    { key: "phone", header: "Telefon", cell: (r: Employee) => r.phone || <span className="text-muted-foreground">—</span> },
    { key: "status", header: "Holat", cell: (r: Employee) => <Badge variant={r.isActive ? "success" : "secondary"}>{r.isActive ? "Faol" : "Nofaol"}</Badge> },
    { key: "date", header: "Qo'shildi", cell: (r: Employee) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Xodimlar</h1><p className="text-muted-foreground">{total} ta xodim</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Yangi xodim</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Ism yoki email..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="Xodim topilmadi" />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} total={total} pageSize={20} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Yangi xodim qo'shish</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label>Ism *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="To'liq ism" /></div>
            <div className="space-y-1"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" /></div>
            <div className="space-y-1"><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998..." /></div>
            <div className="space-y-1"><Label>Parol *</Label><Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Kamida 6 belgi" /></div>
            <div className="space-y-1">
              <Label>Rol *</Label>
              <Select value={form.roleId} onValueChange={(v) => setForm((f) => ({ ...f, roleId: v }))}>
                <SelectTrigger><SelectValue placeholder="Rol tanlang" /></SelectTrigger>
                <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Filial</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}>
                <SelectTrigger><SelectValue placeholder="Filial tanlang" /></SelectTrigger>
                <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "..." : "Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
