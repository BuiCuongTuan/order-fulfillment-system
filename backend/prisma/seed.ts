/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // 1. Roles
  const roles = [
    { code: 'ADMIN', name: 'Administrator' },
    { code: 'SALES', name: 'Sales Representative' },
    { code: 'WAREHOUSE_MANAGER', name: 'Warehouse Manager' },
    { code: 'ACCOUNTANT', name: 'Accountant' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });

  // 2. Admin User
  const adminEmail = 'admin@admin.com';
  const hashedPassword = await bcrypt.hash('12345678', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: 'System Administrator',
      passwordHash: hashedPassword,
      roleId: adminRole.id,
    },
  });

  // 3. Category
  const catElectronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics', description: 'Gadgets and devices' },
  });

  const catFurniture = await prisma.category.upsert({
    where: { name: 'Furniture' },
    update: {},
    create: { name: 'Furniture', description: 'Office and home furniture' },
  });

  // 4. Warehouse
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: 'MAIN_DC' },
    update: {},
    create: {
      code: 'MAIN_DC',
      name: 'Main Distribution Center',
      location: '123 Enterprise Blvd',
    },
  });

  // 5. Products & Inventory
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const productsData = [
    {
      sku: 'LPT-X1',
      name: 'ThinkPad X1 Carbon',
      price: 1500,
      categoryId: catElectronics.id,
    },
    {
      sku: 'MOU-MX',
      name: 'Logitech MX Master 3',
      price: 100,
      categoryId: catElectronics.id,
    },
    {
      sku: 'CHR-HMAN',
      name: 'Herman Miller Aeron',
      price: 1200,
      categoryId: catFurniture.id,
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });

    const stockExists = await prisma.stockLevel.findFirst({
      where: { productId: product.id, warehouseId: mainWarehouse.id },
    });
    if (!stockExists) {
      await prisma.stockLevel.create({
        data: {
          productId: product.id,
          warehouseId: mainWarehouse.id,
          quantity: 50,
        },
      });
    }
  }

  // 6. Orders
  const productLap = await prisma.product.findUnique({
    where: { sku: 'LPT-X1' },
  });

  const orderExists = await prisma.order.findFirst();
  if (!orderExists && productLap && adminUser) {
    const order = await prisma.order.create({
      data: {
        orderCode: '20260416-DEMO',
        status: 'PENDING_APPROVAL',
        totalAmount: Number(productLap.price) * 2,
        createdById: adminUser.id,
        items: {
          create: [
            {
              productId: productLap.id,
              quantity: 2,
              unitPrice: productLap.price,
              subTotal: Number(productLap.price) * 2,
            },
          ],
        },
      },
    });
    console.log('Created Sample Order:', order.orderCode);
  }

  console.log('Premium Sample Data seeded successfully!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
