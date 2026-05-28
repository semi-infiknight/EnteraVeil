# EnteraVeil — Admin Guide

For the non-technical operator running the store day-to-day.

There are two admin panels you'll touch:

- **Medusa** at `https://api.<your-domain>/app` — products, orders, inventory, money.
- **Strapi** at `https://cms.<your-domain>/admin` — homepage, About, blog, lookbook, legal pages.

Bookmark both.

---

## Logging in

### Medusa
1. Go to `https://api.<your-domain>/app`.
2. Enter your email + password (the values your developer set up).
3. If you forgot the password, ask your developer to run:
   `docker compose exec medusa node_modules/.bin/medusa user --email you@enteraveil.com --password <new>`

### Strapi
1. Go to `https://cms.<your-domain>/admin`.
2. Same — email + password set during first-run setup.
3. Password reset is in the upper-right user menu → Profile.

---

## Adding a product

Medusa admin → **Products** → "+ Create product" (top-right).

1. **General**: Title (e.g. "Veil Tee — Iridescent"), Description, Handle (URL slug; auto-derived from title — fine to leave).
2. **Status**: Set to **Draft** while you're working, **Published** when ready.
3. **Organize**:
   - **Collection** — group with other products (e.g. "Drop 01").
   - **Categories** — tags like "Tees", "Hoodies".
4. **Attributes**: Material, Country of origin if relevant.
5. **Variants**: This is where sizes/colors live.
   - Add an **option** named "Size" with values "S, M, L, XL".
   - Optionally add an **option** named "Color" with values.
   - Save. Medusa creates one variant per combination (e.g. S×Black, M×Black, …).
   - Click each variant to set:
     - **Price** in INR (whole rupees — e.g. type `1499` for ₹1499)
     - **Inventory quantity** at the Bangalore Warehouse stock location
     - **SKU** (your internal code, e.g. `VT-IRI-M-BLK`)
6. **Media**: drag/drop product photos. First image is the thumbnail. Up to 6 images recommended.
7. **Thumbnail**: separately set the "featured" image used in listing tiles.
8. Save → flip status to **Published** → product appears on the storefront within a minute.

### Image hygiene
- Square or 4:5 portrait, minimum 1200×1500 px.
- White or neutral background for catalog shots; lookbook-style shots go in Strapi (see below).
- Compress to under ~600 KB per image before upload (TinyPNG works).

---

## Managing collections

Medusa admin → **Collections** → "+ Create collection".

Name + handle + optional description. Then in any product, set its Collection to this. Use collections to group drops, not categories.

---

## Publishing / unpublishing

- Each product has a Status toggle (Draft / Published).
- Unpublished products are hidden from the storefront but still in Medusa.
- Soft-delete via Status: Draft. Hard-delete via the trash icon — **only do this for genuinely-never-going-back products**, because order history pointing at them breaks.

---

## Fulfilling orders

Medusa admin → **Orders** → click an order.

### Razorpay-paid order flow
1. Status will show **Payment captured** (Razorpay webhook).
2. Tab to **Fulfillments** → "Create fulfillment".
3. Pick the items to ship (usually all). Pick the location (Bangalore Warehouse).
4. Mark fulfilled.
5. Once shipped, click **Mark shipped** and enter the tracking number from your courier. Customer gets an email automatically.

