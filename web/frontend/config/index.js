require("dotenv").config();

module.exports = {
  shopify: {
    api: {
      key: process.env.SHOPIFY_API_KEY,
      secretKey: process.env.SHOPIFY_API_SECRET_KEY,
      version: process.env.API_VERSION,
    },
    app: {
      id: process.env.APP_ID,
      port: parseInt(process.env.APP_PORT),
      scopes: process.env.APP_SCOPES.split(","),
      url: process.env.APP_URL,
    },
    affiliate: {
      applied: process.env.SHOFFI_APPLIED === "true",
      apiKey: process.env.SHOFFI_API_KEY,
    },
  },
  server: {
    url: process.env.SERVER_URL,
    jwt: {
      secretKey: process.env.SERVER_JWT_SECRET_KEY.replace(/\\n/gm, "\n"),
      expiresIn: process.env.SERVER_JWT_EXPIRES_IN,
      algorithm: process.env.SERVER_JWT_ALGORITHM,
    },
  },
};
