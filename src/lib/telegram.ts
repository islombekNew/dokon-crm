const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendMessage(text: string, chatId?: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  const targetChat = chatId || CHAT_ID;
  if (!targetChat) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChat,
        text,
        parse_mode: "HTML",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const telegram = {
  sendMessage,

  async notifyLowStock(items: { name: string; quantity: number; min: number }[]) {
    if (!items.length) return;
    const lines = items.map((i) => `• <b>${i.name}</b>: ${i.quantity} (min: ${i.min})`).join("\n");
    return sendMessage(`⚠️ <b>Kam qolgan mahsulotlar:</b>\n\n${lines}`);
  },

  async notifyDailySummary(data: {
    sales: number;
    revenue: number;
    branch: string;
  }) {
    const text =
      `📊 <b>Kunlik hisobot — ${data.branch}</b>\n\n` +
      `🛒 Sotuvlar: ${data.sales} ta\n` +
      `💰 Tushum: ${data.revenue.toLocaleString()} so'm`;
    return sendMessage(text);
  },

  async notifyOverdueDebt(debts: { customerName: string; amount: number; daysOverdue: number }[]) {
    if (!debts.length) return;
    const lines = debts.map((d) => `• <b>${d.customerName}</b>: ${d.amount.toLocaleString()} so'm (${d.daysOverdue} kun)`).join("\n");
    return sendMessage(`🔴 <b>Muddati o'tgan qarzlar:</b>\n\n${lines}`);
  },

  async notifyNewSale(data: { amount: number; customer?: string; seller: string }) {
    const text =
      `✅ <b>Yangi sotuv</b>\n\n` +
      `👤 Xaridor: ${data.customer || "Noma'lum"}\n` +
      `💰 Summa: ${data.amount.toLocaleString()} so'm\n` +
      `👨‍💼 Sotuvchi: ${data.seller}`;
    return sendMessage(text);
  },
};
