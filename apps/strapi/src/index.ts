import type { Core } from '@strapi/strapi';

// Content types whose public read access we manage on boot.
const PUBLIC_READ_TYPES = [
  'api::about.about',
  'api::blog-post.blog-post',
  'api::lookbook-entry.lookbook-entry',
  'api::homepage-section.homepage-section',
  'api::legal-page.legal-page',
] as const;

const PUBLIC_READ_ACTIONS = ['find', 'findOne'] as const;

async function ensurePublicReadPermissions(strapi: Core.Strapi) {
  const publicRole: any = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('Public role not found; skipping permission bootstrap');
    return;
  }

  for (const uid of PUBLIC_READ_TYPES) {
    for (const action of PUBLIC_READ_ACTIONS) {
      const actionKey = `${uid}.${action}`;
      const existing: any = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: actionKey, role: publicRole.id } });
      if (existing && existing.enabled) continue;
      if (existing) {
        await strapi
          .query('plugin::users-permissions.permission')
          .update({ where: { id: existing.id }, data: { enabled: true } });
      } else {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action: actionKey, enabled: true, role: publicRole.id },
        });
      }
      strapi.log.info(`Public role: enabled ${actionKey}`);
    }
  }
}

const BLOG_POSTS = [
  {
    title: 'Drop one is live',
    slug: 'drop-one-is-live',
    author: 'EnteraVeil',
    body: "Our first drop is here — limited run graphic tees inspired by late-night anime marathons. Once they're gone, they're gone.",
    tags: ['drop', 'launch'],
  },
  {
    title: 'Behind the print',
    slug: 'behind-the-print',
    author: 'EnteraVeil',
    body: 'Every EnteraVeil piece starts as a frame-grab mood board, then gets cleaned up for screen print in Bangalore. No mass-market blanks.',
    tags: ['process', 'bangalore'],
  },
  {
    title: 'Shipping from Bangalore & Raipur',
    slug: 'shipping-bangalore-raipur',
    author: 'EnteraVeil',
    body: 'We ship across India from Bangalore and Raipur. COD is available; Razorpay goes live once payments are wired.',
    tags: ['shipping', 'india'],
  },
] as const;

const LOOKBOOK_ENTRIES = [
  {
    title: 'Veil one',
    slug: 'veil-one',
    body: 'Night-market energy — oversized tee, cargos, neon reflections.',
    linked_product_skus: [] as string[],
  },
  {
    title: 'After hours',
    slug: 'after-hours',
    body: 'Post-credits roll styling. Layered hoodies, muted purples, city rain.',
    linked_product_skus: [] as string[],
  },
  {
    title: 'Signal lost',
    slug: 'signal-lost',
    body: 'Static-heavy graphics and distressed washes for the in-between episodes.',
    linked_product_skus: [] as string[],
  },
] as const;

const HOMEPAGE_SECTIONS = [
  {
    type: 'hero' as const,
    title: 'From beyond the veil',
    body: 'Anime streetwear, hand-printed in India. Limited drops — no restocks.',
    cta_text: 'Shop the drop',
    cta_url: '/shop',
    sort_order: 0,
  },
  {
    type: 'featured' as const,
    title: 'Graphic tees',
    body: 'Screen-printed in small batches. Built for repeat watches.',
    cta_text: 'View shirts',
    cta_url: '/collections/shirts',
    sort_order: 1,
  },
  {
    type: 'lookbook' as const,
    title: 'The lookbook',
    body: 'Editorial fits tied to each drop.',
    cta_text: 'View lookbook',
    cta_url: '/lookbook',
    sort_order: 2,
  },
  {
    type: 'promo' as const,
    title: 'COD across India',
    body: 'Ships from Bangalore & Raipur. Pay on delivery while we finish Razorpay.',
    cta_text: 'Learn more',
    cta_url: '/legal/shipping-policy',
    sort_order: 3,
  },
  {
    type: 'newsletter' as const,
    title: 'Drop alerts',
    body: 'One email a month. No spam — just release dates and lookbook previews.',
    cta_text: 'Join the list',
    cta_url: '/#newsletter',
    sort_order: 4,
  },
] as const;

async function seedPlaceholderContent(strapi: Core.Strapi) {
  // Only seed if a content type is empty — never overwrite editor edits.
  const aboutCount = await strapi.documents('api::about.about').count({});
  if (aboutCount === 0) {
    await strapi.documents('api::about.about').create({
      data: {
        title: 'About EnteraVeil',
        body: 'EnteraVeil is anime streetwear from beyond the veil — limited graphic drops, printed in India, shipped nationwide. We build pieces for the hours between episodes: oversized tees, heavy hoodies, and editorial lookbooks that tie each release together.',
      },
      status: 'published',
    });
    strapi.log.info('Seeded: about (single type)');
  }

  const blogCount = await strapi.documents('api::blog-post.blog-post').count({});
  if (blogCount === 0) {
    for (const post of BLOG_POSTS) {
      await strapi.documents('api::blog-post.blog-post').create({
        data: post,
        status: 'published',
      });
    }
    strapi.log.info(`Seeded: blog-post (${BLOG_POSTS.length} entries)`);
  }

  const lookbookCount = await strapi
    .documents('api::lookbook-entry.lookbook-entry')
    .count({});
  if (lookbookCount === 0) {
    for (const entry of LOOKBOOK_ENTRIES) {
      await strapi.documents('api::lookbook-entry.lookbook-entry').create({
        data: entry,
        status: 'published',
      });
    }
    strapi.log.info(`Seeded: lookbook-entry (${LOOKBOOK_ENTRIES.length} entries)`);
  }

  const homepageCount = await strapi
    .documents('api::homepage-section.homepage-section')
    .count({});
  if (homepageCount === 0) {
    for (const section of HOMEPAGE_SECTIONS) {
      await strapi.documents('api::homepage-section.homepage-section').create({
        data: section,
        status: 'published',
      });
    }
    strapi.log.info(`Seeded: homepage-section (${HOMEPAGE_SECTIONS.length} sections)`);
  }

  const legalCount = await strapi
    .documents('api::legal-page.legal-page')
    .count({});
  if (legalCount === 0) {
    const placeholders = [
      { slug: 'privacy-policy', title: 'Privacy policy' },
      { slug: 'terms-and-conditions', title: 'Terms & conditions' },
      { slug: 'shipping-policy', title: 'Shipping policy' },
      { slug: 'refund-policy', title: 'Refund & cancellation policy' },
      { slug: 'contact', title: 'Contact us' },
    ];
    for (const p of placeholders) {
      await strapi.documents('api::legal-page.legal-page').create({
        data: {
          slug: p.slug,
          title: p.title,
          body: `Placeholder ${p.title.toLowerCase()}. Replace via the Strapi admin.`,
        },
        status: 'published',
      });
    }
    strapi.log.info(`Seeded: legal-page (${placeholders.length} placeholders)`);
  }
}

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await ensurePublicReadPermissions(strapi);
      await seedPlaceholderContent(strapi);
    } catch (err: any) {
      strapi.log.error(`Bootstrap failed: ${err.message ?? err}`);
    }
  },
};
