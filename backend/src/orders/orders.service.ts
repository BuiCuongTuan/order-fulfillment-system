import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { format } from 'date-fns';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderCode(): Promise<string> {
    const today = new Date();
    const dateStr = format(today, 'yyyyMMdd');

    // Find the last order of today
    const lastOrder = await this.prisma.ext.order.findFirst({
      where: {
        orderCode: { startsWith: dateStr },
      },
      orderBy: { orderCode: 'desc' },
    });

    let seq = 1;
    if (lastOrder) {
      const parts = lastOrder.orderCode.split('-');
      if (parts.length === 2) {
        seq = parseInt(parts[1], 10) + 1;
      }
    }

    return `${dateStr}-${seq.toString().padStart(4, '0')}`;
  }

  async create(
    userId: number,
    items: { productId: number; quantity: number }[],
  ) {
    if (items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const orderCode = await this.generateOrderCode();

    // Calculate unitPrice and totalAmount using current product prices
    return await this.prisma.ext.$transaction(
      async (
        tx: Parameters<Parameters<PrismaService['ext']['$transaction']>[0]>[0],
      ) => {
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product || product.deletedAt) {
            throw new BadRequestException(
              `Product with ID ${item.productId} not found or inactive`,
            );
          }

          const unitPrice = parseFloat(product.price.toString());
          const subTotal = unitPrice * item.quantity;
          totalAmount += subTotal;

          orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            subTotal,
          });
        }

        const order = await tx.order.create({
          data: {
            orderCode,
            status: OrderStatus.PENDING_APPROVAL,
            totalAmount,
            createdById: userId,
            items: {
              create: orderItemsData,
            },
          },
          include: { items: true },
        });

        return order;
      },
    );
  }

  async findAll() {
    return await this.prisma.ext.order.findMany({
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.ext.order.findUnique({
      where: { id },
      include: { items: true, approvalLogs: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async approveOrder(
    orderId: number,
    userId: number,
    warehouseId: number,
    comment?: string,
  ) {
    // Requires deducting stock from a specific warehouse
    // The approval must specify which warehouse to fulfill from.
    return await this.prisma.ext.$transaction(
      async (
        tx: Parameters<Parameters<PrismaService['ext']['$transaction']>[0]>[0],
      ) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.status !== OrderStatus.PENDING_APPROVAL) {
          throw new BadRequestException(
            `Order cannot be approved. Current status: ${order.status}`,
          );
        }

        // Check stock and deduct
        for (const item of order.items) {
          const stock = await tx.stockLevel.findUnique({
            where: {
              productId_warehouseId: { productId: item.productId, warehouseId },
            },
          });

          if (!stock || stock.quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for Product ID ${item.productId} in Warehouse ID ${warehouseId}`,
            );
          }

          // Deduct
          await tx.stockLevel.update({
            where: { id: stock.id },
            data: { quantity: { decrement: item.quantity } },
          });
        }

        // Record approval log
        await tx.approvalLog.create({
          data: {
            orderId: order.id,
            userId,
            action: 'APPROVED',
            comment,
          },
        });

        // Update order status
        return await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.APPROVED },
        });
      },
    );
  }
}
