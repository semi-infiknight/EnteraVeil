// Captures admin order detail HTML at mobile viewport
// and extracts CSS class names for the line item rows
import { chromium } from '../node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs'

const ORDER_ID = process.argv[2] ?? 'order_01KSRA8X79AQ6TFC7RT2ZJXSMP'
const EMAIL = 'admin@enteraveil.local'
const PASSWORD = 'devpass123'
const ADMIN_URL = 'http://localhost:9000'

const browser = await chromium.launch({ headless: true })

// First: desktop context to log in and get session cookie
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

// Navigate to admin and log in
await page.goto(`${ADMIN_URL}/app/login`, { waitUntil: 'networkidle', timeout: 30_000 })
await page.waitForTimeout(2000)

// Fill login form
try {
  await page.fill('input[type="email"], input[name="email"]', EMAIL)
  await page.fill('input[type="password"], input[name="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)
  console.log('Login attempted. Current URL:', page.url())
} catch (e) {
  console.log('Login error:', e.message)
}

// Navigate to order detail
await page.goto(`${ADMIN_URL}/app/orders/${ORDER_ID}`, { waitUntil: 'networkidle', timeout: 30_000 })
await page.waitForTimeout(3000)

const desktopHTML = await page.content()
console.log('--- Desktop order page URL ---', page.url())
console.log('--- Desktop page has order content ---', desktopHTML.includes('line_item') || desktopHTML.includes('order'))

// Now check mobile viewport on same session
await page.setViewportSize({ width: 375, height: 812 })
await page.waitForTimeout(1000)

// Find the line item row classes
const lineItemInfo = await page.evaluate(() => {
  // Look for elements containing prices (₹)
  const allEls = [...document.querySelectorAll('*')]
  const priceEls = allEls.filter(el => {
    const txt = el.textContent || ''
    return txt.includes('₹') && el.children.length === 0 // leaf nodes with price
  })

  // Find rows that contain multiple price elements
  const rows = []
  priceEls.forEach(el => {
    let parent = el.parentElement
    for (let i = 0; i < 5; i++) {
      if (!parent) break
      const inner = parent.innerHTML
      if ((inner.match(/₹/g) || []).length >= 2) {
        rows.push({
          tag: parent.tagName,
          class: parent.className.slice(0, 120),
          text: parent.textContent?.replace(/\s+/g, ' ').slice(0, 120),
        })
        break
      }
      parent = parent.parentElement
    }
  })
  return rows.slice(0, 5)
})

console.log('\n--- Line item rows with prices ---')
lineItemInfo.forEach((r, i) => console.log(`[${i}]`, JSON.stringify(r)))

// Save the mobile HTML for class name analysis
const mobileHTML = await page.content()
import { writeFileSync } from 'fs'
writeFileSync('/c/Labs/reference-screenshots/admin-order-mobile.html', mobileHTML)
console.log('\n--- Mobile HTML saved (size:', mobileHTML.length, ') ---')

// Extract classes near the order summary/line item section
const summarySection = await page.evaluate(() => {
  const summaryEl = document.querySelector('[data-testid="order-summary"], [class*="order"], [class*="line-item"]')
  if (!summaryEl) return 'NOT FOUND'
  return summaryEl.outerHTML.slice(0, 1000)
})
console.log('Summary section:', summarySection.slice(0, 500))

await browser.close()
