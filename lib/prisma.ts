import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const client = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
