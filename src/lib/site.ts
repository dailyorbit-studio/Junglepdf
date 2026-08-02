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

/**
 * The studio's public profiles.
 *
 * Two consumers, which is why they live here rather than inline in the footer:
 * the footer icon row, and the `sameAs` array on the Organization schema in
 * layout.tsx. `sameAs` is how a search engine ties this site to the accounts
 * that operate it — it is the field behind knowledge-panel association, and an
 * identifiable operator is something both ad-network reviewers and search
 * quality raters look for.
 *
 * JunglePDF has no accounts of its own; these are the studio's, and pointing at
 * them is more honest than inventing empty product profiles.
 */
export const SOCIAL_LINKS = [
  { label: "X", href: "https://x.com/dailyorbit_std" },
  { label: "Instagram", href: "https://www.instagram.com/dailyorbit_std" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/dailyorbit-studio" },
] as const;
