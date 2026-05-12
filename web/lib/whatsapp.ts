import axios from "axios";
import { smartUpload } from "./upload";

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Downloads a media file from WhatsApp and uploads it to our storage.
 */
export async function downloadWhatsAppMedia(mediaId: string, folder: string) {
  try {
    if (!WHATSAPP_ACCESS_TOKEN) {
      console.warn("WHATSAPP_ACCESS_TOKEN not set, skipping media download.");
      return null;
    }

    // 1. Get media URL from Meta API
    const response = await axios.get(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
    });

    const mediaUrl = response.data.url;
    const mimeType = response.data.mime_type;
    const extension = mimeType.split("/")[1] || "jpg";

    // 2. Download the actual binary data
    const mediaResponse = await axios.get(mediaUrl, {
      headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
      responseType: "arraybuffer"
    });

    const buffer = Buffer.from(mediaResponse.data);
    const filename = `wa-${Date.now()}-${mediaId}.${extension}`;

    // 3. Upload to our storage
    return await smartUpload(buffer, folder, filename);
  } catch (error) {
    console.error("Error downloading WhatsApp media:", error);
    return null;
  }
}

/**
 * Sends a WhatsApp message (text or template) to a user.
 */
export async function sendWhatsAppMessage(to: string, content: any) {
  try {
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!WHATSAPP_ACCESS_TOKEN || !phoneId) return null;

    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        ...content
      },
      {
        headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return null;
  }
}
