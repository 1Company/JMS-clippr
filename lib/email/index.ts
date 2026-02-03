// SMTP2GO API - https://www.smtp2go.com/docs/api/

const SMTP2GO_API_URL = "https://api.smtp2go.com/v3/email/send";
const FROM_EMAIL = process.env.EMAIL_FROM || "Clippr <noreply@clippr.nl>";

export type BookingEmailData = {
  customerName: string;
  customerEmail: string;
  salonName: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  duration: number;
  price: string;
  bookingId: string;
  salonSlug: string;
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP2GO_API_KEY) {
    console.log("[Email] Skipped: No SMTP2GO_API_KEY configured");
    return { success: false, reason: "no_api_key" };
  }

  try {
    const response = await fetch(SMTP2GO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.SMTP2GO_API_KEY,
        to: [to],
        sender: FROM_EMAIL,
        subject,
        html_body: html,
      }),
    });

    const result = await response.json();

    if (result.data?.succeeded > 0) {
      console.log("[Email] Sent to", to);
      return { success: true, id: result.request_id };
    } else {
      console.error("[Email] Failed:", result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error("[Email] Exception:", error);
    return { success: false, error };
  }
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">✂️ Afspraak Bevestigd</h1>
    </div>
    
    <div style="padding: 24px;">
      <p style="color: #374151; margin: 0 0 20px;">Hoi ${data.customerName},</p>
      <p style="color: #374151; margin: 0 0 20px;">Je afspraak bij <strong>${data.salonName}</strong> is bevestigd!</p>
      
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
      
      <p style="color: #6B7280; font-size: 14px; margin: 0;">
        Kun je niet komen? Laat het ons zo snel mogelijk weten.
      </p>
    </div>
    
    <div style="background: #F9FAFB; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        Geboekt via Clippr • ${data.salonName}
      </p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail(
    data.customerEmail,
    `Bevestiging: ${data.serviceName} bij ${data.salonName}`,
    html
  );
}

export async function sendBookingReminder(data: BookingEmailData) {
  const html = `
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
      
      <p style="color: #6B7280; font-size: 14px; margin: 0;">Tot morgen! 👋</p>
    </div>
    
    <div style="background: #F9FAFB; padding: 16px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">${data.salonName} • Powered by Clippr</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail(
    data.customerEmail,
    `Herinnering: Morgen ${data.time} - ${data.serviceName}`,
    html
  );
}

export async function sendBookingCancellation(data: BookingEmailData & { reason?: string }) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
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
      <p style="color: #374151;">Je kunt een nieuwe afspraak maken via onze website.</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail(
    data.customerEmail,
    `Afspraak geannuleerd - ${data.salonName}`,
    html
  );
}
