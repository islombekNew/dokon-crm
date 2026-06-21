import { prisma } from "@/lib/prisma";
import { SaleStatus } from "@prisma/client";

export const reportService = {
  async getDashboardSummary(branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const where = { status: SaleStatus.COMPLETED, ...(branchId && { branchId }) };

    const [
      todaySales,
      monthSales,
      totalCustomers,
      totalProducts,
      activeDebts,
      lowStockCount,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { ...where, createdAt: { gte: today, lte: todayEnd } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { ...where, createdAt: { gte: thisMonthStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.debt.aggregate({
        where: { status: "ACTIVE" },
        _sum: { totalAmount: true, paidAmount: true },
        _count: true,
      }),
      prisma.stockItem.count({ where: { quantity: { lte: 5 } } }),
    ]);

    return {
      today: {
        revenue: Number(todaySales._sum.totalAmount || 0),
        salesCount: todaySales._count,
      },
      thisMonth: {
        revenue: Number(monthSales._sum.totalAmount || 0),
        salesCount: monthSales._count,
      },
      totalCustomers,
      totalProducts,
      activeDebts: {
        count: activeDebts._count,
        totalAmount: Number(activeDebts._sum.totalAmount || 0),
        paidAmount: Number(activeDebts._sum.paidAmount || 0),
      },
      lowStockCount,
    };
  },

  async getSalesReport(params: { from: Date; to: Date; branchId?: string; groupBy: "day" | "month" }) {
    const sales = await prisma.sale.findMany({
      where: {
        status: SaleStatus.COMPLETED,
        createdAt: { gte: params.from, lte: params.to },
        ...(params.branchId && { branchId: params.branchId }),
      },
      include: {
        items: true,
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by day or month
    const grouped = new Map<string, { revenue: number; count: number; profit: number }>();
    for (const sale of sales) {
      const date = new Date(sale.createdAt);
      const key =
        params.groupBy === "day"
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = grouped.get(key) || { revenue: 0, count: 0, profit: 0 };
      grouped.set(key, {
        revenue: existing.revenue + Number(sale.totalAmount),
        count: existing.count + 1,
        profit: existing.profit,
      });
    }

    return Array.from(grouped.entries()).map(([date, data]) => ({ date, ...data }));
  },

  async getTopProducts(params: { from: Date; to: Date; limit?: number; branchId?: string }) {
    const items = await prisma.saleItem.findMany({
      where: {
        sale: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: params.from, lte: params.to },
          ...(params.branchId && { branchId: params.branchId }),
        },
      },
      include: {
        variant: { include: { product: { include: { category: true } } } },
      },
    });

    const productMap = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();
    for (const item of items) {
      const name = item.variant.product.name;
      const existing = productMap.get(name) || { name, category: item.variant.product.category.name, quantity: 0, revenue: 0 };
      productMap.set(name, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + Number(item.unitPrice) * item.quantity,
      });
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, params.limit || 10);
  },

  async getTopCategories(params: { from: Date; to: Date; branchId?: string }) {
    const items = await prisma.saleItem.findMany({
      where: {
        sale: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: params.from, lte: params.to },
          ...(params.branchId && { branchId: params.branchId }),
        },
      },
      include: { variant: { include: { product: { include: { category: true } } } } },
    });

    const catMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const item of items) {
      const cat = item.variant.product.category;
      const existing = catMap.get(cat.id) || { name: cat.name, quantity: 0, revenue: 0 };
      catMap.set(cat.id, {
        name: existing.name,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + Number(item.unitPrice) * item.quantity,
      });
    }

    return Array.from(catMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  },

  async getTopBrands(params: { from: Date; to: Date; branchId?: string }) {
    const items = await prisma.saleItem.findMany({
      where: {
        sale: {
          status: SaleStatus.COMPLETED,
          createdAt: { gte: params.from, lte: params.to },
          ...(params.branchId && { branchId: params.branchId }),
        },
      },
      include: { variant: { include: { product: { include: { brand: true } } } } },
    });

    const brandMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const item of items) {
      const brand = item.variant.product.brand;
      if (!brand) continue;
      const existing = brandMap.get(brand.id) || { name: brand.name, quantity: 0, revenue: 0 };
      brandMap.set(brand.id, {
        name: existing.name,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + Number(item.unitPrice) * item.quantity,
      });
    }

    return Array.from(brandMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  },

  async getProfitReport(params: { from: Date; to: Date; branchId?: string }) {
    const sales = await prisma.sale.findMany({
      where: {
        status: SaleStatus.COMPLETED,
        createdAt: { gte: params.from, lte: params.to },
        ...(params.branchId && { branchId: params.branchId }),
      },
      include: {
        items: {
          include: {
            variant: { select: { costPrice: true, product: { select: { costPrice: true } } } },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;

    for (const sale of sales) {
      totalRevenue += Number(sale.totalAmount);
      for (const item of sale.items) {
        const cost = Number(item.variant.costPrice ?? item.variant.product.costPrice ?? 0);
        totalCost += cost * item.quantity;
      }
    }

    const expenses = await prisma.expense.aggregate({
      where: {
        createdAt: { gte: params.from, lte: params.to },
        ...(params.branchId && { branchId: params.branchId }),
      },
      _sum: { amount: true },
    });

    const totalExpenses = Number(expenses._sum.amount || 0);

    return {
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      totalExpenses,
      netProfit: totalRevenue - totalCost - totalExpenses,
      salesCount: sales.length,
    };
  },
};
