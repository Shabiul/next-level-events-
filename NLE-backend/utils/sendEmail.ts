import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.warn("⚠️ Email transporter configuration warning:", error.message);
    } else {
      console.log("✅ Email server is ready");
    }
  });
} else {
  console.log("ℹ️ Email notifications skipped (EMAIL_USER/EMAIL_PASS not configured in .env)");
}

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter || !process.env.EMAIL_USER) {
    console.log(`[Email Mock] Skipping sending email to ${to}: ${subject}`);
    return {
      success: true,
      mocked: true,
    };
  }

  try {
    const mailOptions = {
      from: `"TheDecorParty" <${process.env.EMAIL_USER}>`,
      to,
      replyTo: process.env.EMAIL_USER,
      subject,
      text: `
Thank you for choosing TheDecorParty.

Your booking has been received successfully.

If you have any questions, simply reply to this email.

Regards,
TheDecorParty Team
`,
      html,
      headers: {
        "X-Mailer": "TheDecorParty",
      },
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("❌ Email sending failed:", error?.message || error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export default sendEmail;
