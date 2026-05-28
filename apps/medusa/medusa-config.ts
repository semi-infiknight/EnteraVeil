import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const razorpayKeyId = process.env.RAZORPAY_ID;
const razorpayKeySecret = process.env.RAZORPAY_SECRET;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

const isRazorpayConfigured =
  Boolean(razorpayKeyId) &&
  Boolean(razorpayKeySecret) &&
  Boolean(razorpayWebhookSecret);

const paymentProviders: any[] = [];

if (isRazorpayConfigured) {
  console.log('Razorpay credentials found. Enabling Razorpay payment provider');
  paymentProviders.push({
    resolve: 'medusa-plugin-razorpay-v2/providers/payment-razorpay/src',
    id: 'razorpay',
    options: {
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
      razorpay_account: process.env.RAZORPAY_ACCOUNT,
      // Expiry windows (minutes). 30 min is plenty for INR cart checkout flow.
      automatic_expiry_period: 30,
      manual_expiry_period: 20,
      refund_speed: 'normal',
      webhook_secret: razorpayWebhookSecret,
    },
  });
} else {
  console.warn(
    'Razorpay env vars missing; payment provider will not be registered. ' +
      'Set RAZORPAY_ID, RAZORPAY_SECRET, RAZORPAY_WEBHOOK_SECRET to enable.'
  );
}

// Phase 4 adds Cash-on-Delivery via the built-in `pp_system_default` manual provider.
// We register it unconditionally so COD works in local dev even without Razorpay keys.
paymentProviders.push({
  resolve: '@medusajs/medusa/payment',
  id: 'system_default',
});

const dynamicModules: Record<string, any> = {};

if (paymentProviders.length > 0) {
  dynamicModules[Modules.PAYMENT] = {
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: paymentProviders.filter(
        (p) => p.resolve !== '@medusajs/medusa/payment'
      ),
    },
  };
}

const modules = {
  [Modules.FILE]: {
    resolve: '@medusajs/medusa/file',
    options: {
      providers: [
        {
          resolve: '@medusajs/file-s3',
          id: 's3',
          options: {
            file_url: process.env.DO_SPACE_URL,
            access_key_id: process.env.DO_SPACE_ACCESS_KEY,
            secret_access_key: process.env.DO_SPACE_SECRET_KEY,
            region: process.env.DO_SPACE_REGION,
            bucket: process.env.DO_SPACE_BUCKET,
            endpoint: process.env.DO_SPACE_ENDPOINT,
          },
        },
      ],
    },
  },
  [Modules.NOTIFICATION]: {
    resolve: '@medusajs/medusa/notification',
    options: {
      providers: [
        {
          resolve: './src/modules/resend',
          id: 'resend',
          options: {
            channels: ['email'],
            api_key: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM_EMAIL,
          },
        },
      ],
    },
  },
  [Modules.INDEX]: {
    resolve: '@medusajs/index',
  },
};

module.exports = defineConfig({
  plugins: ['medusa-plugin-razorpay-v2'],
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'true',
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules: {
    ...dynamicModules,
    ...modules,
  },
});
