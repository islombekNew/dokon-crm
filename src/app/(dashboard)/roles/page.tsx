"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  description: string | null;
  _count: { users: number };
  permissions: { permission: { module: string; action: string } }[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/roles");
    const result = await res.json();
    if (result.success) setRoles(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: desc }) });
      const result = await res.json();
      if (result.success) { toast.success("Rol qo'shildi"); setOpen(false); setName(""); setDesc(""); fetchData(); }
      else toast.error(result.error);
    } finally { setSaving(false); }
  };

  const getModules = (role: Role) => {
    const modules = new Set(role.permissions.map((p) => p.permission.module));
    return Array.from(modules).slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Rollar</h1><p className="text-muted-foreground">{roles.length} ta rol</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Yangi rol</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{role.name}</CardTitle>
                    {role.description && <p className="text-sm text-muted-foreground mt-1">{role.description}</p>}
                  </div>
                  <Badge variant="secondary">{role._count.users} xodim</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {getModules(role).map((m) => (
                    <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                  ))}
                  {role.permissions.length > 5 && (
                    <Badge variant="outline" className="text-xs">+{role.permissions.length - 5}</Badge>
                  )}
                </div>
                <Link href={`/roles/${role.id}/permissions`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="mr-2 h-3 w-3" />
                    Ruxsatlar ({role.permissions.length})
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangi rol</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2"><Label>Rol nomi *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: KASSIR" autoFocus /></div>
            <div className="space-y-2"><Label>Tavsif</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Qisqa tavsif" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={handleSave} disabled={saving || !name}>{saving ? "..." : "Yaratish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
