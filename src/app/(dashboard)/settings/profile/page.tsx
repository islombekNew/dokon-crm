"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string; phone?: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((result) => {
      if (result.success) {
        setUser(result.data);
        setName(result.data.name || "");
        setPhone(result.data.phone || "");
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
      const result = await res.json();
      if (result.success) { toast.success("Profil yangilandi"); setUser((u) => u ? { ...u, name, phone } : u); }
      else toast.error(result.error || "Xato");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) { toast.error("Yangi parollar mos emas"); return; }
    if (newPass.length < 6) { toast.error("Parol kamida 6 belgi bo'lishi kerak"); return; }
    setChangingPass(true);
    try {
      const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }) });
      const result = await res.json();
      if (result.success) { toast.success("Parol o'zgartirildi"); setOldPass(""); setNewPass(""); setConfirmPass(""); }
      else toast.error(result.error || "Xato yuz berdi");
    } finally { setChangingPass(false); }
  };

  if (!user) return <div className="h-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">Mening profilim</h1><p className="text-muted-foreground">Shaxsiy ma'lumotlaringizni boshqaring</p></div>

      <Card>
        <CardHeader><CardTitle className="text-base">Asosiy ma'lumotlar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2"><Label>Ism Familiya</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={user.email} disabled className="bg-muted" /></div>
          <div className="space-y-2"><Label>Telefon</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998..." /></div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlanmoqda...</> : <><Save className="mr-2 h-4 w-4" />Saqlash</>}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Parolni o'zgartirish</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2"><Label>Hozirgi parol</Label><Input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} /></div>
          <div className="space-y-2"><Label>Yangi parol</Label><Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} /></div>
          <div className="space-y-2"><Label>Yangi parolni tasdiqlang</Label><Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} /></div>
          <Button variant="outline" onClick={handleChangePassword} disabled={changingPass}>
            {changingPass ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />O'zgartirilmoqda...</> : "Parolni o'zgartirish"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
