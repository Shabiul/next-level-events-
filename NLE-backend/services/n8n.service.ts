import "dotenv/config";

export async function postOrderToN8n(order: any) {
  console.log("🚀 Sending booking to n8n");
console.log("Webhook URL:", process.env.N8N_WEBHOOK_URL);
console.log("Payload:", JSON.stringify(order, null, 2));
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return { success: false, skipped: true, reason: "N8N_WEBHOOK_URL not configured" };
  }

  try {
    console.log("Sending order to:", webhookUrl);
  console.log("Order:", JSON.stringify(order));
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

  console.log("n8n response status:", response.status);
  const text = await response.text();
console.log("n8n response:", text);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`n8n webhook failed with status ${response.status}: ${body}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("n8n webhook failed:", error?.message || error);
    return { success: false, error: error?.message || error };
  }
}
