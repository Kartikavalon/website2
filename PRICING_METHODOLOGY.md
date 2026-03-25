# Zenoway Pricing Model — Methodology & Config Reference

> This document explains how the pricing calculator works, what every config value means,
> and how to adjust rates. All editable values live in the `CONFIG` block at the top of
> `zenoway-pricing.html` — no other file needs to change.

---

## 1. Config Values (Quick Reference)

| Variable | Default | What it controls |
|---|---|---|
| `BASE_FIXED_COST` | ₹80 | Fixed charge per trip per vehicle, regardless of distance |
| `RATE_PER_KM` | ₹18 | Variable cost per km on top of the fixed base |
| `SOLO_MULTIPLIER` | 1.4 | Premium for exclusive (solo) rides — 1.4 = 40% more |
| `PEAK_PICKUP_HOUR` | 10 | The most expensive pickup hour (10 = 10:00 AM) |
| `PEAK_DROP_HOUR` | 18 | The most expensive drop hour (18 = 6:00 PM) |
| `PEAK_DISCOUNT_PER_HOUR` | 0.04 | Rate reduction per hour away from peak (4% per hour) |
| `MIN_PEAK_MULTIPLIER` | 0.70 | Floor — can never be cheaper than 70% of standard rate |
| `GST_RATE` | 0.18 | GST applied after all discounts (18%) |
| `PLAN_DISCOUNTS` | 0/5/10/15% | Discounts for monthly/quarterly/half-yearly/yearly plans |

---

## 2. Cost Formula (Per Category, Per Month)

```
Cost per trip = (BASE_FIXED_COST + distance_km × RATE_PER_KM)
                × solo_multiplier
                × peak_multiplier

Monthly cost  = cost_per_trip
                × 2 trips per day   (1 pickup + 1 drop)
                × working_days_per_month
                × number_of_employees

working_days_per_month = days_selected_per_week × 4.33
```

**Example:**
- Distance: 15 km
- Employees: 20
- Shared ride, office at 9 AM (pickup) and 6 PM (drop)
- Working 5 days/week

```
Peak pickup mult @ 9AM (1hr from 10AM peak):  1 - 1×0.04 = 0.96
Peak drop mult   @ 6PM (same as peak 6PM):    1 - 0×0.04 = 1.00
Average peak multiplier = (0.96 + 1.00) / 2  = 0.98

Cost per trip  = (80 + 15×18) × 1.0 × 0.98
               = (80 + 270) × 0.98
               = 350 × 0.98
               = ₹343

Monthly cost   = 343 × 2 × (5×4.33) × 20
               = 343 × 2 × 21.65 × 20
               = ₹296,590  (for all 20 employees)
Per employee   = ₹14,830/mo
```

---

## 3. Peak Hour Pricing Logic

The idea: **peak office hours = highest demand = highest cost for Zenoway to operate**.
Off-peak timings allow Zenoway to optimise fleet usage, so those get a discount.

```
peak_multiplier = 1 - (|actual_hour - peak_hour| × PEAK_DISCOUNT_PER_HOUR)

Capped at minimum: MIN_PEAK_MULTIPLIER (0.70 = 30% max discount)
```

### Pickup examples (PEAK_PICKUP_HOUR = 10):

| Office start | Hours from peak | Multiplier | Effective discount |
|---|---|---|---|
| 10:00 AM | 0h | 1.00× | 0% (peak rate) |
| 9:00 AM | 1h | 0.96× | 4% off |
| 8:00 AM | 2h | 0.92× | 8% off |
| 7:00 AM | 3h | 0.88× | 12% off |
| 6:00 AM | 4h | 0.84× | 16% off |
| 2:00 AM | 8h | 0.70× | 30% off (floor hit) |
| 11:00 AM | 1h | 0.96× | 4% off |
| 12:00 PM | 2h | 0.92× | 8% off |

> The same logic applies to drop timings, calculated against `PEAK_DROP_HOUR`.
> The average of pickup and drop multipliers is used for the monthly estimate.

### To change peak hours:
Change `PEAK_PICKUP_HOUR` and `PEAK_DROP_HOUR` in CONFIG.
For example, if your city's peak is 9 AM, set `PEAK_PICKUP_HOUR: 9`.

---

## 4. Solo vs Shared Travel

| Type | Multiplier | When to use |
|---|---|---|
| Shared | 1.0× | Employee boards a cab with others on the same route |
| Solo | 1.4× (configurable) | Employee gets exclusive vehicle, no co-passengers |

The `SOLO_MULTIPLIER` can be set to any value. 1.0 = no premium, 2.0 = double price.

---

## 5. Plan Discounts

Discounts apply to the total monthly base before GST:

| Plan | Duration | Discount | Config key |
|---|---|---|---|
| Monthly | 1 month | 0% | `PLAN_DISCOUNTS[1]` |
| Quarterly | 3 months | 5% | `PLAN_DISCOUNTS[3]` |
| Half-Yearly | 6 months | 10% | `PLAN_DISCOUNTS[6]` |
| Yearly | 12 months | 15% | `PLAN_DISCOUNTS[12]` |

To change a plan discount, edit the value in CONFIG. For example, to give 20% yearly:
```js
PLAN_DISCOUNTS: { 1: 0, 3: 0.05, 6: 0.10, 12: 0.20 }
```

---

## 6. Coupon Codes

Each coupon in CONFIG has:
- `discount`: fraction (0.10 = 10%)
- `desc`: message shown to the user
- `validPlans`: array of plan months the coupon is valid for

```js
COUPONS: {
  'ZENO10': { discount: 0.10, desc: '10% off for first 3-month plan!', validPlans: [3] },
}
```

Coupon discount **stacks additively** with plan discount (capped at 40% total).
For example: Quarterly (5%) + ZENO10 (10%) = 15% total.

To add a new coupon:
```js
'NEWCODE': { discount: 0.15, desc: '15% off for yearly plan!', validPlans: [12] },
```

---

## 7. GST Calculation

GST is applied **after** all discounts on the monthly amount:

```
net_monthly = base_monthly × (1 - total_discount_fraction)
gst_amount  = net_monthly × GST_RATE
total_payable = net_monthly + gst_amount
```

Currently GST_RATE = 0.18 (18%). Update this if the rate changes.

---

## 8. Email Submission (API)

The contact form POSTs to `/api/send-quote.js` (Vercel serverless function).

**Required setup:**
1. Create a free account at [resend.com](https://resend.com)
2. Get your API key from the Resend dashboard
3. Add it to Vercel: **Settings → Environment Variables → `RESEND_API_KEY`**
4. Verify `zenoway.co.in` domain in Resend (or use `onboarding@resend.dev` for testing)

If the API call fails (e.g. not deployed yet), the form falls back to opening the user's
email client with all details pre-filled — so no leads are ever lost.

---

## 9. Adding Your Logo

In `zenoway-pricing.html`, find this comment in the header:
```html
<!-- TO USE YOUR LOGO:
  Replace the fallback block below with:
  <img src="logo.png" class="header-logo-img" alt="Zenoway">
-->
```
Put `logo.png` (your 1002×340 image) in the same folder as the HTML file,
then replace the fallback `<div>` with the `<img>` tag shown above.

---

## 10. Repo File Structure

```
/
├── index.html              ← Main HR portal (rename from hr_portal.html)
├── zenoway-pricing.html    ← This pricing calculator
├── logo.png                ← Your logo (1002×340)
├── vercel.json             ← (optional) routing config
└── api/
    └── send-quote.js       ← Serverless email function
```

---

*Last updated: March 2026 · Zenoway Transport Services*
