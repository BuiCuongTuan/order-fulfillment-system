import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.ext.product.findMany({
      where: { deletedAt: null },
      include: { category: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.ext.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(data: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    categoryId: number;
  }) {
    return await this.prisma.ext.product.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      categoryId?: number;
    },
  ) {
    // Check if exists
    await this.findOne(id);
    return await this.prisma.ext.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    // Soft delete
    await this.findOne(id);
    return await this.prisma.ext.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
