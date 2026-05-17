"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCountry(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const currency = formData.get("currency") as string;
  const currencyDecimalPlaces = parseInt(formData.get("currencyDecimalPlaces") as string) || 2;

  try {
    await prisma.masterCountry.create({
      data: { name, code, currency, currencyDecimalPlaces }
    });
    revalidatePath("/dashboard/master-data/countries");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to create country. Check if code already exists." };
  }
}

const configMap: any = {
  provinces: { model: "masterProvince", parentKey: "countryId" },
  districts: { model: "masterDistrict", parentKey: "provinceId" },
  'divisional-secretariats': { model: "masterDivisionalSecretariat", parentKey: "districtId" },
  areas: { model: "masterArea", parentKey: "divisionalSecretariatId" },
  'sub-areas': { model: "masterSubArea", parentKey: "areaId" },
  schools: { model: "masterSchool" },
  grades: { model: "masterGrade" },
  occupations: { model: "masterOccupation" },
  titles: { model: "masterTitle" },
};

export async function createGenericMasterData(type: string, formData: FormData) {
  const name = formData.get("name") as string;
  const config = configMap[type];

  if (!config) return { success: false, error: "Invalid master data type" };

  const dataToInsert: any = { name };
  if (config.parentKey) {
    const parentId = formData.get(config.parentKey) as string;
    if (!parentId) return { success: false, error: "Please select a parent record" };
    dataToInsert[config.parentKey] = parentId;
  }

  try {
    // @ts-ignore
    await prisma[config.model].create({
      data: dataToInsert
    });
    revalidatePath(`/dashboard/master-data/${type}`);
    return { success: true };
  } catch (e: any) {
    console.error("CREATE ERROR:", e);
    return { success: false, error: `Failed to create: ${e.message || String(e)}` };
  }
}

export async function updateGenericMasterData(type: string, id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const config = configMap[type];

  if (!config) return { success: false, error: "Invalid master data type" };

  const dataToUpdate: any = { name };
  if (config.parentKey) {
    const parentId = formData.get(config.parentKey) as string;
    if (parentId) {
      dataToUpdate[config.parentKey] = parentId;
    }
  }

  try {
    // @ts-ignore
    await prisma[config.model].update({
      where: { id },
      data: dataToUpdate
    });
    revalidatePath(`/dashboard/master-data/${type}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update." };
  }
}

export async function deleteGenericMasterData(type: string, id: string) {
  const config = configMap[type];
  if (!config) return { success: false, error: "Invalid master data type" };

  try {
    // Check for relations if it's a geographic type
    if (["provinces", "districts", "areas", "sub-areas"].includes(type)) {
      const item = await (prisma as any)[config.model].findUnique({
        where: { id },
        select: { name: true }
      });

      if (item) {
        // Check MainMahalla or SubMahalla or RegistrationRequest
        // This is a bit complex as fields might vary. 
        // For simplicity, let's check by name or ID in relevant models.
        
        const isUsedInMain = await prisma.mainMahalla.findFirst({
          where: { 
            OR: [
              { country: type === "countries" ? item.name : undefined },
              { province: type === "provinces" ? item.name : undefined },
              { district: type === "districts" ? item.name : undefined },
              { area: type === "areas" ? item.name : undefined },
            ].filter(condition => Object.values(condition)[0] !== undefined)
          }
        });

        const isUsedInSub = await prisma.subMahalla.findFirst({
          where: { 
            OR: [
              { area: type === "areas" ? item.name : undefined },
            ].filter(condition => Object.values(condition)[0] !== undefined)
          }
        });

        const isUsedInReq = await prisma.registrationRequest.findFirst({
          where: { 
            OR: [
              { country: type === "countries" ? item.name : undefined },
              { province: type === "provinces" ? item.name : undefined },
              { district: type === "districts" ? item.name : undefined },
              { divisionalSecretariat: type === "divisional-secretariats" ? item.name : undefined },
            ].filter(condition => Object.values(condition)[0] !== undefined)
          }
        });

        if (isUsedInMain || isUsedInSub || isUsedInReq) {
          return { success: false, error: "Cannot delete: This record is currently assigned to one or more Mahallas or Registration Requests." };
        }
      }
    }

    // @ts-ignore
    await prisma[config.model].delete({
      where: { id }
    });
    revalidatePath(`/dashboard/master-data/${type}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete. It might be linked to other records." };
  }
}

export async function getCountries() {
  return prisma.masterCountry.findMany({ orderBy: { name: "asc" } });
}

export async function getProvinces(countryId?: string) {
  return prisma.masterProvince.findMany({
    where: countryId ? { countryId } : {},
    orderBy: { name: "asc" }
  });
}

export async function getDistricts(provinceId?: string) {
  return prisma.masterDistrict.findMany({
    where: provinceId ? { provinceId } : {},
    orderBy: { name: "asc" }
  });
}

export async function getDivisionalSecretariats(districtId?: string) {
  return prisma.masterDivisionalSecretariat.findMany({
    where: districtId ? { districtId } : {},
    orderBy: { name: "asc" }
  });
}

export async function getCities(divisionalSecretariatId?: string) {
  return prisma.masterArea.findMany({
    where: divisionalSecretariatId ? { divisionalSecretariatId } : {},
    orderBy: { name: "asc" }
  });
}
