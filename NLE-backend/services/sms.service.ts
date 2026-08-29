import "dotenv/config";

/**
 * Pluggable SMS sender. The OTP lifecycle (generation, hashing, TTL,
 * verification, throttling) is fully server-enforced in otpRoutes -- this file
 * only handles DELIVERY. Set SMS_PROVIDER + its credentials to send real texts;
 * with none configured it logs the message (dev only) so the flow is testable.
 *
 * Supported SMS_PROVIDER values: "twilio" | "msg91" | "fast2sms".
 */

const provider = (process.env.SMS_PROVIDER || "").toLowerCase();
const isProd = process.env.NODE_ENV === "production";

export interface SmsResult {
  success: boolean;
  mocked?: boolean;
  id?: string;
  error?: string;
}

async function sendViaTwilio(to: string, body: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { success: false, error: "Twilio credentials missing" };

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });
  const json: any = await res.json().catch(() => ({}));
  return res.ok ? { success: true, id: json.sid } : { success: false, error: json.message || `HTTP ${res.status}` };
}

async function sendViaMsg91(to: string, body: string): Promise<SmsResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const sender = process.env.MSG91_SENDER_ID || "TDPRTY";
  if (!authKey) return { success: false, error: "MSG91_AUTH_KEY missing" };

  const res = await fetch("https://api.msg91.com/api/v2/sendsms", {
    method: "POST",
    headers: { authkey: authKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      route: "4",
      country: "91",
      sms: [{ message: body, to: [to.replace(/^\+/, "")] }],
    }),
  });
  const json: any = await res.json().catch(() => ({}));
  return json?.type === "success" ? { success: true, id: json.request_id } : { success: false, error: json?.message || `HTTP ${res.status}` };
}

async function sendViaFast2Sms(to: string, body: string): Promise<SmsResult> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return { success: false, error: "FAST2SMS_API_KEY missing" };

  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: { authorization: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ route: "q", message: body, numbers: to.replace(/^\+91/, "").replace(/^\+/, "") }),
  });
  const json: any = await res.json().catch(() => ({}));
  return json?.return ? { success: true, id: String(json?.request_id || "") } : { success: false, error: json?.message || `HTTP ${res.status}` };
}

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  try {
    if (provider === "twilio") return await sendViaTwilio(to, message);
    if (provider === "msg91") return await sendViaMsg91(to, message);
    if (provider === "fast2sms") return await sendViaFast2Sms(to, message);

    if (isProd) {
      console.error("[sms] No SMS_PROVIDER configured in production -- cannot deliver OTP.");
      return { success: false, error: "SMS provider not configured" };
    }
    console.log(`[sms:mock] to=${to} :: ${message}`);
    return { success: true, mocked: true };
  } catch (err: any) {
    console.error("[sms] send failed:", err?.message || err);
    return { success: false, error: err?.message || "SMS send failed" };
  }
}
