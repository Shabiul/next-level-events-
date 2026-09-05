import "dotenv/config";

/**
 * Forwards a booking to the optional n8n automation webhook. Non-fatal: any
 * failure is logged and swallowed so it never blocks order confirmation.
 */
export async function postOrderToN8n(order: any) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false, skipped: true, reason: "N8N_WEBHOOK_URL not configured" };
  }

  const ref = order?.orderNumber || order?.orderId || "unknown";
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`status ${response.status}: ${body.slice(0, 200)}`);
    }

    console.log(`[n8n] forwarded booking ${ref}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[n8n] webhook failed for booking ${ref}:`, error?.message || error);
    return { success: false, error: error?.message || error };
  }
}
