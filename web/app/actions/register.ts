"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { sendEmail } from "@/lib/email";

async function saveFile(file: File, folder: string) {
  if (!file || file.size === 0) return null;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-").replace(/\.[^/.]+$/, "")}.jpg`;
  const relativePath = `/uploads/${folder}/${filename}`;
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  
  await sharp(buffer)
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(absolutePath);
    
  return relativePath;
}

export async function submitRegistration(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const mahallaName = formData.get("mahallaName") as string;
  const countryId = formData.get("country") as string;
  const provinceId = formData.get("province") as string;
  const districtId = formData.get("district") as string;
  const address = formData.get("address") as string;
  const licensePlanId = formData.get("licensePlanId") as string;
  
  const governmentIdFile = formData.get("governmentId") as File;
  const selfieFile = formData.get("selfie") as File;

  // Validate required fields
  if (!fullName || !email || !mahallaName) {
    return { success: false, error: "Missing required fields: name, email, and mahalla name are required." };
  }
  if (!licensePlanId) {
    return { success: false, error: "Please select a license plan." };
  }

  try {
    // Guard against empty string IDs — Prisma will throw on findUnique with ""
    const [country, province, district] = await Promise.all([
      countryId ? prisma.masterCountry.findUnique({ where: { id: countryId }, select: { name: true } }) : null,
      provinceId ? prisma.masterProvince.findUnique({ where: { id: provinceId }, select: { name: true } }) : null,
      districtId ? prisma.masterDistrict.findUnique({ where: { id: districtId }, select: { name: true } }) : null,
    ]);

    const governmentIdUrl = await saveFile(governmentIdFile, "registrations/ids");
    const selfieUrl = await saveFile(selfieFile, "registrations/selfies");

    const plan = await prisma.licensePlan.findUnique({ where: { id: licensePlanId } });
    if (!plan) return { success: false, error: "Selected license plan not found." };

    // Check if email already registered
    const existing = await prisma.registrationRequest.findUnique({
      where: { email }
    });

    if (existing) {
      return { success: false, error: "A registration request with this email already exists." };
    }

    const data = {
      fullName,
      email,
      phone,
      mahallaName,
      country: country?.name || null,
      province: province?.name || null,
      district: district?.name || null,
      address,
      licensePlanId,
      governmentIdUrl,
      selfieUrl,
      status: "PENDING" as any
    };

    const request = await prisma.registrationRequest.create({
      data
    });

    // Generate Initial Invoice
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const amount = plan.isSaleActive && plan.salePrice ? plan.salePrice : plan.basePrice;
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        amount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        licensePlanId,
        registrationRequestId: request.id,
        status: "UNPAID"
      }
    });

    // Fetch Branding & Bank Details
    const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });

    // Send Invoice Email
    const subject = `Invoice ${invoiceNo} - MahallasPlus Registration`;
    const text = `Dear ${fullName}, your registration for ${mahallaName} has been received. Please pay the invoice ${invoiceNo} for ${amount} LKR.`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background: #f1f5f9; }
            .card { background: white; padding: 48px; border-radius: 32px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .header { border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { height: 40px; margin-bottom: 20px; }
            .inv-no { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.025em; }
            .details { margin: 24px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
            .label { color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px; }
            .val { color: #0f172a; font-weight: 800; }
            .total-box { background: #f8fafc; padding: 24px; border-radius: 20px; margin-top: 30px; border: 1px solid #e2e8f0; }
            .bank-box { background: #f0f9ff; padding: 24px; border-radius: 20px; margin-top: 24px; border: 1px solid #bae6fd; }
            .bank-title { font-size: 12px; font-weight: 900; color: #0369a1; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div style="text-align: center; margin-bottom: 32px;">
                ${settings?.logoUrl ? `<img src="${settings.logoUrl}" class="logo" />` : '<div style="font-size: 24px; font-weight: 900; color: #2563eb;">MahallasPlus</div>'}
              </div>
              
              <div class="header">
                <div>
                  <div class="inv-no">INVOICE</div>
                  <div style="font-size: 14px; font-weight: 700; color: #64748b; margin-top: 4px;"># ${invoiceNo}</div>
                </div>
                <div style="text-align: right;">
                  <div class="label">Date Issued</div>
                  <div class="val" style="font-size: 13px;">${new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div class="details">
                <div class="row"><span class="label">Registrant</span><span class="val">${fullName}</span></div>
                <div class="row"><span class="label">Entity</span><span class="val">${mahallaName}</span></div>
                <div class="row"><span class="label">Plan</span><span class="val">${plan.name} (${plan.type})</span></div>
                <div class="row"><span class="label">Due Date</span><span class="val" style="color: #ef4444;">${invoice.dueDate.toLocaleDateString()}</span></div>
              </div>

              <div class="total-box">
                <div class="row" style="margin-bottom: 0; align-items: center;">
                  <span class="label" style="font-size: 12px;">Total Payable Amount</span>
                  <span class="val" style="font-size: 24px; color: #2563eb;">LKR ${amount.toLocaleString()}</span>
                </div>
              </div>

              ${settings?.bankName ? `
              <div class="bank-box">
                <div class="bank-title">Bank Transfer Details</div>
                <div class="row"><span class="label">Bank</span><span class="val" style="font-size: 13px;">${settings.bankName}</span></div>
                <div class="row"><span class="label">Account Number</span><span class="val" style="font-size: 13px;">${settings.accountNumber}</span></div>
                <div class="row"><span class="label">Account Holder</span><span class="val" style="font-size: 13px;">${settings.accountHolder}</span></div>
                ${settings.bankInstructions ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #bae6fd;">
                  <div class="label" style="margin-bottom: 4px;">Payment Instructions</div>
                  <div style="font-size: 12px; color: #0c4a6e; font-weight: 600; line-height: 1.5;">${settings.bankInstructions}</div>
                </div>
                ` : ''}
              </div>
              ` : ''}

              <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center; line-height: 1.6;">
                Our compliance team will verify your documents shortly. Full access to the platform will be granted once the payment is cleared.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
              &copy; ${new Date().getFullYear()} MahallasPlus Platform. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(email, subject, text, html);

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Failed to submit request. Email might already exist." };
  }
}
