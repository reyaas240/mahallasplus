import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for WhatsApp Webhook Verification
 * This is used by Meta to verify that your endpoint is valid.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Check if mode and token are sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return new NextResponse("Bad Request", { status: 400 });
}

import { sharedRegistrationLogic } from "@/app/actions/register";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

/**
 * POST handler for WhatsApp Webhook Events
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const from = message.from;
        const type = message.type;

        // 1. Handle Interactive Flow Replies (nfm_reply)
        if (type === "interactive" && message.interactive?.type === "nfm_reply") {
          const responseJson = JSON.parse(message.interactive.nfm_reply.response_json);
          
          /**
           * Expected Flow response_json structure:
           * { 
           *   full_name: "...", 
           *   email: "...", 
           *   mahalla_name: "...", 
           *   plan_id: "...",
           *   city: "...",
           *   address: "..."
           * }
           */

          const result = await sharedRegistrationLogic({
            fullName: responseJson.full_name,
            email: responseJson.email,
            phone: from,
            mahallaName: responseJson.mahalla_name,
            licensePlanId: responseJson.plan_id,
            city: responseJson.city,
            address: responseJson.address,
            termsAccepted: true, // Implicitly accepted by submitting the flow
          });

          if (result.success) {
            await sendWhatsAppMessage(from, {
              type: "text",
              text: { body: `✅ Thank you! Your registration for "${responseJson.mahalla_name}" has been received.\n\nNext Step: Please send a photo of your Government ID and a Selfie to complete your verification.` }
            });
          } else {
            await sendWhatsAppMessage(from, {
              type: "text",
              text: { body: `❌ Registration failed: ${result.error}. Please try again or contact support.` }
            });
          }
        }

        // 2. Handle Image Messages (ID & Selfie)
        if (type === "image") {
          const mediaId = message.image.id;
          
          // Find the latest pending request for this phone number
          const latestRequest = await prisma.registrationRequest.findFirst({
            where: { phone: from, status: "PENDING" },
            orderBy: { createdAt: "desc" }
          });

          if (latestRequest) {
            const { downloadWhatsAppMedia } = await import("@/lib/whatsapp");
            
            if (!latestRequest.governmentIdUrl) {
              // Save as Government ID
              const url = await downloadWhatsAppMedia(mediaId, "registrations/ids");
              if (url) {
                await prisma.registrationRequest.update({
                  where: { id: latestRequest.id },
                  data: { governmentIdUrl: url }
                });
                await sendWhatsAppMessage(from, {
                  type: "text",
                  text: { body: "📸 Government ID received! Now, please send a Selfie to complete your registration." }
                });
              }
            } else if (!latestRequest.selfieUrl) {
              // Save as Selfie
              const url = await downloadWhatsAppMedia(mediaId, "registrations/selfies");
              if (url) {
                await prisma.registrationRequest.update({
                  where: { id: latestRequest.id },
                  data: { selfieUrl: url }
                });
                await sendWhatsAppMessage(from, {
                  type: "text",
                  text: { body: "✨ Perfect! Your Selfie has been received. Your registration is now complete and under review by our team. We will notify you once approved." }
                });
              }
            } else {
              await sendWhatsAppMessage(from, {
                type: "text",
                text: { body: "You have already uploaded both your ID and Selfie. Our team is currently reviewing your application." }
              });
            }
          } else {
            await sendWhatsAppMessage(from, {
              type: "text",
              text: { body: "I couldn't find a pending registration request for your number. Please type 'Register' to start." }
            });
          }
        }

        // 3. Handle Text Messages (General Queries)
        if (type === "text") {
          const text = message.text.body.toLowerCase();
          if (text.includes("register") || text.includes("start")) {
            // TODO: Trigger the Registration Flow Template
            console.log("Triggering registration flow for", from);
            await sendWhatsAppMessage(from, {
              type: "text",
              text: { body: "👋 Welcome to MahallasPlus! I'll help you register your Mahalla. (Flow Template would be triggered here in production)" }
            });
          }
        }
      }
      
      return NextResponse.json({ status: "success" });
    }
    return new NextResponse("Not Found", { status: 404 });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
