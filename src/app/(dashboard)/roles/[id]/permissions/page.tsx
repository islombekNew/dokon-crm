"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard", products: "Mahsulotlar", categories: "Kategoriyalar",
  brands: "Brendlar", sizes: "O'lchamlar", colors: "Ranglar", warehouse: "Ombor",
  sales: "Sotuvlar", pos: "POS", customers: "Mijozlar", debts: "Qarzlar",
  payments: "To'lovlar", suppliers: "Ta'minotchilar", branches: "Filiallar",
  reports: "Hisobotlar", employees: "Xodimlar", roles: "Rollar",
  expenses: "Xarajatlar", "audit-logs": "Audit", settings: "Sozlamalar",
};

const ACTION_LABELS: Record<string, string> = {
  view: "Ko'rish", create: "Yaratish", update: "Yangilash", delete: "O'chirish",
  manage: "Boshqarish", "stock-in": "Kirim", "stock-out": "Chiqim", transfer: "O'tkazma",
  cancel: "Bekor qilish", "return": "Qaytarish", pay: "To'lash", access: "Kirish",
};

interface Permission { id: string; module: string; action: string }

export default function RolePermissionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [role, setRole] = useState<{ name: string } | null>(null);
  const [allPerms, setAllPerms] = useState<Record<string, Permission[]>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/roles`).then((r) => r.json()),
      fetch("/api/permissions").then((r) => r.json()),
    ]).then(([roles, perms]) => {
      const r = roles.data?.find((r: any) => r.id === id);
      setRole(r);
      setAllPerms(perms.data || {});
      if (r) {
        const rolePerms = new Set<string>(r.permissions?.map((rp: any) => rp.permission.id) || []);
        setSelected(rolePerms);
      }
    });
  }, [id]);

  const toggle = (permId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleModule = (perms: Permission[]) => {
    const allSelected = perms.every((p) => selected.has(p.id));
    setSelected((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => allSelected ? next.delete(p.id) : next.add(p.id));
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/roles/${id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: Array.from(selected) }),
      });
      if (res.ok) { toast.success("Ruxsatlar saqlandi"); }
      else toast.error("Saqlashda xato");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{role?.name} — Ruxsatlar</h1>
            <p className="text-muted-foreground">{selected.size} ta ruxsat tanlangan</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlanmoqda...</> : <><Save className="mr-2 h-4 w-4" />Saqlash</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Object.entries(allPerms).map(([module, perms]) => {
          const allSelected = perms.every((p) => selected.has(p.id));
          const someSelected = perms.some((p) => selected.has(p.id));
          return (
            <Card key={module} className={someSelected ? "border-primary/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide">
                    {MODULE_LABELS[module] || module}
                  </CardTitle>
                  <Button
                    variant={allSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleModule(perms)}
                  >
                    {allSelected ? "Barchasini olib tashlash" : "Barchasini tanlash"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {perms.map((perm) => (
                    <button
                      key={perm.id}
                      onClick={() => toggle(perm.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selected.has(perm.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {ACTION_LABELS[perm.action] || perm.action}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
