import Stripe from 'stripe';

/**
 * Get Stripe secret key — works on any platform:
 *  1. STRIPE_SECRET_KEY env var (Railway, Render, Vercel, any host)
 *  2. Replit connector API (dev + Replit-deployed)
 */
async function getStripeSecretKey(): Promise<string> {
  // Only use env var if it's actually a secret key (sk_), not a publishable key (pk_)
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
    return process.env.STRIPE_SECRET_KEY;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (hostname && xReplitToken) {
    try {
      const resp = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
        {
          headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
          signal: AbortSignal.timeout(10_000),
        }
      );
      if (resp.ok) {
        const data = await resp.json() as any;
        const items: any[] = data.items ?? [];
        // Prefer live key (sk_live_) over test key
        const liveItem = items.find((i: any) => {
          const k = i.settings?.secret_key || i.settings?.secret || '';
          return k.startsWith('sk_live_');
        });
        const item = liveItem ?? items[0];
        const key = item?.settings?.secret_key || item?.settings?.secret;
        if (key) return key;
      }
    } catch { /* fall through */ }
  }

  throw new Error(
    'Stripe secret key not found. Set STRIPE_SECRET_KEY environment variable.'
  );
}

export async function getStripeWebhookSecret(): Promise<string | null> {
  if (process.env.STRIPE_WEBHOOK_SECRET) return process.env.STRIPE_WEBHOOK_SECRET;

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (hostname && xReplitToken) {
    try {
      const resp = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
        { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken }, signal: AbortSignal.timeout(10_000) }
      );
      if (resp.ok) {
        const data = await resp.json() as any;
        return data.items?.[0]?.settings?.webhook_secret ?? null;
      }
    } catch { /* ignore */ }
  }
  return null;
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const secretKey = await getStripeSecretKey();
  return new Stripe(secretKey);
}
