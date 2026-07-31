/**
 * Canonical site origin.
 *
 * Set NEXT_PUBLIC_SITE_URL at build time to point a deployment somewhere else
 * (a staging host, or a different domain) without editing source. No trailing
 * slash — callers add their own.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://junglepdf.in"
).replace(/\/$/, "");

export const SITE_NAME = "JunglePDF";

/**
 * Who operates the site.
 *
 * Kept here rather than inlined in the footer because four surfaces need it:
 * the footer credit, the About page, the Contact page, and the `publisher`
 * field of the Organization schema. A site with no identifiable operator reads
 * as low-trust to both search quality raters and ad-network reviewers.
 */
export const CREATOR = {
  name: "DailyOrbit Studio",
  domain: "dailyorbitstudio.space",
  email: "dailyorbitstudio@gmail.com",
} as const;
