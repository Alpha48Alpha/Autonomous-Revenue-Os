import Stripe from 'stripe';

async function getStripeClient(): Promise<Stripe> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error('Missing Replit connector env vars');
  }

  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    {
      headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!resp.ok) {
    throw new Error(`Failed to fetch Stripe credentials: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json() as any;
  const settings = data.items?.[0]?.settings;
  const secretKey = settings?.secret_key || settings?.secret;

  if (!secretKey) {
    throw new Error('Stripe integration not connected or missing secret key.');
  }

  return new Stripe(secretKey);
}

const PLANS = [
  { name: 'AVOS Growth', description: 'For founders and early-stage teams ready to automate outbound.', amount: 9900, key: 'growth' },
  { name: 'AVOS Scale', description: 'For growing teams with an active pipeline who need full automation.', amount: 29900, key: 'scale' },
  { name: 'AVOS Enterprise', description: 'Full-platform autonomous revenue OS for serious revenue teams.', amount: 49700, key: 'enterprise' },
];

async function createProducts() {
  try {
    const stripe = await getStripeClient();

    console.log('Creating AVOS Pro subscription plans in Stripe...\n');

    for (const plan of PLANS) {
      const existing = await stripe.products.search({
        query: `name:'${plan.name}' AND active:'true'`,
      });

      if (existing.data.length > 0) {
        const product = existing.data[0];
        const prices = await stripe.prices.list({ product: product.id, active: true });
        const price = prices.data[0];
        console.log(`[SKIP] ${plan.name} already exists`);
        console.log(`  Product ID: ${product.id}`);
        console.log(`  Price ID:   ${price?.id ?? '(no active price)'}`);
        console.log(`  Env var:    STRIPE_PRICE_ID_${plan.key.toUpperCase()}=${price?.id ?? ''}\n`);
        continue;
      }

      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { plan: plan.key },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.amount,
        currency: 'usd',
        recurring: { interval: 'month' },
      });

      console.log(`[OK] Created ${plan.name}`);
      console.log(`  Product ID: ${product.id}`);
      console.log(`  Price ID:   ${price.id}`);
      console.log(`  Env var:    STRIPE_PRICE_ID_${plan.key.toUpperCase()}=${price.id}\n`);
    }

    console.log('Done. Copy the STRIPE_PRICE_ID_* values above into your Replit Secrets.');
  } catch (error: any) {
    console.error('Error creating products:', error.message);
    process.exit(1);
  }
}

createProducts();
