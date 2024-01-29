import 'dotenv/config'
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";

const DB_PATH = `${process.cwd()}/database.sqlite`;

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET_KEY, APP_SCOPES, HOST, API_VERSION, DEBUG } = process.env;
const { restResources } = await import(`@shopify/shopify-api/rest/admin/${API_VERSION}`);

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.

const config = {
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET_KEY,
  scopes: APP_SCOPES.split(','),
  hostScheme: 'https',
  hostName: HOST.replace(/^https:\/\//, ''),
  isEmbeddedApp: true,
};

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: undefined, // or replace with billingConfig above to enable example billing
    ...(!DEBUG && {
      logger: console,
    }),
    ...config,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage:
        process.env.NODE_ENV === 'production' ? new SQLiteSessionStorage(DB_PATH) : new MemorySessionStorage(),
});

export default shopify;
