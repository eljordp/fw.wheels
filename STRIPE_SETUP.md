# Stripe Setup — FW Wheels

This is the one-time setup so the site can take real card payments. Takes ~15 minutes total.

## 1. Create your Stripe account (5 min)

Go to **https://stripe.com** → Click **Start now** → Create an account with your email.

Enter business info:
- Business name: **FW Wheels LLC** (or whatever your registered name is)
- Industry: **Auto parts and accessories**
- Website: **https://fw-wheels.vercel.app**

## 2. Add your bank info (5 min)

Once you're in the Stripe Dashboard:
- Click **Activate payments** (top right)
- Add your bank account info (routing + account number)
- Add your SSN or EIN for tax purposes

Stripe deposits to that bank every 2 days automatically.

## 3. Turn on Stripe Tax (2 min)

This is the magic that handles sales tax automatically based on the customer's zip code (Stockton 9%, Bay Area higher, out-of-state may be 0%).

- In Dashboard, go to **Settings** → **Tax** (or search "Tax" in the top bar)
- Click **Activate Stripe Tax**
- Select **California** as your origin address
- Enter your business address
- Stripe will figure out the rest

Cost: 0.5% per transaction on top of normal fees (well worth not having to lookup tax rates).

## 4. Get your API keys (2 min)

- In Dashboard, top right, click your business name → **Developers** → **API keys**
- You'll see two keys:
  - **Publishable key** (starts with `pk_live_...`) — safe to share
  - **Secret key** (starts with `sk_live_...`) — KEEP THIS PRIVATE, never paste in chat or email

## 5. Add the secret key to the website (2 min)

Tell JP your Secret Key — he'll paste it into Vercel as an environment variable named `STRIPE_SECRET_KEY`. After that, the site will be live and taking real payments.

**OR** if you want to do it yourself:
1. Log into **https://vercel.com** with JP's account
2. Open the **fw-wheels** project
3. Settings → Environment Variables
4. Add a new variable:
   - Name: `STRIPE_SECRET_KEY`
   - Value: paste your `sk_live_...` key
5. Redeploy (Deployments tab → click latest deployment → Redeploy)

## Done. Test it:

- Open https://fw-wheels.vercel.app
- Add a wheel to cart
- Click Checkout
- Use a real card to make a $1 test purchase
- Refund yourself from the Stripe Dashboard

## Fees

- **2.9% + 30¢** per card transaction
- **+0.5%** for Stripe Tax (if you use it)
- That's it. No monthly fee, no setup fee.

Example: $1,000 sale = $29.30 fee → you net $970.70 (or $965.70 with Stripe Tax)

## Support

If anything goes wrong:
- Stripe Support: in the dashboard, click **Help** in the bottom left
- Site issues: hit up JP

---

After setup, you'll get text/email notifications for every order with the shipping address, customer info, and payment confirmation. Just need to ship the wheels.
