export const serverConfig = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  authSecret: process.env.AUTH_SECRET ?? "",
  cookieName: process.env.AUTH_COOKIE_NAME ?? "hsk_session",
  isProduction: process.env.NODE_ENV === "production",
};

export function hasDatabase() {
  return Boolean(serverConfig.databaseUrl);
}

export function requireAuthSecret() {
  if (!serverConfig.authSecret || serverConfig.authSecret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }

  return serverConfig.authSecret;
}