### COD order flow
1. Status will show **Payment awaiting** (we don't capture until cash is collected).
2. Decide whether to ship before or after capture — usually you ship, courier collects cash on delivery, you mark payment captured manually:
   - Order page → **Payments** → "Capture payment" → confirm amount.
3. From there, same as above — fulfill, mark shipped.

> COD is **only** enabled for Bangalore + Raipur for now. If a customer is outside those zones, only Razorpay is offered at checkout.

---

## Refunds and cancellations

- **Cancellation before fulfillment**: order page → top-right menu → Cancel. Refund follows.
- **Refund**: order page → **Payments** → "Refund" → enter amount → confirm. For Razorpay orders this triggers a refund through Razorpay (you'll see it in the Razorpay dashboard too); for COD it's a record-only refund — you handle the actual money return yourself.
- **Partial refund**: same flow with a partial amount.
- **Returns**: Returns tab → "Request return" → select items. When goods arrive, mark as received and process the refund.

Always note the reason in the order Notes section. Future-you and the support team will need it.

---

## COD-specific handling

- Always call the customer to confirm before shipping. Reduces fake orders.
- If the customer refuses delivery, the courier returns the goods. Cancel the order (refund = ₹0 since nothing was captured).
- If the customer takes delivery, **mark the payment captured in Medusa same day** — otherwise revenue reporting is wrong.

---

## Editing the storefront content (Strapi)

Strapi admin → **Content Manager** in the left rail.

### About page
- Content Manager → Single Types → **About**.
- Edit the title, body (rich text), upload a hero image.
- Click **Save**, then **Publish**.
- Storefront updates within ~60 seconds (Next.js revalidates on Strapi's webhook).

### Blog posts
- Content Manager → Collection Types → **Blog post** → "+ Create new entry".
- Title, slug (auto from title — leave it), hero image, body (rich text), author, tags (JSON array, e.g. `["drop", "launch"]`).
- Save + Publish. Visible at `/blog/<slug>`.

### Lookbook
- Same as blog, but at Content Manager → **Lookbook entry**.
- Gallery accepts multiple images.
- `linked_product_skus` is an optional JSON array of SKU strings — your developer can wire these to product links on the storefront if you want lookbook-to-PDP navigation.

### Homepage sections
- Content Manager → **Homepage section** → "+ Create new entry".
- `type`: pick from hero / featured / lookbook / promo / newsletter.
- `sort_order` is a number; lower = higher up on the page.
- Use sparingly — too many sections makes the homepage slow.

### Legal pages
- Privacy, Terms, Shipping, Refund, Contact. All pre-seeded with placeholders.
- Content Manager → **Legal page** → click to edit body.
- Available at `/legal/<slug>`.

---

## Don't touch list

These are things to leave alone unless you're sure or your developer says so:

- **Medusa → Settings → Regions**. India region is configured exactly the way the shipping rules expect. Changing currency, countries, or payment providers will break checkout.
- **Medusa → Settings → Shipping options**. Three options (Bangalore Standard, Raipur Standard, Free Shipping) with specific rules. Modifying these silently breaks free-shipping promo logic.
- **Medusa → Settings → Sales channels**. There's only one (Default). Adding more is a code change.
- **Medusa → Settings → API key management**. The publishable key is wired into the storefront via env var; rotating it requires a redeploy.
- **Strapi → Settings → Users & Permissions Plugin → Roles → Public**. The bootstrap script enables exactly the right permissions on boot. Disabling them silently breaks the storefront.
- **Strapi → Settings → API Tokens**. The `storefront-read` token is hardcoded into the storefront's env. Don't revoke without coordinating a redeploy.
- **`.env.prod` on the server**. Editing this can break the stack in non-obvious ways. Always edit via `vim`, never via the admin UI of either app.

---

## Common questions

**Q: A customer says they paid but the order doesn't show "captured".**
Check Razorpay dashboard for the payment. If it's there but Medusa shows pending, the webhook may have missed. Open the order and try "Capture payment" manually with the Razorpay payment ID from their dashboard.

**Q: How do I add a new shipping city?**
Out of scope for this guide — your developer needs to add a new shipping option in Medusa and a new dropdown value on the storefront. Email them the city name + flat-rate INR amount you want.

**Q: A customer email never arrived.**
Check Resend dashboard (resend.com/emails) for the send log. If "Delivered", it's in their spam folder — ask them to whitelist `orders@<your-domain>`. If "Bounced", the email address is invalid.

**Q: How do I run a promo / discount code?**
Medusa admin → **Discounts** → "+ Create discount". Code, percentage or amount, expiry date, optional product/collection restrictions. Save + activate. Customers enter the code on the cart page.

**Q: Inventory dropped to zero — product still shows on the storefront, why?**
By default Medusa lets you over-sell unless you explicitly set "Manage inventory" on the variant. Open the variant and toggle "Continue selling when out of stock" OFF. From then on, zero inventory = "Sold out" on the PDP.

---

## When to call your developer

- New shipping zones or cities
- New payment provider
- Custom checkout flows (gift cards, B2B, etc.)
- Mass-import of products (CSV)
- Anything in `Settings` that looks like a kill switch
- Repeated webhook failures (Razorpay or Strapi)
- Email deliverability drops below ~95% (Resend dashboard)
