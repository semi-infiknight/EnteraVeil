type Section = { id: string; title: string; body: React.ReactNode }

export const PRIVACY_FALLBACK: Section[] = [
  {
    id: 'overview',
    title: 'Overview',
    body: (
      <>
        <p>
          EnteraVeil cares about your privacy. This policy explains what data we
          collect when you shop with us, why we collect it, and how to ask us to
          delete it.
        </p>
        <p>
          By using EnteraVeil you agree to the practices described below.
        </p>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'Data we collect',
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Order info — name, email, phone, shipping address, items.</li>
        <li>Payment info handled by Razorpay (we never see your card data).</li>
        <li>Account login email + hashed password (if you create an account).</li>
        <li>Anonymous analytics — page views, device class, country.</li>
      </ul>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use it',
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Process orders and arrange shipping.</li>
        <li>Send transactional emails about your order.</li>
        <li>Reply when you contact support.</li>
        <li>Improve the site and the drop assortment.</li>
      </ul>
    ),
  },
  {
    id: 'who-we-share-with',
    title: 'Who we share with',
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Razorpay — for payment processing.</li>
        <li>Delivery courier — to ship your order.</li>
        <li>Resend — to send transactional emails.</li>
        <li>Nobody else. We never sell your data.</li>
      </ul>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <p>
        Email <a className="text-action-primary underline" href="mailto:hello@enteraveil.local">hello@enteraveil.local</a>
        {' '}to request a copy of the data we have on you, fix anything wrong, or
        ask us to delete your account.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        EnteraVeil · Bangalore, KA, India · hello@enteraveil.local
      </p>
    ),
  },
]

export const TERMS_FALLBACK: Section[] = [
  {
    id: 'use',
    title: 'Use of the site',
    body: (
      <p>
        You may browse, sign up, and place orders on EnteraVeil for personal,
        non-commercial use. Don&apos;t scrape, resell, or impersonate us — we
        reserve the right to refuse service.
      </p>
    ),
  },
  {
    id: 'orders',
    title: 'Orders',
    body: (
      <p>
        Placing an order is an offer to buy at the price displayed. We confirm
        once payment clears. Prices are in INR and include GST. We can cancel
        any order if a pricing error is obvious or stock is genuinely missing —
        we&apos;ll refund in full.
      </p>
    ),
  },
  {
    id: 'shipping-returns',
    title: 'Shipping & returns',
    body: (
      <p>
        See <a className="text-action-primary underline" href="/in/faq#orders">FAQ — Orders & shipping</a> and
        {' '}<a className="text-action-primary underline" href="/in/faq#returns">Returns & refunds</a> for the live policy.
      </p>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    body: (
      <p>
        All graphics, photography, copy and the EnteraVeil wordmark are ours.
        Don&apos;t print them on your own merch. We&apos;ll take it personally.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    body: (
      <p>
        We&apos;re a small brand, not a financial institution. Our liability is
        limited to the amount you paid for the affected order.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes',
    body: (
      <p>
        We may update these terms; the latest version always lives on this page.
      </p>
    ),
  },
]

export function PolicyFallback({
  sections,
  title,
  eyebrow,
}: {
  sections: Section[]
  title: React.ReactNode
  eyebrow: string
}) {
  return (
    <>
      <span className="ev-eyebrow mt-2 block text-action-primary">{eyebrow}</span>
      <h1 className="ev-display mt-4 text-4xl text-basic-primary small:text-5xl medium:text-6xl">
        {title}
      </h1>
      <div className="mt-8 space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="ev-display text-2xl text-basic-primary small:text-3xl">
              {s.title}
            </h2>
            <div className="prose mt-3 max-w-none text-secondary [&_a]:text-action-primary [&_p]:mt-3 [&_p:first-child]:mt-0">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
