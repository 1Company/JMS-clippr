import nodemailer from "nodemailer";

// SMTP2GO Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.smtp2go.com",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.EMAIL_FROM || "Clippr <noreply@clippr.nl>";

export type BookingEmailData = {
  customerName: string;
  customerEmail: string;
  salonName: string;
  serviceName: string;
  staffName: string;
  date: string; // "maandag 10 februari"
  time: string; // "14:00"
  duration: number;
  price: string; // "€35.00"
  bookingId: string;
  salonSlug: string;
};

export async function sendBookingConfirmation(data: BookingEmailData) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] Skipped: No SMTP credentials configured");
    return { success: false, reason: "no_credentials" };
  }

  try {
    const result = await transporter.sendMail({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Bevestiging: ${data.serviceName} bij ${data.salonName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Afspraak Bevestiging</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">✂️ Afspraak Bevestigd</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 24px;">
      <p style="color: #374151; margin: 0 0 20px;">Hoi ${data.customerName},</p>
      <p style="color: #374151; margin: 0 0 20px;">Je afspraak bij <strong>${data.salonName}</strong> is bevestigd!</p>
      
      <!-- Booking Details Card -->
      <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Behandeling</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Datum</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Tijd</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${data.time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Medewerker</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${data.staffName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Duur</td>
            <td style="padding: 8px 0; text-align: right; color: #111827;">${data.duration} minuten</td>
          </tr>
          <tr style="border-top: 1px solid #E5E7EB;">
            <td style="padding: 12px 0 0; color: #6B7280; font-size: 14px;">Prijs</td>
            <td style="padding: 12px 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #8B5CF6;">${data.price}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #6B7280; font-size: 14px; margin: 0 0 20px;">
        Kun je niet komen? Laat het ons zo snel mogelijk weten.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #F9FAFB; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        Geboekt via Clippr • ${data.salonName}
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("[Email] Sent confirmation to", data.customerEmail, result.messageId);
    return { success: true, id: result.messageId };
  } catch (error) {
    console.error("[Email] Error:", error);
    return { success: false, error };
  }
}

export async function sendBookingReminder(data: BookingEmailData) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] Skipped reminder: No SMTP credentials configured");
    return { success: false, reason: "no_credentials" };
  }

  try {
    const result = await transporter.sendMail({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Herinnering: Morgen ${data.time} - ${data.serviceName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Herinnering</h1>
    </div>
    
    <div style="padding: 24px;">
      <p style="color: #374151; margin: 0 0 20px;">Hoi ${data.customerName},</p>
      <p style="color: #374151; margin: 0 0 20px;">
        Even een herinnering: je hebt <strong>morgen</strong> een afspraak bij ${data.salonName}.
      </p>
      
      <div style="background: #FEF3C7; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>${data.date}</strong> om <strong>${data.time}</strong>
        </p>
        <p style="margin: 8px 0 0; font-size: 16px; color: #111827; font-weight: 600;">
          ${data.serviceName} met ${data.staffName}
        </p>
      </div>
      
      <p style="color: #6B7280; font-size: 14px; margin: 0;">
        Tot morgen! 👋
      </p>
    </div>
    
    <div style="background: #F9FAFB; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        ${data.salonName} • Powered by Clippr
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("[Email] Sent reminder to", data.customerEmail);
    return { success: true, id: result.messageId };
  } catch (error) {
    console.error("[Email] Reminder error:", error);
    return { success: false, error };
  }
}

export async function sendBookingCancellation(data: BookingEmailData & { reason?: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { success: false, reason: "no_credentials" };
  }

  try {
    const result = await transporter.sendMail({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Afspraak geannuleerd - ${data.salonName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    <div style="background: #EF4444; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Afspraak Geannuleerd</h1>
    </div>
    
    <div style="padding: 24px;">
      <p style="color: #374151;">Hoi ${data.customerName},</p>
      <p style="color: #374151;">
        Je afspraak voor <strong>${data.serviceName}</strong> op <strong>${data.date}</strong> om <strong>${data.time}</strong> is geannuleerd.
      </p>
      ${data.reason ? `<p style="color: #6B7280; font-style: italic;">"${data.reason}"</p>` : ""}
      <p style="color: #374151;">
        Je kunt een nieuwe afspraak maken via onze website.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    return { success: true, id: result.messageId };
  } catch (error) {
    console.error("[Email] Cancellation error:", error);
    return { success: false, error };
  }
}

// Verify SMTP connection on startup (optional)
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("[Email] SMTP connection verified");
    return true;
  } catch (error) {
    console.error("[Email] SMTP connection failed:", error);
    return false;
  }
}
