// Programmatic interactivity probe — fail loudly if hydration is dead.
// Run: node scripts/hydration-probe.mjs <url>
// Default: http://localhost:8000/in

import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'

const URL = process.argv[2] ?? 'http://localhost:8000/in'

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})
const page = await ctx.newPage()

const events = []
page.on('pageerror', (e) => events.push(`PAGEERROR: ${e.message}`))
page.on('console', (m) => {
  const t = m.type()
  if (t === 'error' || t === 'warning') events.push(`${t.toUpperCase()}: ${m.text()}`)
})
page.on('requestfailed', (r) =>
  events.push(`REQFAIL: ${r.url()} -- ${r.failure()?.errorText}`)
)
page.on('response', (r) => {
  if (r.status() >= 400) events.push(`HTTP ${r.status()}: ${r.url()}`)
})

console.log(`→ ${URL} (390×844 mobile)`)
try {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
} catch (e) {
  console.log('goto error:', e.message)
}

// Give hydration a moment
await page.waitForTimeout(2500)

// Snapshot interactive surfaces
const probe = await page.evaluate(() => {
  const r = {}
  r.hamburger = !!document.querySelector('[data-testid="mobile-menu"]')
  r.cartBottom = !!document.querySelector('[data-testid="mobile-bottom-nav"]')
  r.profileBtn = !!document.querySelector('[data-testid="profile-button"]')
  r.footerAccordions = document.querySelectorAll(
    'footer button[aria-expanded], footer [data-radix-accordion-trigger]'
  ).length
  r.allButtons = document.querySelectorAll('button').length
  r.hasReactRoot = !!document.querySelector('[data-reactroot], #__next, [data-nextjs-router]')
  return r
})
console.log('PROBE:', JSON.stringify(probe, null, 2))

// Attempt a tap on the hamburger — does ANY state mutate?
let hamburgerWorks = null
try {
  await page.tap('[data-testid="mobile-menu"]', { timeout: 5000 })
  await page.waitForTimeout(800)
  hamburgerWorks = await page.evaluate(() => {
    // Radix Dialog inserts content on open; check for role=dialog
    return !!document.querySelector('[role="dialog"]:not([data-state="closed"])')
  })
} catch (e) {
  hamburgerWorks = `tap-error: ${e.message}`
}
console.log('HAMBURGER opens dialog:', hamburgerWorks)

// Try a footer accordion if any exist
let footerAccordionWorks = null
try {
  const trigger = await page
    .locator('footer button[aria-expanded="false"]')
    .first()
  if (await trigger.count()) {
    await trigger.tap({ timeout: 5000 })
    await page.waitForTimeout(500)
    footerAccordionWorks = await page.evaluate(() => {
      const t = document.querySelector('footer button[aria-expanded="true"]')
      return !!t
    })
  } else {
    footerAccordionWorks = 'no-trigger-found'
  }
} catch (e) {
  footerAccordionWorks = `tap-error: ${e.message}`
}
console.log('FOOTER ACCORDION expands:', footerAccordionWorks)

console.log('\n=== EVENTS ===')
const printed = events.slice(0, 40)
for (const e of printed) console.log(e)
if (events.length > 40) console.log(`... +${events.length - 40} more`)
if (events.length === 0) console.log('(no errors / warnings / 4xx-5xx)')

await browser.close()
