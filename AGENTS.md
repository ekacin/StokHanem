# AGENTS.md

## Must-Follow Constraints

- **Barcode/QR scanning must use the device camera via browser API** (`getUserMedia` + a scanning library such as `zxing-js` or `html5-qrcode`). Native app wrappers are out of scope.
- **Product lookup on scan must call an external product database API** (e.g., Open Food Facts, UPC Item DB) to auto-populate product details before adding to stock. Never add a product with only a barcode and no metadata.
- **All authentication must be session/token-based** (JWT preferred). No route — including stock read endpoints — is accessible without a valid session.
- **Low-stock alerts must be evaluated server-side** on every stock mutation (add/update/delete). Do not rely on client-side threshold checks.
- **Stock quantity must never go negative.** Enforce this constraint at the database level (CHECK constraint) and in the service layer.
- **The app is centrally hosted** (single server). Do not design for offline-first or local-only storage.

## Validation Before Finishing

- All API endpoints must return appropriate HTTP status codes (401 for unauthenticated, 422 for validation errors, not generic 400/500).
- Scanner feature must be tested on a real mobile browser (Chrome for Android / Safari iOS) — desktop-only testing is insufficient.
- Run full auth flow: login → scan → product fetch → stock save → alert trigger.

## Repo-Specific Conventions

- **Frontend routes:** `/login`, `/dashboard`, `/stock/add`, `/stock/:id/edit`, `/alerts`
- **Backend modules:** `auth`, `stock`, `product-lookup`, `alerts` — keep these strictly separated; no cross-module direct DB calls.
- **Product lookup is a network call** and must be wrapped with a timeout (≤3 s) and a fallback to manual entry if the external API fails or returns no result.
- Alert thresholds are per-product and stored in the DB alongside stock records. There is no global threshold.

## Important Locations

- `src/scanner/` — camera + barcode/QR decoding logic (do not scatter scanner code elsewhere)
- `src/alerts/` — alert evaluation logic and notification dispatch
- `src/auth/` — JWT issue/verify/refresh; middleware lives here

## Change Safety Rules

- **Do not change the stock mutation API contract** (request/response shape) without updating all consumers and incrementing the API version.
- Alert notification logic must not block the stock mutation response. Use async dispatch (queue or background job).
- Login session expiry and refresh token behavior must remain consistent — changing token TTLs requires updating both server config and client refresh logic simultaneously.

## Known Gotchas

- `getUserMedia` requires HTTPS in production. Local dev behind HTTP will silently fail on real devices.
- Some external product APIs throttle by IP. Add rate-limit handling and do not expose raw API keys to the client.
- QR codes on product packaging may encode a URL, not a bare barcode number — the scanner must handle both formats and extract the product identifier correctly.
