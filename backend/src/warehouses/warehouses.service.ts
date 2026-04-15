import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.ext.warehouse.findMany();
  }

  async create(data: { code: string; name: string; location?: string }) {
    return await this.prisma.ext.warehouse.create({
      data,
    });
  }
}
