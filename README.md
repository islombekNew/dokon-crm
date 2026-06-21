# PRD — Kiyim Do'konlari uchun CRM/Ombor Boshqaruv Tizimi

## 1. Loyiha haqida umumiy ma'lumot

| Maydon | Qiymat |
|---|---|
| Loyiha nomi | RetailCRM (taklif nomi, keyin o'zgartirilishi mumkin) |
| Soha | Kiyim/poyabzal savdosi, butiklar, ko'p filialli tarmoqlar |
| Maqsadli foydalanuvchi | Do'kon egasi, direktor, manager, kassir, omborchi |
| Platforma | Web (desktop birinchi o'rinda), mobil moslashuvchan |
| Asosiy texnologiyalar | Next.js, TypeScript, PostgreSQL, Prisma, TailwindCSS, Shadcn UI, Supabase |

## 2. Muammo va Maqsad

### 2.1 Muammo
Kiyim do'konlari va butiklar ko'pincida Excel, qog'oz daftar yoki mosligi past dasturlardan foydalanadi. Bu quyidagi muammolarni keltirib chiqaradi:
- Razmer/rang variantlari bo'yicha aniq hisob yo'qligi (bitta "futbolka" emas, 10-20 xil variant)
- Omborda real vaqtda qoldiqni bilmaslik
- Nasiya (qarz) bilan ishlashda nazoratning yo'qligi
- Bir nechta filial bo'lganda markazlashgan boshqaruv yo'qligi
- Sotuvchilar samaradorligini o'lchay olmaslik
- Hisobot va analitikaning qo'lda yig'ilishi

### 2.2 Maqsad
Kiyim/butik biznesi uchun, variant (rang+razmer) asosida ishlaydigan, ko'p filialli, real-vaqt analitikaga ega, to'liq CRM + Ombor + POS tizimini yaratish.

### 2.3 Muvaffaqiyat mezonlari (Success Metrics)
- Mahsulot/variant qo'shishdan POS sotuvgacha bo'lgan vaqtni qisqartirish
- Omborda inventar xatoligini kamaytirish (real qoldiq = tizimdagi qoldiq)
- Qarzdorlik bo'yicha kechikkan to'lovlar foizini kamaytirish
- Filiallar kesimida bir oyda hisobot tayyorlash vaqtini soatlardan daqiqalarga tushirish

## 3. Foydalanuvchi rollari (Personas)

| Rol | Tavsif | Asosiy ehtiyoj |
|---|---|---|
| **Super Admin / Egasi** | Barcha filiallarni ko'radi, tizim sozlamalarini boshqaradi | To'liq nazorat, umumiy hisobot |
| **Direktor** | Bir yoki bir nechta filialni boshqaradi | Filial bo'yicha hisobot, xodimlar nazorati |
| **Manager** | Filial ichidagi operatsion ishlar | Ombor, narx, aksiya boshqaruvi |
| **Kassir** | POS orqali sotuv qiladi | Tez, qulay sotuv interfeysi |
| **Omborchi** | Kirim/chiqim, inventarizatsiya | Aniq miqdor nazorati, barcode skan |

## 4. Modullar ro'yxati va qisqa tavsif

1. **Dashboard** — umumiy KPI: bugungi/oylik savdo, qarzdorlar, kam qolgan mahsulotlar, filiallar statistikasi
2. **Mahsulotlar** — asosiy mahsulot kartochkasi (nomi, SKU, kategoriya, brend, narx, rasm)
3. **Kategoriyalar** — ierarxik (Erkaklar > Futbolka, va h.k.)
4. **Brendlar** — Nike, Adidas va boshqalar
5. **Razmerlar** — XS-XXL yoki raqamli (36-46), kategoriya/turga moslashtiriladigan razmer to'plamlari
6. **Ranglar** — nomi + HEX kod (UI'da rang chipi ko'rsatish uchun)
7. **Mahsulot Variantlari** — rang+razmer kombinatsiyasi, har biri alohida barcode va qoldiq bilan
8. **Ombor Kirim/Chiqim** — yetkazib beruvchidan kirim, sotuv/filialga o'tkazish/yaroqsiz/qaytarish orqali chiqim, harakatlar tarixi
9. **Sotuvlar (POS)** — barcode skan, savat, ko'p turdagi to'lov (naqd/karta/Click/Payme/aralash), chek chop etish
10. **Mijozlar** — shaxsiy ma'lumot, bonus balansi, xarid tarixi, qarz holati
11. **Nasiya (Qarzdorlik)** — bo'lib to'lash jadvali, qoldiq nazorati, eslatmalar
12. **To'lovlar** — barcha to'lov tranzaksiyalari (sotuv to'lovlari + qarz to'lovlari), to'lov usullari bo'yicha hisob
13. **Yetkazib Beruvchilar** — ta'minotchi ma'lumotlari, ularga bo'lgan qarz, kirim tarixi
14. **Filiallar** — har bir filialning o'z ombori, kassasi, xodimlari, sotuvlari (V2)
15. **Hisobotlar** — savdo (kunlik/haftalik/oylik/yillik), foyda, top mahsulotlar, filial kesimi
16. **Xodimlar** — xodim profili, ish vaqti, KPI
17. **Rollar va Permissionlar** — har rol uchun ruxsatlar matritsasi
18. **Xarajatlar** — ijara, elektr, oylik maosh va boshqa operatsion xarajatlar, sof foyda hisobi
19. **Barcode va QR** — mahsulot/variant yaratilganda avtomatik generatsiya, chop etish
20. **Audit Log** — kim, qachon, nima qilgani haqida to'liq tarix

21. **Telegram Bot** — do'kon egasiga kunlik savdo/foyda va qarzdorlik bo'yicha bildirishnoma, kam qolgan mahsulot signali

> **Eslatma:** AI tahlil/prognoz V3/Premium bosqichida ko'rib chiqiladi. Valyuta tizimi va promo-kodlar talab ro'yxatidan olib tashlandi.

## 5. Funksional talablar (Functional Requirements)

### 5.1 Mahsulot va Variant boshqaruvi
- FR-1: Foydalanuvchi yangi mahsulot yaratishi, tahrirlashi, o'chirishi (soft delete) mumkin
- FR-2: Har bir mahsulot bir nechta rang/razmer variantiga ega bo'lishi mumkin
- FR-3: Har bir variant o'ziga xos barcode/SKU'ga ega bo'ladi
- FR-4: Mahsulotga bir nechta rasm yuklash mumkin (old/orqa/yon)
- FR-5: Kirim va sotuv narxi alohida saqlanadi, marja avtomatik hisoblanadi

### 5.2 Ombor
- FR-6: Yetkazib beruvchidan kirim qilinganda variant bo'yicha miqdor oshadi
- FR-7: Sotuv, filialga o'tkazish, yaroqsiz deb belgilash, qaytarish — barchasi chiqim sifatida log qilinadi
- FR-8: Har bir variant uchun minimal qoldiq belgilanadi, undan past tushganda ogohlantirish chiqadi
- FR-9: Filiallar orasida mahsulot o'tkazish (stock transfer) imkoniyati

### 5.3 POS / Sotuv
- FR-10: Kassir barcode skanerlash orqali mahsulotni savatga qo'shadi
- FR-11: Savatda miqdor, chegirma qo'llash mumkin
- FR-12: To'lov bir nechta usulda yoki aralash (masalan, qisman naqd + qisman karta) qabul qilinadi
- FR-13: Sotuv yakunlanganda variant qoldig'i avtomatik kamayadi va chek generatsiya qilinadi
- FR-14: Sotuvni bekor qilish/qaytarish — ombor qoldig'i avtomatik tiklanadi

### 5.4 Mijozlar va Nasiya
- FR-15: Mijoz profilida xarid tarixi, joriy qarz, bonus balansi ko'rsatiladi
- FR-16: Nasiyaga sotishda boshlang'ich to'lov, qolgan summa va muddat belgilanadi
- FR-17: Qarz bo'yicha qisman to'lovlar tarixi saqlanadi
- FR-18: Muddati o'tgan qarzlar alohida ro'yxatda ko'rsatiladi

### 5.5 Filiallar (V2)
- FR-19: Har filial o'z ombori, kassasi va xodimlariga ega
- FR-20: Super Admin barcha filiallar bo'yicha umumlashtirilgan hisobotni ko'radi
- FR-21: Filiallar orasida mahsulot harakati log qilinadi

### 5.6 Xodimlar va Rollar
- FR-22: Har bir xodimga rol biriktiriladi (Admin/Direktor/Manager/Kassir/Omborchi)
- FR-23: Har rol uchun modul darajasida ruxsat (view/create/edit/delete) belgilanadi
- FR-24: Xodim ish vaqti (kirish/chiqish) qayd etiladi
- FR-25: Oylik KPI (savdo summasi, sotilgan dona) avtomatik hisoblanadi

### 5.7 Hisobot va Xarajat
- FR-26: Davr bo'yicha (kun/hafta/oy/yil) savdo va foyda hisoboti
- FR-27: Top mahsulotlar/kategoriyalar/brendlar reytingi
- FR-28: Xarajatlar kiritiladi, sof foyda = savdo - kirim narxi - xarajat formulasi bo'yicha hisoblanadi

### 5.8 Barcode/QR va Audit
- FR-29: Variant yaratilganda barcode/QR avtomatik generatsiya qilinadi va chop etish uchun tayyor format beriladi
- FR-30: Har bir muhim amal (o'chirish, narx o'zgartirish, qarz yopish va h.k.) audit logga yoziladi

### 5.9 Telegram Bot
- FR-31: Bot orqali do'kon egasi kunlik savdo/foyda summasini so'rab oladi
- FR-32: Bot orqali qarzdorlik holati (mijoz, qoldiq, muddat) ko'rsatiladi
- FR-33: Kam qolgan mahsulot bo'yicha avtomatik bildirishnoma yuboriladi

## 6. Nofunksional talablar

| Kategoriya | Talab |
|---|---|
| Xavfsizlik | JWT asosida autentifikatsiya, rol asosida ruxsat (RBAC), parollar hash (bcrypt/argon2) |
| Performance | POS ekrani 1 soniyadan kam javob vaqti bilan ishlashi kerak |
| Masshtablanuvchanlik | Yangi filial qo'shish tizim arxitekturasini o'zgartirmasdan amalga oshirilishi kerak |
| Ma'lumotlar yaxlitligi | Variant qoldig'i hech qachon manfiy bo'lmasligi kerak (transaction-safe) |
| Backup | Kunlik avtomatik database backup (Supabase orqali) |
| Lokalizatsiya | Asosiy til — o'zbek tili, valyuta — so'm (keyinchalik ko'p tillilik imkoniyati) |
| Audit | Har bir CRUD amali kim tomonidan va qachon bajarilgani saqlanishi kerak |

## 7. Texnologik stack (yakuniy)

| Qatlam | Texnologiya |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| UI | TailwindCSS + Shadcn UI |
| Backend | Next.js API Routes / Route Handlers |
| Database | PostgreSQL (Supabase orqali hosting) |
| ORM | Prisma |
| Auth | JWT (yoki Supabase Auth, keyin tasdiqlanadi) |
| Fayl saqlash | Supabase Storage / Cloudinary |
| Deploy | Vercel (frontend+API) + Supabase (DB) |

## 8. Bosqichlash (Roadmap)

### V1 — MVP (asosiy operatsion tizim)
Dashboard, Mahsulotlar, Kategoriyalar, Brendlar, Razmerlar, Ranglar, Variantlar, Ombor, POS, Mijozlar, Nasiya, To'lovlar, Yetkazib beruvchilar, Xodimlar, Rollar, Hisobotlar (asosiy), Barcode/QR, Audit Log (asosiy)

### V2 — Multi-filial va kengaytirilgan boshqaruv
Filiallar moduli to'liq, filiallar orasida transfer, xarajatlar moduli, kengaytirilgan hisobotlar, KPI

### V3 — Premium/AI (talab ro'yxatidan tashqari, kelajak uchun zaxira)
AI tahlil, AI prognoz, Telegram bot, mobil ilova

## 9. Risklar

| Risk | Ta'sir | Yumshatish |
|---|---|---|
| Variant kombinatsiyasi murakkabligi | Ombor hisobida xato | ProductVariant jadvalini diqqat bilan loyihalash, unique constraint (product+color+size) |
| Bir nechta filial bilan ombor sinxronizatsiyasi | Noto'g'ri qoldiq | Har bir stock_movement filial/ombor ID bilan bog'lanadi, transaction orqali yoziladi |
| POS'da tarmoq uzilishi | Sotuv yo'qolishi | Offline-first yoki local cache strategiyasi keyingi bosqichda ko'rib chiqiladi |
| Ruxsatlar matritsasi murakkablashishi | Xavfsizlik teshigi | Markazlashgan permission middleware |

## 10. Hujjat tarkibi

Ushbu fayl quyidagi barcha bosqichlarni o'z ichiga oladi:
1. PRD (yuqorida)
2. Database Schema (Prisma)
3. ER Diagram (Mermaid)
4. API Struktura
5. Sahifalar Ro'yxati
6. Loyiha Papka Strukturasi

> UI wireframelar alohida — chat ichida interaktiv widget sifatida ko'rsatilgan (Dashboard, POS, Mahsulotlar ro'yxati).
-e 

---

# QO'SHIMCHA: Database Schema (Prisma)

```prisma
// =========================================
// RetailCRM — Prisma Database Schema
// PostgreSQL
// =========================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========== ENUMS ==========

enum RoleName {
  SUPER_ADMIN
  DIRECTOR
  MANAGER
  CASHIER
  WAREHOUSE_KEEPER
}

enum PaymentMethod {
  CASH
  CARD
  CLICK
  PAYME
  MIXED
}

enum StockMovementType {
  PURCHASE_IN        // yetkazib beruvchidan kirim
  SALE_OUT           // sotuv
  TRANSFER_OUT       // filialga o'tkazish (chiqim)
  TRANSFER_IN        // filialdan kelgan (kirim)
  DAMAGE_OUT         // yaroqsiz
  RETURN_IN          // mijozdan qaytarilgan (kirim)
  ADJUSTMENT         // inventarizatsiya tuzatishi
}

enum SaleStatus {
  COMPLETED
  CANCELLED
  RETURNED
  PARTIALLY_RETURNED
}

enum DebtStatus {
  ACTIVE
  PAID
  OVERDUE
  CANCELLED
}

enum DiscountType {
  PRODUCT
  CATEGORY
  CUSTOMER
}

enum DiscountValueType {
  PERCENT
  FIXED
}

enum ExpenseCategory {
  RENT
  ELECTRICITY
  INTERNET
  SALARY
  OTHER
}

enum NotificationType {
  LOW_STOCK
  DEBT_OVERDUE
  DAILY_SUMMARY
}

enum NotificationChannel {
  TELEGRAM
  SYSTEM
}

// ========== AUTH / RBAC ==========

model Role {
  id          String   @id @default(uuid())
  name        RoleName @unique
  description String?
  createdAt   DateTime @default(now())

  permissions RolePermission[]
  users       User[]

  @@map("roles")
}

model Permission {
  id     String @id @default(uuid())
  module String // masalan: "products", "sales", "reports"
  action String // "view" | "create" | "edit" | "delete"

  roles RolePermission[]

  @@unique([module, action])
  @@map("permissions")
}

model RolePermission {
  id           String @id @default(uuid())
  roleId       String
  permissionId String

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

model User {
  id           String    @id @default(uuid())
  fullName     String
  phone        String    @unique
  email        String?   @unique
  passwordHash String
  roleId       String
  branchId     String?
  isActive     Boolean   @default(true)
  checkInTime  DateTime?
  checkOutTime DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  role     Role      @relation(fields: [roleId], references: [id])
  branch   Branch?   @relation(fields: [branchId], references: [id])
  sales    Sale[]
  logs     AuditLog[]
  kpis     EmployeeKpi[]
  stockMovements StockMovement[]

  @@map("users")
}

// ========== CATALOG ==========

model Category {
  id        String     @id @default(uuid())
  name      String
  parentId  String?
  createdAt DateTime   @default(now())

  parent    Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryToCategory")
  products  Product[]
  discounts Discount[]

  @@map("categories")
}

model Brand {
  id        String    @id @default(uuid())
  name      String    @unique
  createdAt DateTime  @default(now())

  products  Product[]

  @@map("brands")
}

model Size {
  id        String   @id @default(uuid())
  label     String   @unique // "S", "M", "40" va h.k.
  sortOrder Int      @default(0)

  variants  ProductVariant[]

  @@map("sizes")
}

model Color {
  id        String   @id @default(uuid())
  name      String   @unique
  hexCode   String?

  variants  ProductVariant[]

  @@map("colors")
}

model Product {
  id            String   @id @default(uuid())
  name          String
  sku           String   @unique
  description   String?
  categoryId    String
  brandId       String?
  costPrice     Decimal  @db.Decimal(14, 2) // kirim narxi
  sellingPrice  Decimal  @db.Decimal(14, 2) // sotuv narxi
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  category   Category         @relation(fields: [categoryId], references: [id])
  brand      Brand?           @relation(fields: [brandId], references: [id])
  variants   ProductVariant[]
  images     ProductImage[]
  discounts  Discount[]

  @@map("products")
}

model ProductImage {
  id        String  @id @default(uuid())
  productId String
  url       String
  position  Int     @default(0) // 0=old, 1=orqa, 2=yon ...

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model ProductVariant {
  id           String   @id @default(uuid())
  productId    String
  colorId      String?
  sizeId       String?
  barcode      String   @unique
  qrCode       String?  @unique
  minStock     Int      @default(0)
  createdAt    DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  color   Color?  @relation(fields: [colorId], references: [id])
  size    Size?   @relation(fields: [sizeId], references: [id])

  stockLevels    VariantStock[]
  saleItems      SaleItem[]
  stockMovements StockMovement[]

  @@unique([productId, colorId, sizeId])
  @@map("product_variants")
}

// Har bir variant filial/ombor bo'yicha alohida qoldiqqa ega
model VariantStock {
  id        String @id @default(uuid())
  variantId String
  warehouseId String
  quantity  Int    @default(0)

  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  warehouse Warehouse      @relation(fields: [warehouseId], references: [id], onDelete: Cascade)

  @@unique([variantId, warehouseId])
  @@map("variant_stocks")
}

// ========== WAREHOUSE / BRANCH ==========

model Branch {
  id        String   @id @default(uuid())
  name      String
  address   String?
  phone     String?
  isMain    Boolean  @default(false)
  createdAt DateTime @default(now())

  warehouses Warehouse[]
  users      User[]
  sales      Sale[]
  expenses   Expense[]

  @@map("branches")
}

model Warehouse {
  id        String   @id @default(uuid())
  branchId  String
  name      String
  createdAt DateTime @default(now())

  branch         Branch          @relation(fields: [branchId], references: [id], onDelete: Cascade)
  variantStocks  VariantStock[]
  stockMovementsFrom StockMovement[] @relation("FromWarehouse")
  stockMovementsTo   StockMovement[] @relation("ToWarehouse")

  @@map("warehouses")
}

model StockMovement {
  id            String            @id @default(uuid())
  variantId     String
  type          StockMovementType
  quantity      Int
  fromWarehouseId String?
  toWarehouseId   String?
  supplierId    String?
  unitCost      Decimal?          @db.Decimal(14, 2)
  referenceSaleId String?
  userId        String
  note          String?
  createdAt     DateTime          @default(now())

  variant       ProductVariant @relation(fields: [variantId], references: [id])
  fromWarehouse Warehouse?     @relation("FromWarehouse", fields: [fromWarehouseId], references: [id])
  toWarehouse   Warehouse?     @relation("ToWarehouse", fields: [toWarehouseId], references: [id])
  supplier      Supplier?      @relation(fields: [supplierId], references: [id])
  user          User           @relation(fields: [userId], references: [id])

  @@map("stock_movements")
}

// ========== SUPPLIERS ==========

model Supplier {
  id        String   @id @default(uuid())
  name      String
  phone     String?
  address   String?
  debt      Decimal  @default(0) @db.Decimal(14, 2) // ta'minotchiga qarzimiz
  createdAt DateTime @default(now())

  stockMovements StockMovement[]

  @@map("suppliers")
}

// ========== CUSTOMERS / CRM ==========

model Customer {
  id           String   @id @default(uuid())
  fullName     String
  phone        String   @unique
  bonusBalance Decimal  @default(0) @db.Decimal(14, 2)
  isVip        Boolean  @default(false)
  createdAt    DateTime @default(now())

  sales        Sale[]
  debts        Debt[]
  discounts    Discount[]

  @@map("customers")
}

model Discount {
  id          String             @id @default(uuid())
  type        DiscountType
  valueType   DiscountValueType
  value       Decimal            @db.Decimal(10, 2)
  productId   String?
  categoryId  String?
  customerId  String?
  startDate   DateTime?
  endDate     DateTime?
  isActive    Boolean            @default(true)

  product  Product?  @relation(fields: [productId], references: [id])
  category Category? @relation(fields: [categoryId], references: [id])
  customer Customer? @relation(fields: [customerId], references: [id])

  @@map("discounts")
}

// ========== SALES / POS ==========

model Sale {
  id           String     @id @default(uuid())
  branchId     String
  customerId   String?
  userId       String     // kassir
  totalAmount  Decimal    @db.Decimal(14, 2)
  discountAmount Decimal  @default(0) @db.Decimal(14, 2)
  status       SaleStatus @default(COMPLETED)
  createdAt    DateTime   @default(now())

  branch   Branch    @relation(fields: [branchId], references: [id])
  customer Customer? @relation(fields: [customerId], references: [id])
  cashier  User      @relation(fields: [userId], references: [id])

  items    SaleItem[]
  payments Payment[]
  debt     Debt?

  @@map("sales")
}

model SaleItem {
  id         String  @id @default(uuid())
  saleId     String
  variantId  String
  quantity   Int
  unitPrice  Decimal @db.Decimal(14, 2)
  discount   Decimal @default(0) @db.Decimal(14, 2)
  subtotal   Decimal @db.Decimal(14, 2)

  sale    Sale           @relation(fields: [saleId], references: [id], onDelete: Cascade)
  variant ProductVariant @relation(fields: [variantId], references: [id])

  @@map("sale_items")
}

model Payment {
  id        String        @id @default(uuid())
  saleId    String?
  debtId    String?
  amount    Decimal       @db.Decimal(14, 2)
  method    PaymentMethod
  createdAt DateTime      @default(now())

  sale Sale? @relation(fields: [saleId], references: [id])
  debtPaymentOf DebtPayment?

  @@map("payments")
}

// ========== DEBTS / NASIYA ==========

model Debt {
  id            String     @id @default(uuid())
  saleId        String     @unique
  customerId    String
  totalAmount   Decimal    @db.Decimal(14, 2)
  initialPaid   Decimal    @default(0) @db.Decimal(14, 2)
  remainingAmount Decimal  @db.Decimal(14, 2)
  dueDate       DateTime
  status        DebtStatus @default(ACTIVE)
  createdAt     DateTime   @default(now())

  sale     Sale         @relation(fields: [saleId], references: [id])
  customer Customer     @relation(fields: [customerId], references: [id])
  payments DebtPayment[]

  @@map("debts")
}

model DebtPayment {
  id        String   @id @default(uuid())
  debtId    String
  paymentId String   @unique
  amount    Decimal  @db.Decimal(14, 2)
  createdAt DateTime @default(now())

  debt    Debt    @relation(fields: [debtId], references: [id], onDelete: Cascade)
  payment Payment @relation(fields: [paymentId], references: [id])

  @@map("debt_payments")
}

// ========== EXPENSES ==========

model Expense {
  id        String          @id @default(uuid())
  branchId  String
  category  ExpenseCategory
  amount    Decimal         @db.Decimal(14, 2)
  note      String?
  date      DateTime
  createdAt DateTime        @default(now())

  branch Branch @relation(fields: [branchId], references: [id])

  @@map("expenses")
}

// ========== EMPLOYEE KPI ==========

model EmployeeKpi {
  id          String   @id @default(uuid())
  userId      String
  month       Int
  year        Int
  totalSales  Decimal  @default(0) @db.Decimal(14, 2)
  itemsSold   Int      @default(0)

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, month, year])
  @@map("employee_kpis")
}

// ========== NOTIFICATIONS (Telegram bot) ==========

model NotificationLog {
  id        String              @id @default(uuid())
  type      NotificationType
  channel   NotificationChannel
  message   String
  sentAt    DateTime            @default(now())

  @@map("notification_logs")
}

// ========== AUDIT LOG ==========

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   // "DELETE_PRODUCT", "EDIT_PRICE", ...
  entity    String   // jadval nomi
  entityId  String?
  details   String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}
-e ```

---

# QO'SHIMCHA: ER Diagram (Mermaid)

```mermaid
erDiagram

    ROLE ||--o{ USER : "has"
    ROLE ||--o{ ROLE_PERMISSION : "has"
    PERMISSION ||--o{ ROLE_PERMISSION : "has"

    BRANCH ||--o{ USER : "employs"
    BRANCH ||--o{ WAREHOUSE : "has"
    BRANCH ||--o{ SALE : "records"
    BRANCH ||--o{ EXPENSE : "has"

    CATEGORY ||--o{ CATEGORY : "parent_of"
    CATEGORY ||--o{ PRODUCT : "groups"
    CATEGORY ||--o{ DISCOUNT : "applies_to"

    BRAND ||--o{ PRODUCT : "produces"

    PRODUCT ||--o{ PRODUCT_VARIANT : "has"
    PRODUCT ||--o{ PRODUCT_IMAGE : "has"
    PRODUCT ||--o{ DISCOUNT : "applies_to"

    COLOR ||--o{ PRODUCT_VARIANT : "colors"
    SIZE ||--o{ PRODUCT_VARIANT : "sizes"

    PRODUCT_VARIANT ||--o{ VARIANT_STOCK : "stocked_as"
    PRODUCT_VARIANT ||--o{ SALE_ITEM : "sold_as"
    PRODUCT_VARIANT ||--o{ STOCK_MOVEMENT : "moved_as"

    WAREHOUSE ||--o{ VARIANT_STOCK : "holds"
    WAREHOUSE ||--o{ STOCK_MOVEMENT : "from"
    WAREHOUSE ||--o{ STOCK_MOVEMENT : "to"

    SUPPLIER ||--o{ STOCK_MOVEMENT : "supplies"

    USER ||--o{ SALE : "processes"
    USER ||--o{ STOCK_MOVEMENT : "performs"
    USER ||--o{ AUDIT_LOG : "creates"
    USER ||--o{ EMPLOYEE_KPI : "scores"

    CUSTOMER ||--o{ SALE : "makes"
    CUSTOMER ||--o{ DEBT : "owes"
    CUSTOMER ||--o{ DISCOUNT : "gets"

    SALE ||--o{ SALE_ITEM : "contains"
    SALE ||--o{ PAYMENT : "receives"
    SALE ||--|| DEBT : "may_create"

    DEBT ||--o{ DEBT_PAYMENT : "paid_via"
    PAYMENT ||--|| DEBT_PAYMENT : "applied_as"

    ROLE {
        uuid id PK
        string name
        string description
    }

    PERMISSION {
        uuid id PK
        string module
        string action
    }

    ROLE_PERMISSION {
        uuid id PK
        uuid roleId FK
        uuid permissionId FK
    }

    USER {
        uuid id PK
        string fullName
        string phone
        string passwordHash
        uuid roleId FK
        uuid branchId FK
        boolean isActive
        datetime checkInTime
        datetime checkOutTime
    }

    BRANCH {
        uuid id PK
        string name
        string address
        boolean isMain
    }

    WAREHOUSE {
        uuid id PK
        uuid branchId FK
        string name
    }

    CATEGORY {
        uuid id PK
        string name
        uuid parentId FK
    }

    BRAND {
        uuid id PK
        string name
    }

    SIZE {
        uuid id PK
        string label
        int sortOrder
    }

    COLOR {
        uuid id PK
        string name
        string hexCode
    }

    PRODUCT {
        uuid id PK
        string name
        string sku
        uuid categoryId FK
        uuid brandId FK
        decimal costPrice
        decimal sellingPrice
        boolean isActive
    }

    PRODUCT_IMAGE {
        uuid id PK
        uuid productId FK
        string url
        int position
    }

    PRODUCT_VARIANT {
        uuid id PK
        uuid productId FK
        uuid colorId FK
        uuid sizeId FK
        string barcode
        string qrCode
        int minStock
    }

    VARIANT_STOCK {
        uuid id PK
        uuid variantId FK
        uuid warehouseId FK
        int quantity
    }

    STOCK_MOVEMENT {
        uuid id PK
        uuid variantId FK
        string type
        int quantity
        uuid fromWarehouseId FK
        uuid toWarehouseId FK
        uuid supplierId FK
        uuid userId FK
        decimal unitCost
    }

    SUPPLIER {
        uuid id PK
        string name
        string phone
        decimal debt
    }

    CUSTOMER {
        uuid id PK
        string fullName
        string phone
        decimal bonusBalance
        boolean isVip
    }

    DISCOUNT {
        uuid id PK
        string type
        string valueType
        decimal value
        uuid productId FK
        uuid categoryId FK
        uuid customerId FK
    }

    SALE {
        uuid id PK
        uuid branchId FK
        uuid customerId FK
        uuid userId FK
        decimal totalAmount
        decimal discountAmount
        string status
    }

    SALE_ITEM {
        uuid id PK
        uuid saleId FK
        uuid variantId FK
        int quantity
        decimal unitPrice
        decimal subtotal
    }

    PAYMENT {
        uuid id PK
        uuid saleId FK
        decimal amount
        string method
    }

    DEBT {
        uuid id PK
        uuid saleId FK
        uuid customerId FK
        decimal totalAmount
        decimal remainingAmount
        datetime dueDate
        string status
    }

    DEBT_PAYMENT {
        uuid id PK
        uuid debtId FK
        uuid paymentId FK
        decimal amount
    }

    EXPENSE {
        uuid id PK
        uuid branchId FK
        string category
        decimal amount
        datetime date
    }

    EMPLOYEE_KPI {
        uuid id PK
        uuid userId FK
        int month
        int year
        decimal totalSales
        int itemsSold
    }

    AUDIT_LOG {
        uuid id PK
        uuid userId FK
        string action
        string entity
        string entityId
    }
-e ```

---

# API Struktura — RetailCRM

Barcha endpointlar `Next.js Route Handlers` (`app/api/...`) orqali amalga oshiriladi. Auth — JWT (Bearer token, httpOnly cookie). Har bir endpoint RBAC middleware orqali tekshiriladi.

**Umumiy konventsiyalar:**
- Javob formati: `{ success, data, error, meta }`
- Ro'yxat endpointlari: `?page=&limit=&search=&sortBy=&sortOrder=`
- Sana filtri: `?from=&to=`
- Soft delete: `DELETE` o'rniga `isActive=false` (productlar uchun)

---

## 1. Auth
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

## 2. Dashboard
```
GET    /api/dashboard/summary          // bugungi/oylik savdo, qarzdorlar, kam qolgan
GET    /api/dashboard/branch-stats     // filiallar kesimida
```

## 3. Mahsulotlar
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
POST   /api/products/:id/images
DELETE /api/products/:id/images/:imageId
```

## 4. Kategoriyalar
```
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

## 5. Brendlar
```
GET    /api/brands
POST   /api/brands
PATCH  /api/brands/:id
DELETE /api/brands/:id
```

## 6. Razmerlar
```
GET    /api/sizes
POST   /api/sizes
PATCH  /api/sizes/:id
DELETE /api/sizes/:id
```

## 7. Ranglar
```
GET    /api/colors
POST   /api/colors
PATCH  /api/colors/:id
DELETE /api/colors/:id
```

## 8. Mahsulot Variantlari
```
GET    /api/products/:productId/variants
POST   /api/products/:productId/variants
PATCH  /api/variants/:id
DELETE /api/variants/:id
GET    /api/variants/:id/barcode        // barcode/QR generatsiya
GET    /api/variants/search?barcode=    // POS skaner uchun
```

## 9. Ombor (Stock)
```
GET    /api/warehouses
POST   /api/warehouses
GET    /api/warehouses/:id/stock                  // variant qoldiqlari
POST   /api/stock-movements                       // kirim/chiqim/transfer/yaroqsiz
GET    /api/stock-movements?variantId=&type=&from=&to=
GET    /api/stock-movements/low-stock              // minStock dan past variantlar
POST   /api/stock-movements/transfer                // filiallar orasi
```

## 10. Sotuvlar (POS)
```
POST   /api/sales                       // yangi sotuv yaratish (items, payments)
GET    /api/sales
GET    /api/sales/:id
POST   /api/sales/:id/cancel
POST   /api/sales/:id/return            // to'liq/qisman qaytarish
GET    /api/sales/:id/receipt           // chek PDF/print formati
```

## 11. Mijozlar
```
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PATCH  /api/customers/:id
GET    /api/customers/:id/purchases
GET    /api/customers/:id/bonus-history
```

## 12. Nasiya (Qarzdorlik)
```
GET    /api/debts
GET    /api/debts/:id
GET    /api/debts/overdue
POST   /api/debts/:id/payments          // qisman to'lov qo'shish
```

## 13. To'lovlar
```
GET    /api/payments
GET    /api/payments/:id
GET    /api/payments/summary?method=&from=&to=
```

## 14. Yetkazib Beruvchilar
```
GET    /api/suppliers
POST   /api/suppliers
PATCH  /api/suppliers/:id
DELETE /api/suppliers/:id
GET    /api/suppliers/:id/movements
GET    /api/suppliers/:id/debt
```

## 15. Filiallar
```
GET    /api/branches
POST   /api/branches
PATCH  /api/branches/:id
DELETE /api/branches/:id
GET    /api/branches/:id/dashboard
```

## 16. Hisobotlar
```
GET    /api/reports/sales?period=daily|weekly|monthly|yearly&branchId=
GET    /api/reports/profit?from=&to=&branchId=
GET    /api/reports/top-products?limit=10|50&period=
GET    /api/reports/top-categories
GET    /api/reports/top-brands
GET    /api/reports/export?type=sales|profit&format=xlsx|pdf
```

## 17. Xodimlar
```
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PATCH  /api/employees/:id
DELETE /api/employees/:id
POST   /api/employees/:id/check-in
POST   /api/employees/:id/check-out
GET    /api/employees/:id/kpi?month=&year=
GET    /api/employees/kpi/top              // eng yaxshi sotuvchi
```

## 18. Rollar va Permissionlar
```
GET    /api/roles
POST   /api/roles
PATCH  /api/roles/:id
GET    /api/permissions
POST   /api/roles/:id/permissions          // ruxsatlarni biriktirish
```

## 19. Xarajatlar
```
GET    /api/expenses?branchId=&category=&from=&to=
POST   /api/expenses
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/net-profit?from=&to=&branchId=
```

## 20. Barcode/QR
```
GET    /api/variants/:id/barcode/print      // chop etish uchun format (PDF/PNG)
POST   /api/variants/:id/regenerate-code
```

## 21. Audit Log
```
GET    /api/audit-logs?userId=&entity=&from=&to=
GET    /api/audit-logs/:id
```

## 22. Telegram Bot (webhook + service)
```
POST   /api/telegram/webhook                // Telegram update qabul qilish
POST   /api/telegram/notify/daily-summary   // cron orqali chaqiriladi
POST   /api/telegram/notify/low-stock
POST   /api/telegram/notify/debt-overdue
```

---

## Xatolik formati (barcha endpointlar uchun)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Narx 0 dan katta bo'lishi kerak"
  }
}
```

## Auth middleware qatlami
Har bir himoyalangan route quyidagicha tekshiriladi:
```
requireAuth() → requireRole([...]) → requirePermission(module, action) → handler
```
-e 

---

# Sahifalar Ro'yxati — RetailCRM (Next.js App Router)

## Auth (himoyasiz)
```
/login
```

## Dashboard
```
/dashboard
```

## Mahsulotlar
```
/products                      — ro'yxat (jadval, filter, search)
/products/new                  — yangi mahsulot
/products/[id]                 — ko'rish + variantlar + rasmlar
/products/[id]/edit            — tahrirlash
```

## Kategoriyalar
```
/categories                    — daraxt ko'rinishida ro'yxat
/categories/new
/categories/[id]/edit
```

## Brendlar
```
/brands
/brands/new
/brands/[id]/edit
```

## Razmerlar
```
/sizes
/sizes/new
/sizes/[id]/edit
```

## Ranglar
```
/colors
/colors/new
/colors/[id]/edit
```

## Variantlar (Mahsulot ichida modal/tab sifatida, alohida sahifa shart emas)
```
/products/[id]/variants/new    — modal yoki sahifa
/variants/[id]/barcode         — barcode/QR ko'rish va chop etish
```

## Ombor
```
/warehouse                     — umumiy qoldiq ko'rinishi (filial/ombor bo'yicha)
/warehouse/stock-in             — kirim qilish
/warehouse/stock-out            — chiqim (yaroqsiz, qaytarish)
/warehouse/transfer             — filiallar orasi o'tkazish
/warehouse/movements            — barcha harakatlar tarixi
/warehouse/low-stock            — minimal qoldiqdan past variantlar
```

## Sotuvlar (POS)
```
/pos                            — kassir interfeysi (to'liq alohida layout)
/sales                          — sotuvlar tarixi
/sales/[id]                     — sotuv tafsiloti + chek
```

## Mijozlar
```
/customers
/customers/new
/customers/[id]                 — profil, xarid tarixi, bonus, qarz
/customers/[id]/edit
```

## Nasiya (Qarzdorlik)
```
/debts                          — barcha qarzlar ro'yxati
/debts/overdue                  — muddati o'tganlar
/debts/[id]                     — tafsilot + to'lov qo'shish
```

## To'lovlar
```
/payments                       — barcha to'lovlar tarixi (filtrlar bilan)
```

## Yetkazib Beruvchilar
```
/suppliers
/suppliers/new
/suppliers/[id]                 — tafsilot, qarz, kirim tarixi
/suppliers/[id]/edit
```

## Filiallar
```
/branches
/branches/new
/branches/[id]                  — filial dashboard
/branches/[id]/edit
```

## Hisobotlar
```
/reports/sales                  — kunlik/haftalik/oylik/yillik
/reports/profit
/reports/top-products
/reports/top-categories
/reports/top-brands
```

## Xodimlar
```
/employees
/employees/new
/employees/[id]                 — profil, ish vaqti, KPI
/employees/[id]/edit
```

## Rollar va Permissionlar
```
/roles
/roles/new
/roles/[id]/permissions          — ruxsatlar matritsasi (checkbox jadval)
```

## Xarajatlar
```
/expenses
/expenses/new
/expenses/[id]/edit
/expenses/net-profit             — sof foyda hisobot sahifasi
```

## Audit Log
```
/audit-logs                      — filtrlanadigan log jadvali
```

## Sozlamalar
```
/settings/profile
/settings/branch
/settings/telegram-bot            — bot tokenini ulash, bildirishnoma sozlamalari
```

---

## Layout strukturasi (qisqacha)

```
app/
├── (auth)/
│   └── login/
├── (dashboard)/                 — sidebar+header umumiy layout
│   ├── dashboard/
│   ├── products/
│   ├── categories/
│   ├── brands/
│   ├── sizes/
│   ├── colors/
│   ├── warehouse/
│   ├── sales/
│   ├── customers/
│   ├── debts/
│   ├── payments/
│   ├── suppliers/
│   ├── branches/
│   ├── reports/
│   ├── employees/
│   ├── roles/
│   ├── expenses/
│   ├── audit-logs/
│   └── settings/
└── (pos)/                        — alohida, soddalashtirilgan layout (sidebar yo'q)
    └── pos/
```

**Jami: ~45 sahifa** (modal/tab ko'rinishidagi kichik formalar bundan tashqari).
-e 

---

# Loyiha Papka Strukturasi — RetailCRM

> Bu struktura AI'ga (Claude Code va h.k.) ko'rsatib, kodni shu bo'yicha generatsiya qilish uchun mo'ljallangan. Har bir papka oldingi bosqichlardagi (PRD, schema.prisma, API-structure.md, Pages-list.md) hujjatlarga mos keladi.

```
retail-crm/
├── prisma/
│   ├── schema.prisma                 # 2-bosqichdagi to'liq schema
│   └── seed.ts                       # boshlang'ich rol/permission/admin user
│
├── public/
│   └── ...
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                   # sidebar + header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── categories/
│   │   │   ├── brands/
│   │   │   ├── sizes/
│   │   │   ├── colors/
│   │   │   ├── warehouse/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── stock-in/page.tsx
│   │   │   │   ├── stock-out/page.tsx
│   │   │   │   ├── transfer/page.tsx
│   │   │   │   ├── movements/page.tsx
│   │   │   │   └── low-stock/page.tsx
│   │   │   ├── sales/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── customers/
│   │   │   ├── debts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── overdue/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── payments/
│   │   │   ├── suppliers/
│   │   │   ├── branches/
│   │   │   ├── reports/
│   │   │   │   ├── sales/page.tsx
│   │   │   │   ├── profit/page.tsx
│   │   │   │   ├── top-products/page.tsx
│   │   │   │   ├── top-categories/page.tsx
│   │   │   │   └── top-brands/page.tsx
│   │   │   ├── employees/
│   │   │   ├── roles/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/permissions/page.tsx
│   │   │   ├── expenses/
│   │   │   ├── audit-logs/
│   │   │   └── settings/
│   │   │       ├── profile/page.tsx
│   │   │       ├── branch/page.tsx
│   │   │       └── telegram-bot/page.tsx
│   │   │
│   │   ├── (pos)/
│   │   │   └── pos/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   ├── refresh/route.ts
│   │       │   └── me/route.ts
│   │       ├── dashboard/
│   │       │   ├── summary/route.ts
│   │       │   └── branch-stats/route.ts
│   │       ├── products/
│   │       │   ├── route.ts                 # GET, POST
│   │       │   └── [id]/
│   │       │       ├── route.ts             # GET, PATCH, DELETE
│   │       │       └── images/
│   │       │           ├── route.ts
│   │       │           └── [imageId]/route.ts
│   │       ├── categories/...
│   │       ├── brands/...
│   │       ├── sizes/...
│   │       ├── colors/...
│   │       ├── variants/
│   │       │   ├── [id]/route.ts
│   │       │   ├── [id]/barcode/route.ts
│   │       │   └── search/route.ts
│   │       ├── warehouses/...
│   │       ├── stock-movements/
│   │       │   ├── route.ts
│   │       │   ├── low-stock/route.ts
│   │       │   └── transfer/route.ts
│   │       ├── sales/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       ├── cancel/route.ts
│   │       │       ├── return/route.ts
│   │       │       └── receipt/route.ts
│   │       ├── customers/...
│   │       ├── debts/
│   │       │   ├── route.ts
│   │       │   ├── overdue/route.ts
│   │       │   └── [id]/payments/route.ts
│   │       ├── payments/...
│   │       ├── suppliers/...
│   │       ├── branches/...
│   │       ├── reports/...
│   │       ├── employees/...
│   │       ├── roles/...
│   │       ├── permissions/...
│   │       ├── expenses/...
│   │       ├── audit-logs/...
│   │       └── telegram/
│   │           ├── webhook/route.ts
│   │           └── notify/
│   │               ├── daily-summary/route.ts
│   │               ├── low-stock/route.ts
│   │               └── debt-overdue/route.ts
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn komponentlari (button, input, table...)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── pos-layout.tsx
│   │   ├── products/
│   │   │   ├── product-form.tsx
│   │   │   ├── product-table.tsx
│   │   │   └── variant-manager.tsx
│   │   ├── pos/
│   │   │   ├── barcode-scanner.tsx
│   │   │   ├── cart.tsx
│   │   │   └── payment-modal.tsx
│   │   ├── warehouse/
│   │   ├── sales/
│   │   ├── customers/
│   │   ├── debts/
│   │   ├── reports/
│   │   │   └── charts/
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── pagination.tsx
│   │       └── confirm-dialog.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts                 # PrismaClient singleton
│   │   ├── auth.ts                   # JWT generate/verify
│   │   ├── permissions.ts            # RBAC helper: requireRole, requirePermission
│   │   ├── barcode.ts                # barcode/QR generatsiya
│   │   ├── telegram.ts               # Telegram bot client
│   │   ├── api-response.ts           # { success, data, error } wrapper
│   │   └── utils.ts
│   │
│   ├── services/                     # business logic, route handlerlardan chaqiriladi
│   │   ├── product.service.ts
│   │   ├── variant.service.ts
│   │   ├── stock.service.ts
│   │   ├── sale.service.ts
│   │   ├── debt.service.ts
│   │   ├── customer.service.ts
│   │   ├── report.service.ts
│   │   ├── employee.service.ts
│   │   └── notification.service.ts
│   │
│   ├── types/
│   │   ├── product.ts
│   │   ├── sale.ts
│   │   ├── debt.ts
│   │   └── api.ts
│   │
│   ├── validators/                   # zod schemalar
│   │   ├── product.schema.ts
│   │   ├── sale.schema.ts
│   │   ├── customer.schema.ts
│   │   └── debt.schema.ts
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-cart.ts               # POS savat state
│   │   └── use-permissions.ts
│   │
│   └── middleware.ts                 # auth tekshirish, route himoyasi
│
├── .env                              # DATABASE_URL, JWT_SECRET, TELEGRAM_BOT_TOKEN
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## AI'ga berish uchun qisqa kontekst (prompt sifatida ishlatish mumkin)

> Quyidagi loyihani yarataman: Next.js (App Router) + TypeScript + PostgreSQL + Prisma + TailwindCSS + Shadcn UI. To'liq Prisma schema, API endpointlar va sahifalar ro'yxati tayyor (alohida fayllarda). Papka strukturasi: `src/app` — route guruhlari `(auth)`, `(dashboard)`, `(pos)` va `api/`; `src/components` — modul bo'yicha; `src/services` — business logic; `src/lib` — yordamchi modullar (prisma, auth, permissions, barcode, telegram); `src/validators` — zod; `src/hooks`. Avval **V1 (MVP)** modullarini amalga oshiramiz: auth, dashboard, products, variants, warehouse, POS, customers, debts, reports (asosiy).

## Ishlash tartibi tavsiyasi (8-bosqich uchun)

1. `prisma/schema.prisma` → migratsiya → seed (rollar, admin user)
2. `lib/prisma.ts`, `lib/auth.ts`, `lib/permissions.ts`, `middleware.ts`
3. Auth (login/logout/me) + `(auth)/login`
4. Asosiy katalog: categories → brands → sizes → colors → products → variants
5. Warehouse: stock-in/out/transfer
6. POS (eng murakkab qism, alohida)
7. Customers + Debts
8. Reports (asosiy)
9. Filiallar, Xodimlar, Rollar (V2 boshlanishi)