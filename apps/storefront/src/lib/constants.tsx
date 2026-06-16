import React from 'react'

import { CreditCard } from '@medusajs/icons'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'

// Product filters
export const FILTER_KEYS = {
  ORDER_BY_KEY: 'sort_by',
  PRICE_KEY: 'price',
  MATERIAL_KEY: 'material',
  TYPE_KEY: 'type',
  COLLECTION_KEY: 'collection',
}

export const PRODUCT_LIST_PATHNAMES = {
  CATEGORY: '/categories',
  COLLECTION: '/collections',
  EXPLORE: '/shop',
  SEARCH: '/results',
} as const

export const blogSortOptions = [
  {
    value: 'desc',
    label: 'Newest',
  },
  {
    value: 'asc',
    label: 'Oldest',
  },
]

export const storeSortOptions = [
  {
    value: 'relevance',
    label: 'Relevance',
  },
  {
    value: 'created_at',
    label: 'New in',
  },
  // TODO: Add price sorting once we have the price sorting working
  // {
  //   value: 'price_asc',
  //   label: 'Price: Low-High',
  // },
  // {
  //   value: 'price_desc',
  //   label: 'Price: High-Low',
  // },
]

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_razorpay_razorpay: {
    title: 'Razorpay (UPI / Cards / NetBanking)',
    icon: <CreditCard />,
  },
  pp_system_default: {
    title: 'Cash on Delivery',
    icon: <CreditCard />,
  },
}

export const isRazorpay = (providerId?: string) => {
  return providerId?.startsWith('pp_razorpay')
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith('pp_system_default')
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  'krw',
  'jpy',
  'vnd',
  'clp',
  'pyg',
  'xaf',
  'xof',
  'bif',
  'djf',
  'gnf',
  'kmf',
  'mga',
  'rwf',
  'xpf',
  'htg',
  'vuv',
  'xag',
  'xdr',
  'xau',
]

export const passwordRequirements = [
  'At least 8 characters',
  'One lowercase letter',
  'One uppercase letter',
  'One number or symbol',
]

export const createNavigation = (
  productCategories: StoreProductCategory[],
  collections?: StoreCollection[]
) => [
  {
    name: 'Shop',
    handle: '/shop',
    category_children: productCategories
      .filter((category) => !category.parent_category)
      .map((category) => ({
        name: category.name,
        type: 'parent_category',
        handle: `/categories/${category.handle}`,
        category_children: category.category_children.map((subCategory) => ({
          name: subCategory.name,
          handle: `/categories/${subCategory.handle}`,
          icon: null,
          category_children: null,
        })),
      })),
  },
  {
    name: 'Collections',
    handle: '/shop',
    category_children: !collections
      ? null
      : collections.map((collection) => ({
          name: collection.title,
          type: 'collection',
          handle: `/collections/${collection.handle}`,
          handle_id: collection.handle,
          category_children: null,
        })),
  },
  {
    name: 'About Us',
    handle: '/about-us',
    category_children: null,
  },
]

export const createFooterNavigation = (
  productCategories: StoreProductCategory[]
) => {
  return {
    navigation: [
      {
        header: 'Categories',
        links: [
          ...productCategories
            .filter((category) => !category.parent_category)
            .slice(0, 5)
            .map((category) => ({
              title: category.name,
              href: `/categories/${category.handle}`,
            })),
        ],
      },
      {
        header: 'Orders',
        links: [
          {
            title: 'Orders and delivery',
            href: '/legal/shipping-policy',
          },
          {
            title: 'Returns and refunds',
            href: '/legal/refund-policy',
          },
          {
            title: 'Payment and pricing',
            href: '/legal/terms-and-conditions',
          },
        ],
      },
      {
        header: 'About',
        links: [
          {
            title: 'About us',
            href: '/about-us',
          },
          {
            title: 'Blog',
            href: '/blog',
          },
          {
            title: 'Careers',
            href: '#',
          },
        ],
      },
      {
        header: 'Need help?',
        links: [
          {
            title: 'FAQs',
            href: '/faq',
          },
          {
            title: 'Support center',
            href: '#',
          },
          {
            title: 'Contact us',
            href: '#',
          },
        ],
      },
    ],
    contact: {
      header: "Let's stay in touch",
      text: 'Keep up to date with the latest product launches and news. Find out more about our brands and get special promo codes.',
    },
    other: [
      {
        title: 'Privacy Policy',
        href: '/legal/privacy-policy',
      },
      {
        title: 'Terms & Conditions',
        href: '/legal/terms-and-conditions',
      },
      {
        title: 'Shipping Policy',
        href: '/legal/shipping-policy',
      },
      {
        title: 'Refund Policy',
        href: '/legal/refund-policy',
      },
    ],
  }
}

export const checkoutFooterNavigation = [
  {
    title: 'Privacy Policy',
    href: '/legal/privacy-policy',
  },
  {
    title: 'Terms & Conditions',
    href: '/legal/terms-and-conditions',
  },
]

export const emailRegex = new RegExp(
  "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)
