const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_Oc5zI9AadiRW@ep-winter-math-aqzei3qn.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});
prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'OtpVerification'`.then(console.log).finally(() => prisma.$disconnect());
