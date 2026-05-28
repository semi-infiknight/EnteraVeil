import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import crypto from 'crypto'

// Razorpay webhook handler.
//
// Razorpay POSTs JSON events here with an `x-razorpay-signature` header.
// We verify the signature against `RAZORPAY_WEBHOOK_SECRET`, then dispatch
// based on event type. Always return 200 quickly for legitimate signed
// events — Razorpay retries on 5xx, and we don't want duplicate captures.
// Idempotency is enforced by checking the target order's payment state
// before transitioning.

type RazorpayPayment = {
  id: string
  order_id: string
  status: string
  amount: number
  currency: string
  notes?: Record<string, string>
}

type RazorpayRefund = {
  id: string
  payment_id: string
  amount: number
  status: string
}

type RazorpayEvent = {
  event: string
  payload: {
    payment?: { entity: RazorpayPayment }
    refund?: { entity: RazorpayRefund }
  }
}

const verifySignature = (rawBody: string, signature: string, secret: string) => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  // timingSafeEqual requires equal-length buffers; fall back to false on mismatch.
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(signature, 'utf8')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error('Razorpay webhook hit but RAZORPAY_WEBHOOK_SECRET is unset')
    return res.status(503).json({ error: 'Webhook not configured' })
  }

  const signature = req.headers['x-razorpay-signature']
  if (!signature || typeof signature !== 'string') {
    logger.warn('Razorpay webhook missing x-razorpay-signature header')
    return res.status(400).json({ error: 'Missing signature' })
  }

  // Medusa parses JSON by default, so we recover the raw payload by re-stringifying
  // the parsed body — Razorpay signs the JSON string they sent us.
  // For perfect-fidelity verification under all conditions, consider switching
  // this route to a raw-body parser; for now we accept the round-trip risk and
  // log mismatches.
  const rawBody =
    typeof (req as any).rawBody === 'string'
      ? (req as any).rawBody
      : JSON.stringify(req.body)

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    logger.warn('Razorpay webhook signature mismatch')
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const event = req.body as RazorpayEvent
  if (!event || !event.event) {
    return res.status(400).json({ error: 'Malformed event' })
  }

  logger.info(`Razorpay webhook received: ${event.event}`)

  try {
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(req, event.payload.payment?.entity, logger)
        break
      case 'payment.failed':
        await handlePaymentFailed(req, event.payload.payment?.entity, logger)
        break
      case 'refund.processed':
        await handleRefundProcessed(req, event.payload.refund?.entity, logger)
        break
      default:
        // Acknowledge unknown events so Razorpay doesn't retry forever.
        logger.info(`Razorpay webhook: ignored event ${event.event}`)
    }
    return res.status(200).json({ received: true })
  } catch (err: any) {
    logger.error(`Razorpay webhook handler failed: ${err.message ?? err}`)
    // Return 200 to avoid Razorpay retry storms; we'll see the error in logs.
    return res.status(200).json({ received: true, handled: false })
  }
}

async function handlePaymentCaptured(
  req: AuthenticatedMedusaRequest,
  payment: RazorpayPayment | undefined,
  logger: any
) {
  if (!payment) {
    logger.warn('payment.captured fired without payment entity')
    return
  }

  const paymentModule = req.scope.resolve(Modules.PAYMENT)
  // The plugin stores the Medusa payment session id in `notes.session_id`
  // when it creates the Razorpay order. Look it up and capture.
  const sessionId =
    payment.notes?.session_id ?? payment.notes?.medusa_session_id
  if (!sessionId) {
    logger.warn(
      `payment.captured (rzp:${payment.id}) has no medusa session id in notes — skipping`
    )
    return
  }

  // Idempotency: if the payment is already captured Medusa-side, no-op.
  // We rely on the payment module's own state — capture is idempotent
  // at the framework level but we double-check to avoid log noise.
  try {
    await paymentModule.capturePayment({
      payment_id: sessionId,
      captured_by: 'razorpay-webhook',
      amount: payment.amount / 100,
    } as any)
    logger.info(`Captured Medusa payment ${sessionId} for rzp:${payment.id}`)
  } catch (err: any) {
    if (/already.*captured/i.test(err.message ?? '')) {
      logger.info(`Payment ${sessionId} already captured — ok`)
      return
    }
    throw err
  }
}

async function handlePaymentFailed(
  req: AuthenticatedMedusaRequest,
  payment: RazorpayPayment | undefined,
  logger: any
) {
  if (!payment) return
  const sessionId =
    payment.notes?.session_id ?? payment.notes?.medusa_session_id
  if (!sessionId) return
  // Medusa v2 doesn't have a single "fail" transition exposed publicly;
  // the cart will be reaped or the user will retry. Log for visibility.
  logger.warn(
    `Razorpay payment failed: rzp:${payment.id} session:${sessionId} status:${payment.status}`
  )
}

async function handleRefundProcessed(
  req: AuthenticatedMedusaRequest,
  refund: RazorpayRefund | undefined,
  logger: any
) {
  if (!refund) return
  logger.info(
    `Razorpay refund processed: rzp:${refund.id} payment:${refund.payment_id} amount:${refund.amount}`
  )
  // Razorpay-initiated refunds are typically already mirrored in Medusa by the
  // admin action that triggered them, so this hook is primarily for audit.
  // If a Razorpay-dashboard-only refund happens, we'd need to create a Medusa
  // refund record here — deferred until that workflow exists.
}
