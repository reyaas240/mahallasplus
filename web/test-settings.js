const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.systemSettings.findUnique({ where: { id: "global" } }).then(console.log).catch(console.error).finally(() => prisma.$disconnect());
