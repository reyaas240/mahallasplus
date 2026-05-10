import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.otpVerification.upsert({
      where: { email: 'test@example.com' },
      update: { otp: '123456', expiresAt: new Date() },
      create: { email: 'test@example.com', otp: '123456', expiresAt: new Date() }
    });
    console.log("Prisma upsert successful");
  } catch(e) {
    console.error("Prisma error:", e);
  }
}
main();
