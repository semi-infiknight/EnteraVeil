// Verifies that admin mobile CSS override takes effect at narrow viewport.
import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'

const ORDER_ID = 'order_01KSRA8X79AQ6TFC7RT2ZJXSMP'

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

await page.goto('http://localhost:9000/app/login', { waitUntil: 'networkidle', timeout: 30_000 })
await page.waitForTimeout(2000)
await page.fill('input[name="email"]', 'admin@enteraveil.local')
await page.fill('input[name="password"]', 'devpass123')
await page.click('button[type="submit"]')
await page.waitForTimeout(3000)
await page.goto(`http://localhost:9000/app/orders/${ORDER_ID}`, { waitUntil: 'networkidle', timeout: 30_000 })
await page.waitForTimeout(2000)

// Check desktop computed styles first
const desktopStyle = await page.evaluate(() => {
  const row = document.querySelector('.grid.grid-cols-3.items-center.gap-x-4')
  if (!row) return 'NOT FOUND'
  const cs = window.getComputedStyle(row)
  return { display: cs.display, flexDirection: cs.flexDirection }
})
console.log('Desktop computed style of line-item row:', JSON.stringify(desktopStyle))

// Switch to mobile viewport
await page.setViewportSize({ width: 375, height: 812 })
await page.waitForTimeout(1000)

const mobileStyle = await page.evaluate(() => {
  const row = document.querySelector('.grid.grid-cols-3.items-center.gap-x-4')
  if (!row) return 'NOT FOUND'
  const cs = window.getComputedStyle(row)
  // Also check if style element is present
  const styleEls = document.querySelectorAll('style')
  const ourStyle = [...styleEls].find(s => s.textContent?.includes('EnteraVeil admin'))
  return {
    display: cs.display,
    flexDirection: cs.flexDirection,
    styleTagFound: !!ourStyle,
    styleTagLength: ourStyle?.textContent?.length ?? 0,
  }
})
console.log('Mobile computed style (375px):', JSON.stringify(mobileStyle, null, 2))

// Also check 414px
await page.setViewportSize({ width: 414, height: 896 })
await page.waitForTimeout(500)
const style414 = await page.evaluate(() => {
  const row = document.querySelector('.grid.grid-cols-3.items-center.gap-x-4')
  if (!row) return 'NOT FOUND'
  const cs = window.getComputedStyle(row)
  return { display: cs.display, flexDirection: cs.flexDirection }
})
console.log('414px computed style:', JSON.stringify(style414))

await browser.close()
