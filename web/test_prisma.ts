import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.mainMahalla.create({
      data: {
        name: "Test Mahalla " + Date.now(),
        email: "test@example.com",
        phone: "123456",
        address: "Test Address",
        country: "Test Country",
        province: "Test Province",
        district: "Test District",
        status: "ACTIVE",
        licensePlanId: null
      }
    });
    console.log("Success");
  } catch (e: any) {
    console.error("Error message:");
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
