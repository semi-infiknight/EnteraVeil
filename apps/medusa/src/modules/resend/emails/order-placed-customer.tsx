// Customer-facing order confirmation. Dark, gold-accented, EnteraVeil-branded.
// Mirrors the brand wordmark + accent from the storefront.

import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import {
  BigNumberValue,
  CustomerDTO,
  OrderDTO,
} from '@medusajs/framework/types'

type OrderPlacedCustomerEmailProps = {
  order: OrderDTO & { customer?: CustomerDTO }
}

const BRAND_BG = '#0A0A0A'
const BRAND_FG = '#F5F5F4'
const BRAND_ACCENT = '#FFB627'
const BRAND_MUTED = '#3F3F46'

function formatPrice(price: BigNumberValue, currency: string) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currencyDisplay: 'narrowSymbol',
    currency: currency.toUpperCase(),
  })
  if (typeof price === 'number') return formatter.format(price)
  if (typeof price === 'string') return formatter.format(parseFloat(price))
  return price?.toString() ?? ''
}

function OrderPlacedCustomerComponent({ order }: OrderPlacedCustomerEmailProps) {
  const customerName =
    order.customer?.first_name ??
    order.shipping_address?.first_name ??
    'friend'
  const supportEmail = process.env.ADMIN_EMAIL ?? 'orders@enteraveil.com'
  const items = order.items ?? []

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>
          {`Order #${order.display_id} confirmed — thanks for shopping EnteraVeil`}
        </Preview>
        <Body
          style={{ backgroundColor: BRAND_BG, fontFamily: 'system-ui, sans-serif' }}
        >
          <Container
            className="mx-auto my-10 w-full max-w-2xl"
            style={{ backgroundColor: BRAND_BG, color: BRAND_FG }}
          >
            {/* Wordmark header */}
            <Section
              className="px-6 py-6"
              style={{ borderBottom: `1px solid ${BRAND_MUTED}` }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  color: BRAND_FG,
                }}
              >
                EnteraVeil
              </Text>
              <Text
                style={{
                  margin: '4px 0 0',
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: BRAND_ACCENT,
                }}
              >
                Anime streetwear · from beyond the veil
              </Text>
            </Section>

            {/* Greeting */}
            <Section className="px-6 pt-6">
              <Heading
                style={{ color: BRAND_FG, fontSize: '22px', margin: 0 }}
              >
                Thanks for your order, {customerName}.
              </Heading>
              <Text
                style={{ color: BRAND_FG, opacity: 0.8, marginTop: '8px' }}
              >
                Order <span style={{ color: BRAND_ACCENT }}>#{order.display_id}</span>{' '}
                is in. We're getting it packed and we'll email you when it ships.
              </Text>
            </Section>

            {/* Items */}
            <Section className="px-6 pt-6">
              <Heading
                as="h3"
                style={{
                  color: BRAND_FG,
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: '0 0 8px',
                }}
              >
                Items
              </Heading>
              {items.map((item: any) => (
                <Row
                  key={item.id}
                  style={{ paddingTop: '10px', paddingBottom: '10px' }}
                >
                  <Column>
                    <Text style={{ color: BRAND_FG, margin: 0 }}>
                      {item.title} {item.variant_title ? `· ${item.variant_title}` : ''}
                    </Text>
                    <Text
                      style={{
                        color: BRAND_FG,
                        opacity: 0.6,
                        margin: 0,
                        fontSize: '12px',
                      }}
                    >
                      Qty {item.quantity}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text style={{ color: BRAND_FG, margin: 0 }}>
                      {formatPrice(item.total, order.currency_code)}
                    </Text>
                  </Column>
                </Row>
              ))}
              <Hr style={{ borderColor: BRAND_MUTED, margin: '12px 0' }} />
              <Row>
                <Column>
                  <Text style={{ color: BRAND_FG, opacity: 0.7, margin: 0 }}>
                    Subtotal
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ color: BRAND_FG, margin: 0 }}>
                    {formatPrice(order.item_subtotal, order.currency_code)}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={{ color: BRAND_FG, opacity: 0.7, margin: 0 }}>
                    Shipping
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ color: BRAND_FG, margin: 0 }}>
                    {formatPrice(order.shipping_total, order.currency_code)}
                  </Text>
                </Column>
              </Row>
              <Hr style={{ borderColor: BRAND_MUTED, margin: '12px 0' }} />
              <Row>
                <Column>
                  <Text
                    style={{
                      color: BRAND_FG,
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 600,
                    }}
                  >
                    Total
                  </Text>
                </Column>
                <Column align="right">
                  <Text
                    style={{
                      color: BRAND_ACCENT,
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    {formatPrice(order.total, order.currency_code)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping address */}
            {order.shipping_address && (
              <Section className="px-6 pt-6">
                <Heading
                  as="h3"
                  style={{
                    color: BRAND_FG,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: '0 0 8px',
                  }}
                >
                  Shipping to
                </Heading>
                <Text style={{ color: BRAND_FG, opacity: 0.85, margin: 0 }}>
                  {order.shipping_address.first_name}{' '}
                  {order.shipping_address.last_name}
                  <br />
                  {order.shipping_address.address_1}
                  {order.shipping_address.address_2
                    ? `, ${order.shipping_address.address_2}`
                    : ''}
                  <br />
                  {order.shipping_address.city},{' '}
                  {order.shipping_address.province}{' '}
                  {order.shipping_address.postal_code}
                  <br />
                  Expected delivery: 3–7 days
                </Text>
              </Section>
            )}

            {/* Support */}
            <Section className="px-6 py-8">
              <Text style={{ color: BRAND_FG, opacity: 0.7, fontSize: '13px' }}>
                Questions? Reply to this email or write to{' '}
                <Link
                  href={`mailto:${supportEmail}`}
                  style={{ color: BRAND_ACCENT }}
                >
                  {supportEmail}
                </Link>
                .
              </Text>
              <Text
                style={{
                  color: BRAND_FG,
                  opacity: 0.4,
                  fontSize: '11px',
                  marginTop: '24px',
                }}
              >
                © {new Date().getFullYear()} EnteraVeil. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

export const orderPlacedCustomerEmail = (
  props: OrderPlacedCustomerEmailProps
) => <OrderPlacedCustomerComponent {...props} />

// Preview default for `react-email dev`
const mockOrder: any = {
  display_id: 1001,
  currency_code: 'INR',
  email: 'customer@example.com',
  total: 1799,
  item_subtotal: 1499,
  shipping_total: 300,
  items: [
    { id: 'i1', title: 'Veil Tee', variant_title: 'M / Black', quantity: 1, total: 1499 },
  ],
  shipping_address: {
    first_name: 'A',
    last_name: 'Patel',
    address_1: 'Indiranagar',
    city: 'Bangalore',
    province: 'Karnataka',
    postal_code: '560038',
  },
  customer: { first_name: 'Asha' },
}
export default () => <OrderPlacedCustomerComponent order={mockOrder} />
