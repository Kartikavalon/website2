// api/send-quote.js
// ─────────────────────────────────────────────────────────────
// Vercel Serverless Function — sends quote details to Zenoway
//
// SETUP (one-time):
// 1. In your Vercel project dashboard → Settings → Environment Variables
//    Add:  RESEND_API_KEY  =  re_xxxxxxxxxxxxxxxxx
//    (Get a free API key from https://resend.com — free tier = 3000 emails/mo)
//
// 2. In resend.com, verify your sending domain (zenoway.co.in) OR
//    use their free test address: onboarding@resend.dev for the FROM field
//    (update FROM_EMAIL below once your domain is verified)
//
// 3. Deploy — this file goes in the /api/ folder of your repo.
//    Vercel auto-detects it as a serverless function at /api/send-quote
// ─────────────────────────────────────────────────────────────

const TO_EMAIL   = 'kartik.g@zenoway.co.in';
const FROM_EMAIL = 'pricing@zenoway.co.in'; // must be verified in Resend. Use 'onboarding@resend.dev' to test first.
const FROM_NAME  = 'Zenoway Pricing Calculator';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, phone, company,
    shiftStart, shiftEnd, workingDays,
    plan, coupon,
    totalEmployees, monthlyBase, discountPct, gstInclTotal,
    categorySummary,
  } = req.body;

  // Basic validation
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set in environment variables');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // ── Build HTML email body
  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#F0F4F8;margin:0;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)">
    
    <!-- Header -->
    <div style="background:#0B1F3A;padding:24px 32px;display:flex;align-items:center">
      <div style="font-family:'Segoe UI',sans-serif;font-size:22px;font-weight:800;color:#fff">
        Zeno<span style="color:#00BFA5">Way</span>
      </div>
      <div style="margin-left:auto;background:rgba(0,191,165,.15);border:1px solid rgba(0,191,165,.3);color:#00BFA5;font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px">
        NEW PRICING ENQUIRY
      </div>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px">
      <h2 style="margin:0 0 4px;font-size:20px;color:#0B1F3A">New Quote Request</h2>
      <p style="margin:0 0 24px;color:#7A92AD;font-size:13px">Submitted via portal.zenoway.co.in pricing calculator</p>

      <!-- Contact -->
      <div style="background:#F0F4F8;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:10px;font-weight:700;color:#7A92AD;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px">CONTACT DETAILS</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD;width:120px">Name</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A">${name}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD">Email</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A"><a href="mailto:${email}" style="color:#009688">${email}</a></td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD">Phone</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A"><a href="tel:${phone}" style="color:#009688">${phone}</a></td></tr>
          ${company?`<tr><td style="padding:4px 0;font-size:13px;color:#7A92AD">Company</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A">${company}</td></tr>`:''}
        </table>
      </div>

      <!-- Configuration -->
      <div style="background:#F0F4F8;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:10px;font-weight:700;color:#7A92AD;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px">TRANSPORT CONFIGURATION</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD;width:140px">Shift Pickup</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A">${shiftStart}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD">Shift Drop</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A">${shiftEnd}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD">Working Days</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A">${workingDays}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD">Total Employees</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A">${totalEmployees}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD">Plan Selected</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A">${plan}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#7A92AD">Coupon Used</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#0B1F3A">${coupon}</td></tr>
        </table>
      </div>

      <!-- Categories -->
      <div style="background:#F0F4F8;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <div style="font-size:10px;font-weight:700;color:#7A92AD;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px">EMPLOYEE CATEGORIES</div>
        <pre style="font-family:'Courier New',monospace;font-size:12px;color:#3E5676;white-space:pre-wrap;margin:0">${categorySummary}</pre>
      </div>

      <!-- Pricing Summary -->
      <div style="background:#0B1F3A;border-radius:10px;padding:18px 20px">
        <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.8px;text-transform:uppercase;margin-bottom:14px">ESTIMATED PRICING</div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.08)">
          <span style="font-size:13px;color:rgba(255,255,255,.6)">Monthly Base</span>
          <span style="font-size:13px;font-weight:600;color:#fff">${monthlyBase}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.08)">
          <span style="font-size:13px;color:rgba(255,255,255,.6)">Total Discount</span>
          <span style="font-size:13px;font-weight:600;color:#69F0AE">${discountPct}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0 0">
          <span style="font-size:15px;font-weight:700;color:#fff">Total / Month (GST incl.)</span>
          <span style="font-size:18px;font-weight:800;color:#00BFA5">${gstInclTotal}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F0F4F8;padding:16px 32px;text-align:center;font-size:11px;color:#7A92AD">
      Zenoway Transport Services · portal.zenoway.co.in · <a href="mailto:kartik.g@zenoway.co.in" style="color:#009688">kartik.g@zenoway.co.in</a>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text fallback
  const textBody = `
New Pricing Enquiry — Zenoway Calculator

CONTACT
Name:     ${name}
Email:    ${email}
Phone:    ${phone}
Company:  ${company || '—'}

CONFIGURATION
Shift:         ${shiftStart} – ${shiftEnd}
Working days:  ${workingDays}
Employees:     ${totalEmployees}
Plan:          ${plan}
Coupon:        ${coupon}

CATEGORIES
${categorySummary}

PRICING ESTIMATE
Base/month:           ${monthlyBase}
Discount:             ${discountPct}
Total/month (GST):    ${gstInclTotal}
  `.trim();

  try {
    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to:   [TO_EMAIL],
        reply_to: email,
        subject: `New Quote Request – ${company || name} (${totalEmployees} employees, ${plan})`,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email', details: err });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
