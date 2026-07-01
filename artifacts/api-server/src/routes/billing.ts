import { Router } from "express";
import { db, startupProfiles } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { getUncachableStripeClient } from "../stripeClient";

export const billingRouter = Router();

function normalizePriceId(val: string | undefined): string | undefined {
  if (!val) return undefined;
  return val.startsWith("price_") ? val : `price_${val}`;
}

// Verified live price IDs fetched directly from Stripe (fallback if env vars are wrong/missing)
const LIVE_PRICE_FALLBACKS: Record<string, string> = {
  growth:     "price_1Tkd4qDuoHDwc24z70eywLwj",
  scale:      "price_1Tkd4qDuoHDwc24zMjxYtw9s",
  enterprise: "price_1Tkd4oDuoHDwc24zzLLkFQcc",
};

function resolvePrice(envVal: string | undefined, key: string): string {
  const normalized = normalizePriceId(envVal);
  // Only trust the env var if it matches Stripe's real price ID format
  if (normalized && /^price_[A-Za-z0-9]{24,}$/.test(normalized)) return normalized;
  return LIVE_PRICE_FALLBACKS[key]!;
}

const PLAN_PRICE_MAP: Record<string, string> = {
  growth:     resolvePrice(process.env.STRIPE_PRICE_ID_GROWTH, "growth"),
  scale:      resolvePrice(process.env.STRIPE_PRICE_ID_SCALE, "scale"),
  enterprise: resolvePrice(process.env.STRIPE_PRICE_ID_ENTERPRISE || process.env.STRIPE_PRICE_ID, "enterprise"),
};

billingRouter.post("/checkout", async (req, res) => {
  const priceMapConfigured = Object.values(PLAN_PRICE_MAP).some(Boolean);
  if (!priceMapConfigured) {
    res.json({ url: null, error: "Stripe price IDs not configured. Run the seed-products script and add STRIPE_PRICE_ID_* to Secrets." });
    return;
  }

  const plan = (req.body.plan as string) || "enterprise";
  const priceId = PLAN_PRICE_MAP[plan] || PLAN_PRICE_MAP["enterprise"];

  if (!priceId) {
    res.json({ url: null, error: `No price configured for plan "${plan}". Add STRIPE_PRICE_ID_${plan.toUpperCase()} to Secrets.` });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();
    const origin = process.env.APP_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/living-codex` : "http://localhost:3000");

    const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);

    const createSession = async (customerId?: string) =>
      stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}${(req.body.successPath as string) || "/billing"}?success=true&plan=${plan}`,
        cancel_url: `${origin}${(req.body.cancelPath as string) || "/billing"}?canceled=true`,
        ...(customerId ? { customer: customerId } : {}),
        metadata: {
          profileId: profile?.id?.toString() || "",
          plan,
        },
      });

    let session;
    try {
      session = await createSession(profile?.stripeCustomerId || undefined);
    } catch (stripeErr: any) {
      // Stale test customer ID — clear it and retry without customer
      if (stripeErr?.code === "resource_missing" && stripeErr?.message?.includes("customer")) {
        if (profile?.id) {
          await db.update(startupProfiles)
            .set({ stripeCustomerId: null })
            .where(eq(startupProfiles.id, profile.id));
        }
        session = await createSession();
      } else {
        throw stripeErr;
      }
    }

    res.json({ url: session.url, error: null });
  } catch (err: any) {
    res.status(500).json({ url: null, error: err.message });
  }
});

billingRouter.get("/status", async (_req, res) => {
  try {
    const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
    if (!profile?.stripeSubscriptionId) {
      res.json({
        active: false,
        plan: "none",
        customerId: profile?.stripeCustomerId ?? null,
        subscriptionId: null,
        currentPeriodEnd: null,
        configured: true,
        paymentLinks: {
          growth: profile?.paymentLinkGrowth ?? null,
          scale: profile?.paymentLinkScale ?? null,
          enterprise: profile?.paymentLinkEnterprise ?? null,
        },
      });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const sub = await stripe.subscriptions.retrieve(profile.stripeSubscriptionId);
    const isActive = sub.status === "active" || sub.status === "trialing";

    await db.update(startupProfiles)
      .set({ stripeSubscriptionStatus: sub.status, updatedAt: new Date() })
      .where(eq(startupProfiles.id, profile.id));

    const periodEndUnix = (sub as any).current_period_end ?? (sub as any).items?.data?.[0]?.current_period_end ?? null;
    const currentPeriodEnd = periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null;

    res.json({
      active: isActive,
      plan: isActive ? (profile.subscribedPlan || "enterprise") : "none",
      customerId: profile.stripeCustomerId,
      subscriptionId: profile.stripeSubscriptionId,
      currentPeriodEnd,
      configured: true,
      paymentLinks: {
        growth: profile.paymentLinkGrowth ?? null,
        scale: profile.paymentLinkScale ?? null,
        enterprise: profile.paymentLinkEnterprise ?? null,
      },
    });
  } catch (err: any) {
    res.json({ active: false, plan: "none", customerId: null, subscriptionId: null, currentPeriodEnd: null, configured: false, error: err.message, paymentLinks: { growth: null, scale: null, enterprise: null } });
  }
});

billingRouter.post("/payment-links", async (req, res) => {
  const clean = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const t = v.trim();
    return t.length ? t : null;
  };

  const links = {
    paymentLinkGrowth: clean(req.body?.growth),
    paymentLinkScale: clean(req.body?.scale),
    paymentLinkEnterprise: clean(req.body?.enterprise),
  };

  for (const v of Object.values(links)) {
    if (v) {
      let ok = false;
      try {
        const u = new URL(v);
        ok = u.protocol === "https:" && u.hostname.toLowerCase() === "buy.stripe.com";
      } catch {
        ok = false;
      }
      if (!ok) {
        res.status(400).json({ error: "Each link must be a Stripe Payment Link (https://buy.stripe.com/...)." });
        return;
      }
    }
  }

  const [existing] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  if (!existing) {
    res.status(400).json({ error: "No startup profile yet. Complete Setup first." });
    return;
  }

  const [updated] = await db
    .update(startupProfiles)
    .set({ ...links, updatedAt: new Date() })
    .where(eq(startupProfiles.id, existing.id))
    .returning();

  res.json({
    growth: updated.paymentLinkGrowth ?? null,
    scale: updated.paymentLinkScale ?? null,
    enterprise: updated.paymentLinkEnterprise ?? null,
  });
});

