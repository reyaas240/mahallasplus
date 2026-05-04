const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const req = await prisma.fundRequest.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, purpose: true, attachments: true }
  });
  console.log(JSON.stringify(req, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
