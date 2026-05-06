import { PrismaClient, PlanType, Status } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding license plans...");

  const plans = [
    {
      name: "Standard",
      type: PlanType.MONTHLY,
      basePrice: 1500,
      description: "Essential tools for small mahalla management",
      features: ["Up to 100 Families", "Donation Registry", "Committee Management"],
      isDefault: true,
      status: Status.ACTIVE
    },
    {
      name: "Professional",
      type: PlanType.MONTHLY,
      basePrice: 3500,
      salePrice: 2800,
      isSaleActive: true,
      description: "Advanced features for growing organizations",
      features: ["Unlimited Families", "Fund Distribution Tracking", "Oversight Access"],
      status: Status.ACTIVE
    },
    {
      name: "Enterprise",
      type: PlanType.ANNUALLY,
      basePrice: 30000,
      description: "Full suite for large networks with priority support",
      features: ["Everything in Pro", "Custom Domain", "Priority SMTP Support", "Advanced Analytics"],
      status: Status.ACTIVE
    }
  ];

  for (const plan of plans) {
    await prisma.licensePlan.upsert({
      where: { name: plan.name },
      update: plan as any,
      create: plan as any
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