billingRouter.post("/setup-payment-links", async (_req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const plans = [
      { key: "growth",     name: "Autonomous Revenue OS — Growth",      amount: 9900,  desc: "50 AI leads/mo, email delivery, deal pipeline" },
      { key: "scale",      name: "Autonomous Revenue OS — Scale",        amount: 29900, desc: "Unlimited AI leads, email + SMS, full pipeline, company intelligence" },
      { key: "enterprise", name: "Autonomous Revenue OS — Enterprise",   amount: 99900, desc: "Everything in Scale plus dedicated agent tuning and white-glove onboarding" },
    ];

    const result: Record<string, string> = {};
    for (const plan of plans) {
      const product = await stripe.products.create({ name: plan.name, description: plan.desc });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.amount,
        currency: "usd",
        recurring: { interval: "month" },
      });
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
      });
      result[plan.key] = link.url;
    }

    const [existing] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
    if (existing) {
      await db.update(startupProfiles).set({
        paymentLinkGrowth: result.growth,
        paymentLinkScale: result.scale,
        paymentLinkEnterprise: result.enterprise,
        updatedAt: new Date(),
      }).where(eq(startupProfiles.id, existing.id));
    }

    res.json({ success: true, links: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

billingRouter.post("/portal", async (req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const origin = process.env.APP_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/living-codex` : "http://localhost:3000");

    const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);

    if (!profile?.stripeCustomerId) {
      res.status(400).json({ url: null, error: "No Stripe customer found. Subscribe to a plan first." });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${origin}/billing`,
    });

    res.json({ url: session.url, error: null });
  } catch (err: any) {
    res.status(500).json({ url: null, error: err.message });
  }
});

billingRouter.post("/webhook", async (req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = (req as any).rawBody;

    if (!rawBody) {
      res.status(400).json({ error: "No raw body" });
      return;
    }

    const webhookSecret = process.env.STRIPE_BILLING_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("STRIPE_BILLING_WEBHOOK_SECRET not set — skipping signature verification");
      res.json({ received: true, warning: "Webhook ignored: signature verification not configured" });
      return;
    }

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
      return;
    }

    const session = event.data?.object;
    let profile: { id: number } | null = null;

    const profileIdMeta = session?.metadata?.profileId || session?.metadata?.profile_id;
    if (profileIdMeta) {
      const [p] = await db.select().from(startupProfiles).where(eq(startupProfiles.id, parseInt(profileIdMeta)));
      if (p) profile = p;
    }

    if (!profile && session?.customer) {
      const [p] = await db.select().from(startupProfiles).where(eq(startupProfiles.stripeCustomerId, session.customer));
      if (p) profile = p;
    }

    if (!profile) {
      const [p] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
      profile = p || null;
    }

    if (!profile) {
      console.warn(`Stripe billing webhook ${event.type}: no matching profile found`);
      res.json({ received: true });
      return;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const planName = session.metadata?.plan || "enterprise";
        await db.update(startupProfiles)
          .set({
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            stripeSubscriptionStatus: "active",
            subscribedPlan: planName,
            updatedAt: new Date(),
          })
          .where(eq(startupProfiles.id, profile.id));
        console.log(`Stripe checkout completed — profile ${profile.id}, plan ${planName}`);
        break;
      }
      case "customer.subscription.updated": {
        await db.update(startupProfiles)
          .set({ stripeSubscriptionId: session.id, stripeSubscriptionStatus: session.status, updatedAt: new Date() })
          .where(eq(startupProfiles.id, profile.id));
        break;
      }
      case "customer.subscription.deleted": {
        await db.update(startupProfiles)
          .set({ stripeSubscriptionStatus: "canceled", updatedAt: new Date() })
          .where(eq(startupProfiles.id, profile.id));
        break;
      }
      case "invoice.payment_failed": {
        await db.update(startupProfiles)
          .set({ stripeSubscriptionStatus: "past_due", updatedAt: new Date() })
          .where(eq(startupProfiles.id, profile.id));
        break;
      }
      default:
        console.log(`Unhandled Stripe billing event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Billing webhook handler error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});
