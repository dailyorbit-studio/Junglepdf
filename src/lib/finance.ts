/**
 * Finance formulas shared by the EMI, loan, SIP and FD calculators.
 * Pure functions — no formatting, no rounding beyond what the maths needs.
 */

/** Equated monthly instalment for a reducing-balance loan. */
export function emi(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

/** Future value of a monthly SIP (contribution at the start of each month). */
export function sipFutureValue(monthly: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return monthly * months;
  return monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

/** Maturity value of a fixed deposit under compound interest. */
export function fdMaturity(
  principal: number,
  annualRatePct: number,
  years: number,
  compoundsPerYear: number
): number {
  if (years <= 0) return principal;
  const rate = annualRatePct / 100;
  return principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
}
