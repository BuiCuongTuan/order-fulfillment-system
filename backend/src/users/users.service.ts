import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

export type UserWithRole = User & { role: Role };

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserWithRole | null> {
    return await this.prisma.ext.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findOne(id: number): Promise<UserWithRole | null> {
    return await this.prisma.ext.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }
}
