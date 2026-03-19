# Zenoway Email Setup Guide

## Problem Fixed
✅ `zenoway.co.in` now works (previously needed `/index.html`)
✅ Contact form now sends real emails

## What Changed
- Added `vercel.json` for Vercel routing configuration
- Added `/api/send-email.js` endpoint to handle form submissions
- Updated contact form to send emails (previously just showed success message)

---

## Setup Instructions (5 minutes)

### Step 1: Sign Up for Resend (Free)
1. Go to https://resend.com
2. Click "Sign Up" (no credit card required for free tier)
3. Verify your email
4. Go to API Keys section
5. Copy your API key

### Step 2: Add Environment Variables to Vercel
1. Go to https://vercel.com/dashboard
2. Select your project (website2)
3. Click "Settings" → "Environment Variables"
4. Add two variables:
   - **Name:** `RESEND_API_KEY`
     **Value:** `re_xxxxxxxxxxxxx` (your API key from Step 1)
   - **Name:** `CONTACT_EMAIL`
     **Value:** `Onboard@mm.zenoway.co.in` (or your preferred email)
5. Click "Save"

### Step 3: Redeploy
1. In Vercel dashboard, click "Deployments"
2. Click the three dots next to the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

### Step 4: Test It
1. Go to `zenoway.co.in/contact.html` (or just `zenoway.co.in`)
2. Fill out the form
3. Click "Send enquiry"
4. You should receive an email at `Onboard@mm.zenoway.co.in`
5. The user should get a confirmation email at their provided address

---

## What Happens When Form is Submitted

### User receives:
- Confirmation email with expected next steps
- "Thank you" message on the website

### You receive:
- Full quote request details at `Onboard@mm.zenoway.co.in`
- Original quote form submission

---

## Troubleshooting

**"Failed to send email" message?**
- Check that environment variables are set in Vercel
- Verify Vercel has redeployed (look at deployment time)
- Check your Resend API key is correct

**Not receiving emails?**
- Add `noreply@zenoway.co.in` to your email contacts (Resend uses this sender)
- Check spam/junk folder
- Verify CONTACT_EMAIL environment variable

**Form still not working?**
- Open browser DevTools (F12)
- Go to Console tab
- Check for error messages
- Try again and look for detailed error logs

---

## File Structure Added
```
website2/
├── vercel.json (NEW)
├── api/
│   └── send-email.js (NEW)
├── .env.example (reference only)
└── contact.html (UPDATED)
```

---

## Costs
- **Vercel:** Free tier (unlimited API calls)
- **Resend:** Free tier (100 emails/day)
  - Upgrade to paid only if you need more than 100 emails/day

---

## Questions?
- Resend support: https://resend.com/docs
- Vercel docs: https://vercel.com/docs
