"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Send, Bot, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const NOTIFICATION_TYPES = [
  { key: "newSale", label: "Yangi sotuv" },
  { key: "lowStock", label: "Kam qoldiq ogohlantirishi" },
  { key: "overdueDebt", label: "Muddati o'tgan qarz" },
  { key: "dailySummary", label: "Kunlik hisobot" },
];

export default function TelegramBotPage() {
  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch("/api/telegram/config").then((r) => r.json()).then((result) => {
      if (result.success && result.data) {
        setToken(result.data.token || "");
        setChatId(result.data.chatId || "");
        setEnabled(result.data.notifications || {});
        setIsConnected(result.data.isConnected || false);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!token || !chatId) { toast.error("Bot token va Chat ID kiritish shart"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/telegram/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, chatId, notifications: enabled }),
      });
      const result = await res.json();
      if (result.success) { toast.success("Telegram bot sozlandi"); setIsConnected(true); }
      else toast.error(result.error || "Xato yuz berdi");
    } finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/telegram/test", { method: "POST" });
      const result = await res.json();
      if (result.success) toast.success("Test xabar yuborildi!");
      else toast.error("Xabar yuborilmadi. Token yoki Chat ID noto'g'ri");
    } finally { setTesting(false); }
  };

  const toggleNotification = (key: string) => {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Telegram Bot</h1>
        <p className="text-muted-foreground">Telegram orqali bildirishnomalar sozlang</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Bot sozlamalari</CardTitle>
            </div>
            {isConnected && <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Ulangan</Badge>}
          </div>
          <CardDescription>
            Bot yaratish uchun Telegram'da @BotFather bilan suhbat boshlang va /newbot buyrug'ini yuboring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Bot Token</Label>
            <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="1234567890:ABCDefgh..." type="password" />
          </div>
          <div className="space-y-2">
            <Label>Chat ID</Label>
            <Input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-1001234567890" />
            <p className="text-xs text-muted-foreground">Guruh yoki kanalning Chat ID sini kiriting. @userinfobot orqali aniqlashingiz mumkin.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlanmoqda...</> : <><Save className="mr-2 h-4 w-4" />Saqlash</>}
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing || !token}>
              {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Yuborilmoqda...</> : <><Send className="mr-2 h-4 w-4" />Test xabar</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Bildirishnomalar</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {NOTIFICATION_TYPES.map((type, i) => (
            <div key={type.key}>
              {i > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">{type.label}</Label>
                <button
                  onClick={() => toggleNotification(type.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled[type.key] ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled[type.key] ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
