/**
 * Number and currency formatting for the calculator tools.
 *
 * The finance calculators (EMI, SIP, FD, GST, loan) are aimed at an Indian
 * audience, so money defaults to rupees with the Indian digit grouping
 * (lakh/crore). Kept in one place so every calculator reads consistently.
 */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INR_PRECISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatINR(n: number, precise = false): string {
  if (!Number.isFinite(n)) return "—";
  return (precise ? INR_PRECISE : INR).format(n);
}

export function formatNumber(n: number, maxDp = 2): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: maxDp }).format(n);
}
