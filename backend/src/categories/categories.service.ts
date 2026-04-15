import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.ext.category.findMany();
  }

  async create(data: { name: string; description?: string }) {
    return await this.prisma.ext.category.create({
      data,
    });
  }
}
