/**
 * PORTOFINO — central commercial state. THE ONLY PLACE that decides whether the store sells.
 *
 *   PRELAUNCH = true,  COMMERCE_ENABLED = false   → public showcase, no purchases (default)
 *   PRELAUNCH = false, COMMERCE_ENABLED = true    → official operation
 *
 * The value is fixed at BUILD time from the `VITE_STORE_MODE` environment variable set on the
 * hosting platform (see docs/OFFICIAL-LAUNCH-PROTOCOL.md). It is compiled into the bundle, so a
 * visitor cannot switch it from the browser; changing it requires access to the hosting project
 * (the administrator) and a new deploy. Anything other than the exact value "live" resolves to
 * pre-launch: the system fails closed.
 *
 * `resolveStoreState` has no browser dependencies on purpose: the future commerce backend
 * (orders, payments, webhooks) must import the same function with its own server-side
 * STORE_MODE variable and refuse every commercial request while COMMERCE_ENABLED is false.
 */
export type StoreMode = "prelaunch" | "live";
export type StoreState = Readonly<{ MODE: StoreMode; PRELAUNCH: boolean; COMMERCE_ENABLED: boolean }>;

export function resolveStoreState(raw: string | undefined | null): StoreState {
  const live = typeof raw === "string" && raw.trim() === "live";
  const state: StoreState = Object.freeze({ MODE: live ? "live" : "prelaunch", PRELAUNCH: !live, COMMERCE_ENABLED: live });
  // Consistency guard: the two flags must always be opposite.
  if (state.PRELAUNCH === state.COMMERCE_ENABLED) throw new Error("Invalid store state");
  return state;
}

export const STORE: StoreState = resolveStoreState(import.meta.env.VITE_STORE_MODE);

export class CommerceDisabledError extends Error {
  constructor(action: string) {
    super(`Commerce is disabled (pre-launch): ${action} refused.`);
    this.name = "CommerceDisabledError";
  }
}

/** Call at the start of every commercial action (add to bag, checkout, order, payment). */
export function assertCommerce(action: string): void {
  if (!STORE.COMMERCE_ENABLED) throw new CommerceDisabledError(action);
}

/** Public, non-secret site settings. Empty values are reported as pending in the launch panel. */
export const SITE = Object.freeze({
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? "",
  instagram: (import.meta.env.VITE_INSTAGRAM_URL as string | undefined) ?? "",
  contactEmail: (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? "",
  newsletterEndpoint: (import.meta.env.VITE_NEWSLETTER_ENDPOINT as string | undefined) ?? "",
  includeAdmin: import.meta.env.VITE_INCLUDE_ADMIN === "true",
  router: (import.meta.env.VITE_ROUTER as string | undefined) === "browser" ? "browser" : "hash",
});
