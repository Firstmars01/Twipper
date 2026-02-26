import { PrismaClient } from "@prisma/client";

// Singleton pour éviter de créer plusieurs connexions en dev (hot reload)
const prisma = new PrismaClient();

export default prisma;
