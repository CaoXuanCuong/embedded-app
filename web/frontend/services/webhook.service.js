const { registerWebhook: register } = require("@shopify/koa-shopify-webhooks");
const { shopify: shopifyConfig, server: serverConfig, server } = require("../config");

const lang = "en-US";
const timeZone = { timeZone: "Asia/Ho_Chi_Minh" };

function buildWebhookAddress(path) {
  return `${serverConfig.url}/webhooks/subscription/${path}`;
}

async function registerWebhook(shop, token, topic, path) {
  try {
    const response = await register({
      shop: shop,
      accessToken: token,
      topic: topic,
      address: buildWebhookAddress(path),
      apiVersion: shopifyConfig.api.version,
    });
    if (!response.success) {
      const now = new Date();
      console.log({
        event: "registerWebhook",
        shop: shop,
        message: `Registering webhook topic "${topic}"`,
        detail: `${JSON.stringify(response.result)}`,
        result: `debug`,
        time: now.toLocaleDateString(lang, timeZone) + " " + now.toLocaleTimeString(lang, timeZone),
      });
    }
  } catch (e) {
    const now = new Date();
    console.log({
      event: "registerWebhook",
      shop: shop,
      message: `Registering webhook topic "${topic}"`,
      detail: `${e.toString()}`,
      result: `error`,
      time: now.toLocaleDateString(lang, timeZone) + " " + now.toLocaleTimeString(lang, timeZone),
    });
  }
}

module.exports = {
  registerWebhook,
};
