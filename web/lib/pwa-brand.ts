/**
 * Single source of truth for app icons used by the Web App Manifest and HTML metadata.
 *
 * **To update PWA / home-screen icons:**
 * - **Option A — hosted URL:** Put PNGs on a public HTTPS host (e.g. Supabase storage) and set
 *   `PWA_APP_ICON_URL` to the **192×192** or **512×512** asset (square PNG). Manifest lists the same
 *   URL for multiple `sizes` entries today; for best results provide a 512×512 master and optional
 *   maskable variant (safe zone for `purpose: "maskable"`).
 * - **Option B — repo:** Add files under `public/` (e.g. `/icons/app-192.png`, `/icons/app-512.png`)
 *   and set this constant to `https://app.ciuna.com/icons/app-512.png` (absolute URL is safest for
 *   manifest `icons[].src` across origins).
 *
 * After changing, redeploy and hard-refresh; users may need to re-add to home screen to see the new icon.
 */
export const PWA_APP_ICON_URL =
  "https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/ciuna%20pwa%20icon.png"
