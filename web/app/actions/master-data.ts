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
  areas: { model: "masterArea", parentKey: "districtId" },
  schools: { model: "masterSchool" },
  grades: { model: "masterGrade" },
  occupations: { model: "masterOccupation" },
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
  } catch (e) {
    return { success: false, error: "Failed to create. It might already exist." };
  }
}
