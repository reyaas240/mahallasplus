const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123", 10);

  // Clear existing families for idempotency
  await prisma.familyCard.deleteMany({});

  // 1. Create Main Mahalla
  const mainMahalla = await prisma.mainMahalla.upsert({
    where: { name: "Colombo Central Mahalla" },
    update: {},
    create: {
      name: "Colombo Central Mahalla",
      address: "Colombo, Sri Lanka",
    },
  });

  // 2. Create Sub Mahallas
  const sub1 = await prisma.subMahalla.upsert({
    where: { name: "Slave Island North" },
    update: {},
    create: {
      name: "Slave Island North",
      mainMahallaId: mainMahalla.id,
    }
  });

  const sub2 = await prisma.subMahalla.upsert({
    where: { name: "Kollupitiya East" },
    update: {},
    create: {
      name: "Kollupitiya East",
      mainMahallaId: mainMahalla.id,
    }
  });

  // 3. Create Main Admin
  await prisma.user.upsert({
    where: { email: "admin@mahallasplus.com" },
    update: { password: hashedPassword },
    create: {
      name: "Super Admin",
      email: "admin@mahallasplus.com",
      password: hashedPassword,
      role: "MAIN_ADMIN",
      mainMahallaId: mainMahalla.id,
    },
  });

  // 4. Create Family Cards & Members
  const family1 = await prisma.familyCard.create({
    data: {
      subMahallaCardNo: "FAM-001",
      subMahallaId: sub1.id,
      livingType: "OWN_HOUSE",
      members: {
        create: [
          { 
            title: "Mr.", 
            fullName: "Ahmed Razak", 
            relationship: "HEAD", 
            dob: new Date("1980-05-15"),
            email: "ahmed@example.com",
            isBreadwinner: true,
            occupation: "Engineer"
          },
          { 
            title: "Mrs.", 
            fullName: "Fatima Razak", 
            relationship: "SPOUSE", 
            dob: new Date("1985-08-20"),
            maritalStatus: "Married"
          },
          { 
            title: "Master", 
            fullName: "Zaid Razak", 
            relationship: "CHILD", 
            dob: new Date("2010-02-10"),
            isStudent: true,
            school: "Royal College"
          },
        ]
      }
    }
  });

  const family2 = await prisma.familyCard.create({
    data: {
      subMahallaCardNo: "FAM-002",
      subMahallaId: sub2.id,
      livingType: "OWN_HOUSE",
      members: {
        create: [
          { 
            title: "Mr.", 
            fullName: "Mohamed Ishak", 
            relationship: "HEAD", 
            dob: new Date("1975-03-12"),
            email: "ishak@example.com",
            isBreadwinner: true,
            occupation: "Doctor"
          },
          { 
            title: "Mrs.", 
            fullName: "Sithy Ishak", 
            relationship: "SPOUSE", 
            dob: new Date("1978-11-05"),
            maritalStatus: "Married"
          },
          { 
            title: "Miss", 
            fullName: "Aisha Ishak", 
            relationship: "CHILD", 
            dob: new Date("2012-06-25"),
            isStudent: true,
            school: "Ladies College"
          },
        ]
      }
    }
  });

  console.log("Seed successful!");
  console.log("Created 2 Sub Mahallas, 2 Family Cards, and 6 Members.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
