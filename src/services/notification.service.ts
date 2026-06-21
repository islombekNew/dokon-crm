import { prisma } from "@/lib/prisma";

async function getConfig() {
  return prisma.telegramConfig.findFirst({ where: { isActive: true } });
}

async function sendTelegram(token: string, chatId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {}
}

async function isEnabled(key: string): Promise<{ token: string; chatId: string } | null> {
  const config = await getConfig();
  if (!config) return null;
  const notifications = config.notifications as Record<string, boolean>;
  if (!notifications[key]) return null;
  return { token: config.token, chatId: config.chatId };
}

export const notificationService = {
  async newSale(saleNumber: string, amount: number, customerName?: string) {
    const cfg = await isEnabled("newSale");
    if (!cfg) return;
    const text = `🛍 <b>Yangi sotuv!</b>\n\nSotuv raqami: ${saleNumber}\nSumma: ${amount.toLocaleString("uz-UZ")} so'm${customerName ? `\nMijoz: ${customerName}` : ""}`;
    await sendTelegram(cfg.token, cfg.chatId, text);
  },

  async lowStock(items: { name: string; quantity: number }[]) {
    const cfg = await isEnabled("lowStock");
    if (!cfg || items.length === 0) return;
    const lines = items.slice(0, 10).map((i) => `• ${i.name} — ${i.quantity} ta`).join("\n");
    const text = `⚠️ <b>Kam qoldiq ogohlantirishi</b>\n\n${lines}`;
    await sendTelegram(cfg.token, cfg.chatId, text);
  },

  async overdueDebt(customerName: string, amount: number, daysOverdue: number) {
    const cfg = await isEnabled("overdueDebt");
    if (!cfg) return;
    const text = `🔴 <b>Muddati o'tgan qarz</b>\n\nMijoz: ${customerName}\nSumma: ${amount.toLocaleString("uz-UZ")} so'm\nMuddati: ${daysOverdue} kun oldin o'tdi`;
    await sendTelegram(cfg.token, cfg.chatId, text);
  },

  async dailySummary(revenue: number, salesCount: number, expenseAmount: number) {
    const cfg = await isEnabled("dailySummary");
    if (!cfg) return;
    const profit = revenue - expenseAmount;
    const today = new Date().toLocaleDateString("uz-UZ");
    const text = `📊 <b>Kunlik hisobot — ${today}</b>\n\n💰 Tushum: ${revenue.toLocaleString("uz-UZ")} so'm\n🛍 Sotuvlar: ${salesCount} ta\n💸 Xarajatlar: ${expenseAmount.toLocaleString("uz-UZ")} so'm\n✅ Foyda: ${profit.toLocaleString("uz-UZ")} so'm`;
    await sendTelegram(cfg.token, cfg.chatId, text);
  },
};
