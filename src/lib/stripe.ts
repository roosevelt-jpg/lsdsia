import Stripe from "stripe";

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function paymentsMessage() {
  if (stripeConfigured()) return null;
  return "Online payments are not configured. Browse the catalog freely; add Stripe test keys to enable Checkout.";
}
