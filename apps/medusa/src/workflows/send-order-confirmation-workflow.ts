import { createWorkflow, when, WorkflowResponse } from '@medusajs/framework/workflows-sdk';
import { useQueryGraphStep } from '@medusajs/medusa/core-flows';
import { sendNotificationStep } from './steps/send-notification-step';

type WorkflowInput = {
  id: string;
};

// Fires on `order.placed`. Sends:
//   1. Customer-facing branded confirmation to `order.email`
//   2. Internal alert to `ADMIN_EMAIL` (if set)
// Razorpay-paid AND COD orders both raise `order.placed`, so this covers both
// flows without branching. Idempotency: Medusa's notification module is the
// canonical store — re-firing produces a new notification row, which the
// admin can dedupe by `(resource_id, template)` query if needed.
export const sendOrderConfirmationWorkflow = createWorkflow(
  'send-order-confirmation',
  ({ id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'email',
        'currency_code',
        'total',
        'items.*',
        'shipping_address.*',
        'billing_address.*',
        'shipping_methods.*',
        'customer.*',
        'payment_collections.payment_sessions.*',
        'total',
        'subtotal',
        'discount_total',
        'shipping_total',
        'tax_total',
        'item_subtotal',
        'item_total',
        'item_tax_total'
      ],
      filters: {
        id
      },
      options: {
        throwIfKeyNotFound: true
      }
    });

    const adminEmail = process.env.ADMIN_EMAIL ?? '';

    const customerNotification = when({ orders }, (data) => !!data.orders[0].email).then(() => {
      return sendNotificationStep([
        {
          to: orders[0].email!,
          channel: 'email',
          template: 'order-placed-customer',
          data: {
            order: orders[0]
          }
        }
      ]);
    });

    const adminNotification = when({ orders }, () => !!adminEmail).then(() => {
      return sendNotificationStep([
        {
          to: adminEmail,
          channel: 'email',
          template: 'order-placed-admin',
          data: {
            order: orders[0]
          }
        }
      ]);
    });

    return new WorkflowResponse({
      customerNotification,
      adminNotification
    });
  }
);
