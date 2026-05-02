import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mahallasplus.com' },
    update: {},
    create: {
      email: 'admin@mahallasplus.com',
      name: 'Platform Administrator',
      password: password,
      role: 'PLATFORM_ADMIN',
    },
  });
  
  console.log('Seed completed successfully!');
  console.log(`Admin User: ${admin.email}`);
  console.log(`Password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
