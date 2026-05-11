import { prisma } from "./prisma";

export type LicenseLimitKey = "MAX_SUB_MAHALLAS" | "MAX_FAMILY_CARDS" | "MAX_MEMBERS" | "MAX_SOCIETIES";

const limitLabels: Record<LicenseLimitKey, string> = {
  MAX_SUB_MAHALLAS: "Sub-Mahallas",
  MAX_FAMILY_CARDS: "Family Cards",
  MAX_MEMBERS: "Members",
  MAX_SOCIETIES: "Societies/Committees"
};

export async function checkLicenseLimit(mainMahallaId: string, key: LicenseLimitKey) {
  const mahalla = await prisma.mainMahalla.findUnique({
    where: { id: mainMahallaId },
    include: {
      licensePlan: { select: { featureConfig: true } },
    }
  });

  if (!mahalla?.licensePlan?.featureConfig) return { allowed: true };

  const config = mahalla.licensePlan.featureConfig as Record<string, any>;
  const limit = config[key];

  // If no limit defined or 0, we assume unlimited unless 0 is explicitly intended as "none"
  // For safety, let's treat undefined as unlimited for now.
  if (limit === undefined || limit === null) return { allowed: true };
  
  const maxAllowed = Number(limit);
  if (maxAllowed <= 0) return { allowed: true }; // 0 or negative treated as unlimited in this context

  let currentCount = 0;

  switch (key) {
    case "MAX_SUB_MAHALLAS":
      currentCount = await prisma.subMahalla.count({ where: { mainMahallaId } });
      break;
    case "MAX_FAMILY_CARDS":
      currentCount = await prisma.familyCard.count({ 
        where: { subMahalla: { mainMahallaId } } 
      });
      break;
    case "MAX_MEMBERS":
      currentCount = await prisma.familyMember.count({ 
        where: { familyCard: { subMahalla: { mainMahallaId } } } 
      });
      break;
    case "MAX_SOCIETIES":
      currentCount = await prisma.committee.count({ where: { mainMahallaId } });
      break;
  }

  if (currentCount >= maxAllowed) {
    return { 
      allowed: false, 
      error: `${limitLabels[key]} limit reached. Your current plan allows a maximum of ${maxAllowed} ${limitLabels[key].toLowerCase()}.` 
    };
  }

  return { allowed: true };
}
