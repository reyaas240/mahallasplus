const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@127.0.0.1:5432/mahallasplus?schema=public"
    }
  }
});

async function fix() {
  try {
    await prisma.$executeRawUnsafe(`DROP TABLE "OtpVerification";`);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "OtpVerification" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "otp" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "OtpVerification_email_key" ON "OtpVerification"("email");
    `);
    console.log("Fixed local OtpVerification table");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
fix();
