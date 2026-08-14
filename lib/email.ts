// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLowStockEmail(
  to: string,
  productName: string,
  stock: number,
  threshold: number
) {
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject: `⚠️ Low stock: ${productName}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>Low stock alert</h2>
          <p><strong>${productName}</strong> is running low.</p>
          <p>Remaining: <strong>${stock}</strong> (threshold: ${threshold})</p>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend] send failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] unexpected error:", err);
    return false;
  }
}