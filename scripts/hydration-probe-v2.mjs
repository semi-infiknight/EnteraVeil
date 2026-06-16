// v2: tests hamburger + footer accordion independently (closes dialog before accordion)
import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'

const LOCAL = 'http://localhost:8000/in'
const TUNNEL = process.argv[2] ?? LOCAL

async function probe(url) {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })
  const page = await ctx.newPage()

  const errors = []
  page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
  page.on('console', (m) => {
    const t = m.type()
    if (t === 'error' || t === 'warning') errors.push(`${t.toUpperCase()}: ${m.text()}`)
  })
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`)
  })

  console.log(`\n=== PROBING ${url} ===`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
  await page.waitForTimeout(2000)

  // ── TEST 1: hamburger ────────────────────────────────────────────────────
  const hamburger = await page.$('[data-testid="mobile-menu"]')
  if (!hamburger) { console.log('HAMBURGER: NOT FOUND'); await browser.close(); return }

  const hamburgerVisible = await hamburger.isVisible()
  console.log('HAMBURGER visible:', hamburgerVisible)

  await hamburger.tap()
  await page.waitForTimeout(600)
  const dialogOpen = await page.evaluate(() =>
    !!document.querySelector('[role="dialog"][data-state="open"]')
  )
  console.log('HAMBURGER tap → dialog open:', dialogOpen)

  // Close the dialog before testing footer
  if (dialogOpen) {
    const closeBtn = await page.$('[role="dialog"] button[aria-label*="Close" i], [role="dialog"] [data-testid*="close" i]')
    if (closeBtn) {
      await closeBtn.tap()
    } else {
      await page.keyboard.press('Escape')
    }
    await page.waitForTimeout(500)
  }

  // ── TEST 2: footer accordion ─────────────────────────────────────────────
  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(500)

  const accordionTriggers = await page.$$('footer button[aria-expanded]')
  console.log('FOOTER accordion triggers found:', accordionTriggers.length)

  if (accordionTriggers.length > 0) {
    const first = accordionTriggers[0]
    const stateBefore = await first.evaluate((el) => el.getAttribute('data-state'))
    const expandedBefore = await first.evaluate((el) => el.getAttribute('aria-expanded'))
    console.log(`  [0] data-state="${stateBefore}" aria-expanded="${expandedBefore}"`)

    await first.tap()
    await page.waitForTimeout(400)

    const stateAfter = await first.evaluate((el) => el.getAttribute('data-state'))
    const expandedAfter = await first.evaluate((el) => el.getAttribute('aria-expanded'))
    console.log(`  After tap: data-state="${stateAfter}" aria-expanded="${expandedAfter}"`)
    console.log('ACCORDION expanded:', stateAfter === 'open' || expandedAfter === 'true')
  }

  // ── TEST 3: check each interactive surface at once ────────────────────────
  const summary = await page.evaluate(() => {
    return {
      buttons: document.querySelectorAll('button').length,
      links: document.querySelectorAll('a').length,
      dialogs: document.querySelectorAll('[role="dialog"]').length,
      hamburger: !!document.querySelector('[data-testid="mobile-menu"]'),
      mobileNav: !!document.querySelector('[data-testid="mobile-bottom-nav"]'),
    }
  })
  console.log('DOM summary:', JSON.stringify(summary))

  // ── ERRORS ────────────────────────────────────────────────────────────────
  console.log('\n--- console errors/warnings ---')
  const relevant = errors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('strapi') &&
    !e.includes('ECONNREFUSED') &&
    !e.includes('1337')
  )
  console.log(relevant.join('\n') || '(none)')

  await browser.close()
}

await probe(LOCAL)
if (TUNNEL !== LOCAL) await probe(TUNNEL)
