// Internal/admin notification — terse, scannable, includes link to admin order page.

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

type OrderPlacedAdminEmailProps = {
  order: OrderDTO & { customer?: CustomerDTO }
  admin_url?: string
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

function OrderPlacedAdminComponent({
  order,
  admin_url,
}: OrderPlacedAdminEmailProps) {
  const orderUrl =
    admin_url ??
    `${process.env.MEDUSA_BACKEND_URL ?? 'http://localhost:9000'}/app/orders/${order.id}`
  const items = order.items ?? []
  const isCod = (order as any).payment_collections?.[0]?.payment_sessions?.some(
    (s: any) => s.provider_id === 'pp_system_default'
  )

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>
          {`New order #${order.display_id} · ${formatPrice(order.total, order.currency_code)}`}
        </Preview>
        <Body
          style={{
            backgroundColor: BRAND_BG,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <Container
            className="mx-auto my-10 w-full max-w-2xl"
            style={{ backgroundColor: BRAND_BG, color: BRAND_FG }}
          >
            <Section
              className="px-6 py-5"
              style={{ borderBottom: `1px solid ${BRAND_MUTED}` }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: BRAND_ACCENT,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                EnteraVeil · New order
              </Text>
              <Heading
                style={{
                  color: BRAND_FG,
                  fontSize: '22px',
                  marginTop: '6px',
                  marginBottom: 0,
                }}
              >
                #{order.display_id}{' '}
                {isCod && (
                  <span
                    style={{
                      fontSize: '12px',
                      backgroundColor: BRAND_ACCENT,
                      color: BRAND_BG,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      verticalAlign: 'middle',
                      marginLeft: '8px',
                    }}
                  >
                    COD
                  </span>
                )}
              </Heading>
            </Section>

            <Section className="px-6 pt-6">
              <Row>
                <Column>
                  <Text style={{ color: BRAND_FG, opacity: 0.7, margin: 0 }}>
                    Customer
                  </Text>
                  <Text style={{ color: BRAND_FG, margin: 0 }}>
                    {order.customer?.first_name ?? order.shipping_address?.first_name}{' '}
                    {order.customer?.last_name ?? order.shipping_address?.last_name}
                    <br />
                    <Link
                      href={`mailto:${order.email}`}
                      style={{ color: BRAND_ACCENT }}
                    >
                      {order.email}
                    </Link>
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ color: BRAND_FG, opacity: 0.7, margin: 0 }}>
                    Total
                  </Text>
                  <Text
                    style={{
                      color: BRAND_ACCENT,
                      fontSize: '20px',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {formatPrice(order.total, order.currency_code)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="px-6 pt-6">
              <Heading
                as="h3"
                style={{
                  color: BRAND_FG,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: '0 0 8px',
                }}
              >
                Items
              </Heading>
              {items.map((item: any) => (
                <Row key={item.id} style={{ padding: '6px 0' }}>
                  <Column>
                    <Text style={{ color: BRAND_FG, margin: 0, fontSize: '13px' }}>
                      {item.quantity}× {item.title}
                      {item.variant_title ? ` · ${item.variant_title}` : ''}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text style={{ color: BRAND_FG, margin: 0, fontSize: '13px' }}>
                      {formatPrice(item.total, order.currency_code)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            {order.shipping_address && (
              <Section className="px-6 pt-6">
                <Heading
                  as="h3"
                  style={{
                    color: BRAND_FG,
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: '0 0 8px',
                  }}
                >
                  Ship to
                </Heading>
                <Text style={{ color: BRAND_FG, fontSize: '13px', margin: 0 }}>
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
                  {order.shipping_address.phone ?? ''}
                </Text>
              </Section>
            )}

            <Section className="px-6 py-8">
              <Hr style={{ borderColor: BRAND_MUTED, margin: '0 0 16px' }} />
              <Link
                href={orderUrl}
                style={{
                  display: 'inline-block',
                  backgroundColor: BRAND_ACCENT,
                  color: BRAND_BG,
                  padding: '10px 18px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderRadius: '6px',
                }}
              >
                Open in admin →
              </Link>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

export const orderPlacedAdminEmail = (props: OrderPlacedAdminEmailProps) => (
  <OrderPlacedAdminComponent {...props} />
)

const mockOrder: any = {
  id: 'order_01',
  display_id: 1001,
  currency_code: 'INR',
  email: 'customer@example.com',
  total: 1799,
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
    phone: '+91 9000000000',
  },
  customer: { first_name: 'Asha', last_name: 'Patel' },
  payment_collections: [
    { payment_sessions: [{ provider_id: 'pp_system_default' }] },
  ],
}
export default () => <OrderPlacedAdminComponent order={mockOrder} />
