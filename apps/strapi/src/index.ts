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

async function seedPlaceholderContent(strapi: Core.Strapi) {
  // Only seed if a content type is empty — never overwrite editor edits.
  const aboutCount = await strapi.documents('api::about.about').count({});
  if (aboutCount === 0) {
    await strapi.documents('api::about.about').create({
      data: {
        title: 'About EnteraVeil',
        body: 'EnteraVeil is anime streetwear from beyond the veil. Limited drops, graphic tees, shipped from Bangalore across India.',
      },
      status: 'published',
    });
    strapi.log.info('Seeded: about (single type)');
  }

  const blogCount = await strapi.documents('api::blog-post.blog-post').count({});
  if (blogCount === 0) {
    await strapi.documents('api::blog-post.blog-post').create({
      data: {
        title: 'Drop one is live',
        slug: 'drop-one-is-live',
        author: 'EnteraVeil',
        body: "Our first drop is here. Limited run; once they're gone they're gone.",
        tags: ['drop', 'launch'],
      },
      status: 'published',
    });
    strapi.log.info('Seeded: blog-post (sample)');
  }

  const lookbookCount = await strapi
    .documents('api::lookbook-entry.lookbook-entry')
    .count({});
  if (lookbookCount === 0) {
    await strapi.documents('api::lookbook-entry.lookbook-entry').create({
      data: {
        title: 'Veil one',
        slug: 'veil-one',
        body: 'Editorial commentary on the first drop.',
        linked_product_skus: [],
      },
      status: 'published',
    });
    strapi.log.info('Seeded: lookbook-entry (sample)');
  }

  const homepageCount = await strapi
    .documents('api::homepage-section.homepage-section')
    .count({});
  if (homepageCount === 0) {
    await strapi.documents('api::homepage-section.homepage-section').create({
      data: {
        type: 'hero',
        title: 'From beyond the veil',
        body: 'Anime streetwear, hand-printed in India.',
        cta_text: 'Shop the drop',
        cta_url: '/shop',
        sort_order: 0,
      },
      status: 'published',
    });
    strapi.log.info('Seeded: homepage-section (hero)');
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
