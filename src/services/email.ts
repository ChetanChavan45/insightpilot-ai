import { Resend } from "resend";
import { EnrichedCompanyData } from "../types";

export async function sendAuditReportEmail(
  toEmail: string,
  prospectName: string,
  enrichedData: EnrichedCompanyData,
  pdfBuffer: Buffer,
  pdfFileName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  const subject = `Your Personalized Digital Performance Audit: ${enrichedData.companyName}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; margin: 0; padding: 40px 0; color: #f8fafc; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #131c31; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
              <!-- HEADER -->
              <tr>
                <td style="background-color: #0b132b; padding: 30px; border-bottom: 2px solid #3b82f6; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">INSIGHTPILOT AI</h1>
                  <p style="color: #10b981; margin: 5px 0 0 0; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Digital Transformation Engine</p>
                </td>
              </tr>
              <!-- CONTENT -->
              <tr>
                <td style="padding: 40px 30px; background-color: #131c31;">
                  <p style="color: #f8fafc; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">Hello ${prospectName},</p>
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                    Thank you for requesting an intelligence audit for <strong>${enrichedData.companyName}</strong>. Our automated system has thoroughly analyzed your public digital presence, technical SEO parameters, and interface user experience.
                  </p>
                  
                  <!-- AUDIT CARD -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(11, 19, 43, 0.5); border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h4 style="color: #3b82f6; margin-top: 0; margin-bottom: 15px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Audit Synopsis:</h4>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr style="font-size: 13px;">
                            <td style="color: #94a3b8; padding-bottom: 8px;" width="140">Target Domain</td>
                            <td style="color: #f8fafc; font-weight: 600; padding-bottom: 8px;">${enrichedData.website.replace(/^https?:\/\//i, "")}</td>
                          </tr>
                          <tr style="font-size: 13px;">
                            <td style="color: #94a3b8; padding-bottom: 8px;">Selected Industry</td>
                            <td style="color: #f8fafc; font-weight: 600; padding-bottom: 8px;">${enrichedData.industry}</td>
                          </tr>
                          <tr style="font-size: 13px;">
                            <td style="color: #94a3b8; padding-bottom: 8px;">Technical SEO Health</td>
                            <td style="color: #10b981; font-weight: 700; padding-bottom: 8px;">${enrichedData.seoScore}/100</td>
                          </tr>
                          <tr style="font-size: 13px;">
                            <td style="color: #94a3b8;">Strategic Core Focus</td>
                            <td style="color: #f8fafc; font-weight: 600;">Custom AI Integration & Growth Funnels</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                    We have compiled and attached your comprehensive 4-page McKinsey-style PDF consulting audit to this email. You can find detailed technical analyses, UX bottlenecks, and a 90-day recommended strategic roadmap inside the report.
                  </p>

                  <!-- FOOTNOTE -->
                  <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin-bottom: 0;">
                    Please do not hesitate to contact our team to discuss the strategic roadmap or if you'd like us to assist with custom frontend development and automated pipelines.
                  </p>
                </td>
              </tr>
              <!-- FOOTER -->
              <tr>
                <td style="background-color: #0b132b; padding: 20px 30px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
                  <p style="margin: 0 0 5px 0;">Confidential - InsightPilot AI Solutions Agency &copy; ${new Date().getFullYear()}</p>
                  <p style="margin: 0;">Automated Company Growth & AI Opportunity Audits</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (apiKey && apiKey.trim() !== "" && apiKey !== "your-resend-api-key") {
    try {
      console.log(`Sending audit email to ${toEmail} using Resend...`);
      const resend = new Resend(apiKey);
      
      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: toEmail,
        subject: subject,
        html: htmlContent,
        attachments: [
          {
            filename: pdfFileName,
            content: pdfBuffer,
          },
        ],
      });

      if (response.error) {
        console.error("Resend API returned error:", response.error);
        return { success: false, error: JSON.stringify(response.error) };
      }

      console.log(`Email sent successfully. Message ID: ${response.data?.id}`);
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      console.error("Failed to send email via Resend API:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  // Graceful Mock Fallback
  console.log("=========================================");
  console.log("MOCK EMAIL SERVICE TRIGGERED (No API Key Provided)");
  console.log(`To: ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Prospect Name: ${prospectName}`);
  console.log(`Attachment: ${pdfFileName} (${pdfBuffer.length} bytes)`);
  console.log("=========================================");

  return {
    success: true,
    messageId: `mock-email-${Date.now()}`,
  };
}
