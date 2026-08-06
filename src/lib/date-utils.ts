/**
 * Date helpers for the age, date-difference and related calculators.
 *
 * Dates from <input type="date"> are parsed as *local* calendar dates rather
 * than the UTC midnight `new Date("2020-01-15")` would give, so a day never
 * slips across a timezone boundary.
 */

export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface YMD {
  years: number;
  months: number;
  days: number;
}

/** Exact calendar difference from the earlier date to the later one. */
export function diffYMD(from: Date, to: Date): YMD {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months--;
    // Days in the month before `to`.
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}
