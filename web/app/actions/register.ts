"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { sendEmail } from "@/lib/email";
import { smartUpload } from "@/lib/upload";

async function saveFile(file: File, folder: string) {
  if (!file || file.size === 0) return null;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Process image with Sharp
  const processedBuffer = await sharp(buffer)
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-").replace(/\.[^/.]+$/, "")}.jpg`;
  
  // Use Smart Upload (Blob in Prod, Local in Dev)
  return await smartUpload(processedBuffer, folder, filename);
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

    // Check if email already registered in requests
    const existingReq = await prisma.registrationRequest.findUnique({
      where: { email }
    });

    if (existingReq) {
      return { success: false, error: "A registration request with this email already exists." };
    }

    // Check if Mahalla Name already exists in active main mahallas
    const existingMahalla = await prisma.mainMahalla.findUnique({
      where: { name: mahallaName }
    });

    if (existingMahalla) {
      return { success: false, error: "A Mahalla with this name already exists on the platform." };
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
    const subject = `[MahallasPlus] Registration Received - Invoice #${invoiceNo}`;
    const text = `Dear ${fullName}, your registration for ${mahallaName} has been received. Please pay the invoice ${invoiceNo} for ${amount} LKR.`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice</title>
        </head>
        <body style="margin: 0; padding: 40px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 32px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
                  <tr>
                    <td style="padding: 48px;">
                      
                      <!-- Logo Area -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding-bottom: 32px;">
                            ${settings?.logoUrl ? `<img src="${settings.logoUrl}" height="40" alt="MahallasPlus" style="display: block; height: 40px;" />` : `<div style="font-size: 24px; font-weight: 900; color: #2563eb;">MahallasPlus</div>`}
                          </td>
                        </tr>
                      </table>

                      <!-- Header (Invoice & Date) -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px;">
                        <tr>
                          <td align="left" valign="top">
                            <div style="font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.025em; line-height: 1.2;">INVOICE</div>
                            <div style="font-size: 14px; font-weight: 700; color: #64748b; margin-top: 4px;"># ${invoiceNo}</div>
                          </td>
                          <td align="right" valign="top">
                            <div style="color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px; margin-bottom: 4px;">Date Issued</div>
                            <div style="color: #0f172a; font-weight: 800; font-size: 13px;">${new Date().toLocaleDateString()}</div>
                          </td>
                        </tr>
                      </table>

                      <!-- Details -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                        <tr>
                          <td align="left" style="padding-bottom: 12px; width: 40%;">
                            <span style="color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">Registrant</span>
                          </td>
                          <td align="left" style="padding-bottom: 12px; width: 60%;">
                            <span style="color: #0f172a; font-weight: 800; font-size: 14px;">${fullName}</span>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding-bottom: 12px;">
                            <span style="color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">Entity</span>
                          </td>
                          <td align="left" style="padding-bottom: 12px;">
                            <span style="color: #0f172a; font-weight: 800; font-size: 14px;">${mahallaName}</span>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding-bottom: 12px;">
                            <span style="color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">Plan</span>
                          </td>
                          <td align="left" style="padding-bottom: 12px;">
                            <span style="color: #0f172a; font-weight: 800; font-size: 14px;">${plan.name} (${plan.type})</span>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding-bottom: 0;">
                            <span style="color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">Due Date</span>
                          </td>
                          <td align="left" style="padding-bottom: 0;">
                            <span style="color: #ef4444; font-weight: 800; font-size: 14px;">${invoice.dueDate.toLocaleDateString()}</span>
                          </td>
                        </tr>
                      </table>

                      <!-- Total Payable -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0; margin-top: 30px;">
                        <tr>
                          <td align="left" valign="middle" style="padding: 24px;">
                            <span style="color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Total Payable Amount</span>
                          </td>
                          <td align="right" valign="middle" style="padding: 24px;">
                            <span style="color: #2563eb; font-weight: 800; font-size: 24px;">LKR ${amount.toLocaleString()}</span>
                          </td>
                        </tr>
                      </table>

                      <!-- Bank Transfer Details -->
                      ${settings?.bankName ? `
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f9ff; border-radius: 20px; border: 1px solid #bae6fd; margin-top: 24px;">
                        <tr>
                          <td style="padding: 24px;">
                            <div style="font-size: 12px; font-weight: 900; color: #0369a1; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">Bank Transfer Details</div>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="left" style="padding-bottom: 12px; width: 40%; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">Bank</td>
                                <td align="left" style="padding-bottom: 12px; width: 60%; color: #0f172a; font-weight: 800; font-size: 13px;">${settings.bankName}</td>
                              </tr>
                              <tr>
                                <td align="left" style="padding-bottom: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">Account Number</td>
                                <td align="left" style="padding-bottom: 12px; color: #0f172a; font-weight: 800; font-size: 13px;">${settings.accountNumber}</td>
                              </tr>
                              <tr>
                                <td align="left" style="color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px;">Account Holder</td>
                                <td align="left" style="color: #0f172a; font-weight: 800; font-size: 13px;">${settings.accountHolder}</td>
                              </tr>
                            </table>

                            ${settings.bankInstructions ? `
                            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #bae6fd;">
                              <div style="color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px; margin-bottom: 4px;">Payment Instructions</div>
                              <div style="font-size: 12px; color: #0c4a6e; font-weight: 600; line-height: 1.5;">${settings.bankInstructions}</div>
                            </div>
                            ` : ''}
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <!-- Footer Message -->
                      <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; margin-bottom: 0; text-align: center; line-height: 1.6;">
                        Our compliance team will verify your documents shortly. Full access to the platform will be granted once the payment is cleared.
                      </p>

                    </td>
                  </tr>
                </table>

                <!-- Bottom Copyright -->
                <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                  &copy; ${new Date().getFullYear()} MahallasPlus Platform. All rights reserved.
                </div>
              </td>
            </tr>
          </table>
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
