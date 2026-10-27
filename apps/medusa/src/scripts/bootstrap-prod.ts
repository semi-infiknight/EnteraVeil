// Production bootstrap for a fresh Medusa database.
//
// Runs on every container start but is idempotent:
//   - creates a store + default sales channel if the database is empty
//   - runs the demo seed once to establish catalog/region scaffolding
//   - ensures a publishable API key exists and logs it (publishable keys are
//     public by design and are needed at storefront build time)
//   - applies the India region, INR prices and shop filters
//   - creates the admin user from ADMIN_EMAIL / ADMIN_PASSWORD if missing
//
// Invoked from the Dockerfile CMD before `pnpm start`.

import { ExecArgs } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from '@medusajs/medusa/core-flows';

import addAdmin from './add-admin';
import seedDemoData from './seed';
import seedCatalogIfEmpty from './seed-catalog-if-empty';
import seedInrPrices from './seed-inr-prices';
import seedShopFilters from './seed-shop-filters';
import setupIndia from './setup-india';

export default async function bootstrapProd(args: ExecArgs) {
  const { container } = args;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const storeModule = container.resolve(Modules.STORE) as any;
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL) as any;
  const apiKeyModule = container.resolve(Modules.API_KEY) as any;
  const productModule = container.resolve(Modules.PRODUCT) as any;

  logger.info('[bootstrap] starting production bootstrap');

  let [store] = await storeModule.listStores();
  if (!store) {
    logger.info('[bootstrap] no store found, creating default store');
    store = await storeModule.createStores({ name: 'EnteraVeil' });
  }

  let channels = await salesChannelModule.listSalesChannels({
    name: 'Default Sales Channel',
  });
  if (!channels.length) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: 'Default Sales Channel' }] },
    });
    channels = result;
  }

  const products = await productModule.listProducts({});
  if (!products.length) {
    logger.info('[bootstrap] empty catalog, running demo seed');
    await seedDemoData(args);
  } else {
    logger.info(`[bootstrap] catalog already has ${products.length} product(s)`);
  }

  let keys = await apiKeyModule.listApiKeys({ type: 'publishable' });
  if (!keys.length) {
    logger.info('[bootstrap] creating publishable API key');
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{ title: 'Webshop', type: 'publishable', created_by: '' }],
      },
    });
    keys = result;
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: keys[0].id, add: [channels[0].id] },
    });
  }
  logger.info(`[bootstrap] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${keys[0].token}`);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const userModule = container.resolve(Modules.USER) as any;
    const existing = await userModule.listUsers({ email: adminEmail });
    if (!existing.length) {
      try {
        await addAdmin({ container, args: [adminEmail, adminPassword] } as ExecArgs);
        logger.info(`[bootstrap] admin user created for ${adminEmail}`);
      } catch (error: any) {
        logger.warn(`[bootstrap] admin user creation failed: ${error.message}`);
      }
    } else {
      logger.info('[bootstrap] admin user already exists');
    }
  }

  await setupIndia(args);
  await seedCatalogIfEmpty(args);
  await seedInrPrices(args);
  await seedShopFilters(args);

  logger.info('[bootstrap] production bootstrap complete');
}
