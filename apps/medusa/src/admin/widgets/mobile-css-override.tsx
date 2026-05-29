import { defineWidgetConfig } from '@medusajs/admin-sdk'

/**
 * Injects targeted mobile CSS overrides for the Medusa admin.
 *
 * Addresses line-item row overflow on order detail pages at ≤768px.
 * The upstream Medusa admin uses `grid grid-cols-3 items-center gap-x-4`
 * for line-item rows which collapses into unreadable overlap on mobile.
 * We cannot edit @medusajs/dashboard source, so we inject overrides here.
 *
 * Zone: order.details.before — fires on every order detail page, once per render.
 */
const MobileCssOverride = () => {
  return (
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `
/* ── EnteraVeil admin mobile overrides ─────────────────────────────────── */
/* Targeted at ≤768px. Class names sourced from live DOM inspection.       */

@media (max-width: 768px) {

  /* Line-item row: "₹1,099 · 2x · Allocated · ₹2,198"
     Upstream: grid grid-cols-3 items-center gap-x-4
     Fix: stack into column, one piece of info per line.              */
  .grid.grid-cols-3.items-center.gap-x-4 {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.25rem !important;
  }

  /* Each cell in the row gets full width */
  .grid.grid-cols-3.items-center.gap-x-4 > * {
    width: 100% !important;
  }

  /* Order summary totals (Item Subtotal / Shipping / Tax / Order Total):
     Upstream: flex flex-col gap-y-2 px-6 py-4 — this is already column,
     but the inner row label+value is flex-row and overflows narrow screens. */
  .flex.flex-col.gap-y-2.px-6.py-4 > div {
    flex-wrap: wrap !important;
  }

  /* Shipping row in totals: the arrow icon + text sometimes stack badly */
  .flex.flex-col.gap-y-2.px-6.py-4 .flex.items-center.gap-x-2 {
    flex-wrap: wrap !important;
    gap: 0.25rem !important;
  }

  /* Status pill ("Allocated") — prevent it from overflowing line-item row */
  .grid.grid-cols-3.items-center.gap-x-4 [class*="rounded"] {
    max-width: 100% !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* Order list table: prevent horizontal scroll on the orders list page.
     Upstream table uses fixed column widths that overflow at 375px.    */
  [class*="overflow-x-auto"] table,
  .overflow-x-auto table {
    min-width: 0 !important;
    width: 100% !important;
  }

  /* Hide less-critical columns on mobile order list */
  [class*="overflow-x-auto"] table td:nth-child(n+5),
  [class*="overflow-x-auto"] table th:nth-child(n+5),
  .overflow-x-auto table td:nth-child(n+5),
  .overflow-x-auto table th:nth-child(n+5) {
    display: none !important;
  }

}
/* ── end EnteraVeil admin mobile overrides ─────────────────────────────── */
        `,
      }}
    />
  )
}

export const config = defineWidgetConfig({
  zone: 'order.details.before',
})

export default MobileCssOverride
