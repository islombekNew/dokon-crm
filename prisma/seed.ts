import { PrismaClient, PaymentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Dashboard
  { module: "dashboard", action: "view" },
  // Products
  { module: "products", action: "view" },
  { module: "products", action: "create" },
  { module: "products", action: "update" },
  { module: "products", action: "delete" },
  // Categories
  { module: "categories", action: "view" },
  { module: "categories", action: "create" },
  { module: "categories", action: "update" },
  { module: "categories", action: "delete" },
  // Brands
  { module: "brands", action: "view" },
  { module: "brands", action: "create" },
  { module: "brands", action: "update" },
  { module: "brands", action: "delete" },
  // Sizes & Colors
  { module: "sizes", action: "view" },
  { module: "sizes", action: "manage" },
  { module: "colors", action: "view" },
  { module: "colors", action: "manage" },
  // Warehouse
  { module: "warehouse", action: "view" },
  { module: "warehouse", action: "stock-in" },
  { module: "warehouse", action: "stock-out" },
  { module: "warehouse", action: "transfer" },
  // Sales
  { module: "sales", action: "view" },
  { module: "sales", action: "create" },
  { module: "sales", action: "cancel" },
  { module: "sales", action: "return" },
  // POS
  { module: "pos", action: "access" },
  // Customers
  { module: "customers", action: "view" },
  { module: "customers", action: "create" },
  { module: "customers", action: "update" },
  { module: "customers", action: "delete" },
  // Debts
  { module: "debts", action: "view" },
  { module: "debts", action: "create" },
  { module: "debts", action: "pay" },
  // Payments
  { module: "payments", action: "view" },
  // Suppliers
  { module: "suppliers", action: "view" },
  { module: "suppliers", action: "manage" },
  // Branches
  { module: "branches", action: "view" },
  { module: "branches", action: "manage" },
  // Employees
  { module: "employees", action: "view" },
  { module: "employees", action: "manage" },
  // Roles
  { module: "roles", action: "view" },
  { module: "roles", action: "manage" },
  // Reports
  { module: "reports", action: "view" },
  // Expenses
  { module: "expenses", action: "view" },
  { module: "expenses", action: "create" },
  { module: "expenses", action: "manage" },
  // Audit logs
  { module: "audit-logs", action: "view" },
  // Settings
  { module: "settings", action: "view" },
  { module: "settings", action: "manage" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { module_action: { module: perm.module, action: perm.action } },
      create: perm,
      update: {},
    });
  }
  console.log("✅ Permissions created");

  // Create SUPERADMIN role with all permissions
  const allPermissions = await prisma.permission.findMany();
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPERADMIN" },
    create: {
      name: "SUPERADMIN",
      description: "To'liq huquqlar",
      permissions: {
        create: allPermissions.map((p) => ({ permissionId: p.id })),
      },
    },
    update: {
      description: "To'liq huquqlar",
    },
  });

  // Create ADMIN role
  const adminPerms = allPermissions.filter(
    (p) => !["roles", "audit-logs"].includes(p.module) || p.action === "view"
  );
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    create: {
      name: "ADMIN",
      description: "Administrator",
      permissions: {
        create: adminPerms.map((p) => ({ permissionId: p.id })),
      },
    },
    update: { description: "Administrator" },
  });

  // Create SELLER role
  const sellerPerms = allPermissions.filter((p) =>
    [
      "dashboard",
      "pos",
      "sales",
      "customers",
      "debts",
      "payments",
      "products",
      "warehouse",
    ].includes(p.module) &&
    !["delete", "cancel", "manage"].includes(p.action)
  );
  const sellerRole = await prisma.role.upsert({
    where: { name: "SELLER" },
    create: {
      name: "SELLER",
      description: "Sotuv menejeri",
      permissions: {
        create: sellerPerms.map((p) => ({ permissionId: p.id })),
      },
    },
    update: { description: "Sotuv menejeri" },
  });

  // Create WAREHOUSE role
  const warehousePerms = allPermissions.filter((p) =>
    ["dashboard", "warehouse", "products"].includes(p.module)
  );
  await prisma.role.upsert({
    where: { name: "WAREHOUSE" },
    create: {
      name: "WAREHOUSE",
      description: "Ombor menejeri",
      permissions: {
        create: warehousePerms.map((p) => ({ permissionId: p.id })),
      },
    },
    update: { description: "Ombor menejeri" },
  });

  console.log("✅ Roles created");

  // Create main branch
  const mainBranch = await prisma.branch.upsert({
    where: { id: "main-branch" },
    create: {
      id: "main-branch",
      name: "Asosiy Filial",
      address: "Toshkent, Chilonzor",
      phone: "+998901234567",
    },
    update: {},
  });

  // Create default warehouse
  await prisma.warehouse.upsert({
    where: { id: "main-warehouse" },
    create: {
      id: "main-warehouse",
      name: "Asosiy Ombor",
      branchId: mainBranch.id,
      isDefault: true,
    },
    update: {},
  });

  console.log("✅ Branch and warehouse created");

  // Create superadmin user
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@retailcrm.uz" },
    create: {
      name: "Super Admin",
      email: "admin@retailcrm.uz",
      phone: "+998901234567",
      passwordHash,
      roleId: superAdminRole.id,
      branchId: mainBranch.id,
      isActive: true,
    },
    update: {},
  });

  console.log("✅ Admin user created");
  console.log("");
  console.log("🎉 Seed completed!");
  console.log("─────────────────────────────");
  console.log("📧 Email:    admin@retailcrm.uz");
  console.log("🔑 Password: Admin@123");
  console.log("─────────────────────────────");

  // Demo data: categories & brands
  const categories = [
    { name: "Erkaklar kiyimi", slug: "erkaklar" },
    { name: "Ayollar kiyimi", slug: "ayollar" },
    { name: "Bolalar kiyimi", slug: "bolalar" },
    { name: "Sport kiyimi", slug: "sport" },
    { name: "Poyabzal", slug: "poyabzal" },
    { name: "Aksessuarlar", slug: "aksessuarlar" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: { ...cat, isActive: true },
      update: {},
    });
  }

  const brands = ["Nike", "Adidas", "Puma", "Reebok", "Under Armour", "Zara", "H&M"];
  for (const name of brands) {
    await prisma.brand.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
  for (let i = 0; i < sizes.length; i++) {
    await prisma.size.upsert({
      where: { name: sizes[i] },
      create: { name: sizes[i], sortOrder: i },
      update: {},
    });
  }

  const colors = [
    { name: "Qora", hexCode: "#000000" },
    { name: "Oq", hexCode: "#FFFFFF" },
    { name: "Ko'k", hexCode: "#0000FF" },
    { name: "Qizil", hexCode: "#FF0000" },
    { name: "Yashil", hexCode: "#008000" },
    { name: "Sariq", hexCode: "#FFFF00" },
    { name: "Kulrang", hexCode: "#808080" },
    { name: "Jigarrang", hexCode: "#A52A2A" },
  ];
  for (const color of colors) {
    await prisma.color.upsert({
      where: { name: color.name },
      create: color,
      update: {},
    });
  }

  console.log("✅ Demo catalog data created");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
