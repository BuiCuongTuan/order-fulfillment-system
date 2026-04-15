import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, ActionType, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ClsService } from 'nestjs-cls';

// Helper to safely access dynamic model delegates without triggering ESLint 'any' rules
type ModelDelegate = {
  findUnique(args: { where: unknown }): Promise<unknown>;
};

const getDelegate = (p: PrismaClient, m: string): ModelDelegate => {
  const key = m.charAt(0).toLowerCase() + m.slice(1);
  return (p as unknown as Record<string, ModelDelegate>)[key];
};

const createPrismaExtension = (prisma: PrismaClient, cls: ClsService) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          const result = await query(args);
          const userId = cls.isActive()
            ? cls.get<number>('user_id')
            : undefined;

          if (userId && model !== 'SystemLog' && model !== 'ApprovalLog') {
            await prisma.systemLog.create({
              data: {
                tableName: model,
                recordId: (result as { id?: number }).id || 0,
                action: ActionType.INSERT,
                newData: args.data as Prisma.InputJsonValue,
                userId: userId,
              },
            });
          }
          return result;
        },
        async update({ model, args, query }) {
          const where = args.where as { id?: number };
          let oldData: unknown = null;
          if (where?.id) {
            oldData = await getDelegate(prisma, model).findUnique({ where });
          }
          const result = await query(args);
          const userId = cls.isActive()
            ? cls.get<number>('user_id')
            : undefined;

          if (userId && model !== 'SystemLog' && model !== 'ApprovalLog') {
            // Only log if soft delete is triggered, or normal update
            const isDelete =
              (args.data as { deletedAt?: Date }).deletedAt !== undefined;
            await prisma.systemLog.create({
              data: {
                tableName: model,
                recordId: (result as { id?: number }).id || 0,
                action: isDelete ? ActionType.DELETE : ActionType.UPDATE,
                oldData: oldData as Prisma.InputJsonValue,
                newData: args.data as Prisma.InputJsonValue,
                userId: userId,
              },
            });
          }
          return result;
        },
        async delete({ model, args, query }) {
          const oldData = await getDelegate(prisma, model).findUnique({
            where: args.where,
          });
          const result = await query(args);
          const userId = cls.isActive()
            ? cls.get<number>('user_id')
            : undefined;

          if (userId && model !== 'SystemLog' && model !== 'ApprovalLog') {
            await prisma.systemLog.create({
              data: {
                tableName: model,
                recordId: (result as { id?: number }).id || 0,
                action: ActionType.DELETE,
                oldData: oldData as Prisma.InputJsonValue,
                userId: userId,
              },
            });
          }
          return result;
        },
      },
    },
  });
};

export type ExtendedPrismaClient = ReturnType<typeof createPrismaExtension>;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public readonly ext: ExtendedPrismaClient;

  constructor(private readonly cls: ClsService) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

    this.ext = createPrismaExtension(this, this.cls);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
