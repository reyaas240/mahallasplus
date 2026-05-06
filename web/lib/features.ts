import { prisma } from "./prisma";

export type FeatureKey = 
  | "MAX_SUB_MAHALLAS" 
  | "ALLOW_COMMITTEE_OVERSIGHT" 
  | "ALLOW_FUND_DISTRIBUTION" 
  | "ALLOW_DONOR_REGISTRY" 
  | "ALLOW_ANALYTICS";

export async function getFeatureValue(mainMahallaId: string, key: FeatureKey): Promise<any> {
  const mahalla = await prisma.mainMahalla.findUnique({
    where: { id: mainMahallaId },
    select: {
      licensePlan: {
        select: { featureConfig: true }
      }
    }
  });

  if (!mahalla?.licensePlan) return null;

  const config = mahalla.licensePlan.featureConfig as Record<string, any>;
  return config[key];
}

export async function checkFeature(mainMahallaId: string, key: FeatureKey): Promise<boolean> {
  const value = await getFeatureValue(mainMahallaId, key);
  return !!value;
}
