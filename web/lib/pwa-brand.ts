/**
 * Brand icon URLs (Supabase public storage).
 *
 * **`SITE_FAVICON_URL`** — Browser tab favicon and `shortcut` in [`app/layout.tsx`](../app/layout.tsx).
 * Use the dedicated favicon asset (not the PWA master).
 *
 * **`PWA_APP_ICON_URL`** — Web App Manifest ([`app/manifest.ts`](../app/manifest.ts)) and optional
 * `apple` touch icon when you want the home-screen / install art to match the PWA icon.
 */

/** Tab favicon (distinct from the larger PWA install icon). */
export const SITE_FAVICON_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Ciuna%20favicon.png"

/**
 * PWA / “add to home screen” icon (192–512px square PNG). Used by the manifest only; do not use
 * for the default favicon unless you intentionally want one asset for both.
 */
export const PWA_APP_ICON_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/ciuna%20pwa%20icon.png"
