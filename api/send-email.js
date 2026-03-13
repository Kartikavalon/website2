export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, company, phone, message } = req.body;

  // Validation
  if (!name || !email || !company || !phone || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Using Resend (free tier, no credit card needed)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'noreply@zenoway.co.in',
        to: process.env.CONTACT_EMAIL,
        replyTo: email,
        subject: `New Quote Request from ${name}`,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    // Send confirmation email to user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'noreply@zenoway.co.in',
        to: email,
        subject: 'Quote Request Received — Zenoway',
        html: `
          <h2>Thank you, ${name}!</h2>
          <p>We received your quote request. A founder will call you within 4 hours at <strong>${phone}</strong>.</p>
          <p>In the meantime, here's what to expect:</p>
          <ul>
            <li>Custom route plan for your team</li>
            <li>Vehicle recommendations</li>
            <li>Cost breakdown</li>
            <li>Safety protocol overlay</li>
          </ul>
          <p>Questions? Reply to this email or call <a href="tel:+919650463811">+91-9650463811</a></p>
          <p>Best regards,<br>Zenoway Team</p>
        `
      })
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
}
