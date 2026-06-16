// Definitive tap verification — waits for element, taps, asserts state.
import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'

const URL = process.argv[2] ?? 'http://localhost:8000/in'

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
page.on('pageerror', e => errors.push(`PAGEERROR: ${e.message}`))
page.on('console', m => {
  if (['error','warning'].includes(m.type()) && !m.text().includes('webpack-hmr'))
    errors.push(`${m.type().toUpperCase()}: ${m.text()}`)
})

console.log(`→ ${URL}`)
await page.goto(URL, { waitUntil: 'load', timeout: 60_000 })

// Wait until hamburger is present AND not disabled
console.log('waiting for mobile-menu...')
await page.waitForFunction(
  () => {
    const el = document.querySelector('[data-testid="mobile-menu"]')
    return el && !el.disabled && el.getAttribute('data-state') !== undefined
  },
  { timeout: 20_000 }
)
console.log('hamburger ready')

// ── Hamburger ──────────────────────────────────────────────────────────────
const stateBefore = await page.$eval('[data-testid="mobile-menu"]', el => el.getAttribute('data-state'))
console.log(`hamburger data-state before tap: "${stateBefore}"`)

await page.tap('[data-testid="mobile-menu"]')
await page.waitForTimeout(800)

const dialogOpen = await page.evaluate(() =>
  !!document.querySelector('[role="dialog"][data-state="open"]')
)
const stateAfter = await page.$eval('[data-testid="mobile-menu"]', el => el.getAttribute('data-state'))
console.log(`hamburger data-state after tap: "${stateAfter}"`)
console.log(`HAMBURGER → dialog opened: ${dialogOpen}`)

// Close dialog
if (dialogOpen) {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
}

// ── Footer accordion ───────────────────────────────────────────────────────
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(400)

const accordions = await page.$$('footer button[aria-expanded]')
console.log(`footer accordion triggers: ${accordions.length}`)

if (accordions.length > 0) {
  const acc = accordions[0]
  const ab = await acc.evaluate(el => el.getAttribute('data-state'))
  await acc.tap()
  await page.waitForTimeout(500)
  const aa = await acc.evaluate(el => el.getAttribute('data-state'))
  console.log(`ACCORDION: "${ab}" → "${aa}" (expanded: ${aa === 'open'})`)
}

// ── Search button ──────────────────────────────────────────────────────────
const searchBtn = await page.$('[data-testid="search-button"]')
if (searchBtn) {
  await searchBtn.tap()
  await page.waitForTimeout(500)
  const searchOpen = await page.evaluate(() =>
    !!document.querySelector('[data-testid="search-container"], [role="combobox"], input[type="search"]')
  )
  console.log(`SEARCH → panel opened: ${searchOpen}`)
  await page.keyboard.press('Escape')
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log('\n--- non-HMR errors ---')
console.log(errors.join('\n') || '(none)')

await browser.close()
