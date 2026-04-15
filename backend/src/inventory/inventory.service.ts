import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockLevel } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.ext.stockLevel.findMany({
      include: {
        product: {
          select: { id: true, sku: true, name: true, price: true },
        },
        warehouse: { select: { id: true, name: true } },
      },
      orderBy: [{ warehouseId: 'asc' }, { productId: 'asc' }],
    });
  }

  async findByWarehouse(warehouseId: number) {
    return await this.prisma.ext.stockLevel.findMany({
      where: { warehouseId },
      include: { product: true },
    });
  }

  async findByProduct(productId: number) {
    return await this.prisma.ext.stockLevel.findMany({
      where: { productId },
      include: { warehouse: true },
    });
  }

  async adjustStock(
    warehouseId: number,
    productId: number,
    quantityChange: number,
  ): Promise<StockLevel> {
    // Check if product exists
    const product = await this.prisma.ext.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Check if warehouse exists
    const warehouse = await this.prisma.ext.warehouse.findUnique({
      where: { id: warehouseId },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    return await this.prisma.ext.$transaction(
      async (
        tx: Parameters<Parameters<PrismaService['ext']['$transaction']>[0]>[0],
      ) => {
        const stock = await tx.stockLevel.findUnique({
          where: { productId_warehouseId: { productId, warehouseId } },
        });

        if (stock) {
          return await tx.stockLevel.update({
            where: { productId_warehouseId: { productId, warehouseId } },
            data: { quantity: { increment: quantityChange } },
          });
        } else {
          if (quantityChange < 0) {
            throw new Error('Stock cannot be negative for a new item');
          }
          return await tx.stockLevel.create({
            data: {
              productId,
              warehouseId,
              quantity: quantityChange,
            },
          });
        }
      },
    );
  }
}
