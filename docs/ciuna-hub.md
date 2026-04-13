# Ciuna Hub — product & technical spec

Consolidated reference for the Hub marketplace: catalog, Office admin, checkout UX (aligned with `/send`), pricing, transactions, and UI walkthroughs.

---

## Implementation plan (build)

Phased delivery; product behavior is defined in §§1–15 below.

| Phase | Scope | Exit criteria |
|-------|--------|----------------|
| **0** | This doc + DB migration | `hub_products` exists; `transactions` extended; RLS for catalog read |
| **1** | Admin APIs + Office `/hub` | CRUD products; nav link |
| **2** | Office `/transactions` + data | Rows with `transaction_source = hub` show as Hub; filter + snapshot in detail |
| **3** | User APIs + `/hub` checkout | Catalog, 3-step flow; `POST /api/hub/checkout` creates txn (server-side FX) |
| **4** | App transactions | `combinedTransactionService` + list/detail badge + Hub section |
| **5** | Hardening | Recompute totals at submit; idempotency key; snapshot on create |

**Schema (Supabase):**

- `hub_products`: `id`, `title`, `short_description`, `long_description`, `category`, `status` (`draft` \| `live` \| `archived`), `pricing_type` (`fixed` \| `user_input`), `fixed_amount`, `fixed_currency`, `default_input_currency`, `fee_percent`, `funded_min`, `funded_max`, `billing_context` (`one_time` \| `recurring` \| null, ops-only), `sla_text`, `internal_notes`, `form_schema` (jsonb), `sort_order`, timestamps.
- `transactions`: `transaction_source` (`send` \| `hub`, default `send`), `hub_product_id` (nullable FK), `hub_snapshot` (jsonb), `hub_fee_amount` (numeric, default 0).

**API surface (web):**

- `GET/POST /api/admin/hub/products`, `GET/PATCH/DELETE /api/admin/hub/products/[id]` — require admin.
- `GET /api/hub/products` — authenticated users; only `live` products.
- `POST /api/hub/checkout` — authenticated; body includes product id, pay currency, funded amount (user input), contact + `formAnswers`; **recomputes** amounts server-side; optional `idempotencyKey`.

**Key repo files:**

| Area | Path |
|------|------|
| Hub fee math | [web/lib/hub-fee.ts](web/lib/hub-fee.ts) |
| Tx create (hub fields) | [web/lib/database.ts](web/lib/database.ts) |
| Combined list | [web/lib/combined-transaction-service.ts](web/lib/combined-transaction-service.ts) |
| Checkout API | [web/app/api/hub/checkout/route.ts](web/app/api/hub/checkout/route.ts) |
| App Hub UI | [web/app/hub/](web/app/hub/) |
| Send detail reuse | [web/app/send/[id]/page.tsx](web/app/send/[id]/page.tsx) |
| Office Hub | [office/app/hub/](office/app/hub/) |
| Office nav | [office/components/layout/office-dashboard-layout.tsx](office/components/layout/office-dashboard-layout.tsx) |
| Office tx data | [office/lib/office-data-store.ts](office/lib/office-data-store.ts), [office/app/transactions/page.tsx](office/app/transactions/page.tsx) |
| Migration | [supabase/migrations/](supabase/migrations/) |

---

## 1. Positioning

- **Ciuna Hub** (`/hub`) is a **mini-marketplace**: users browse services, configure an order, pay through Ciuna, and ops fulfills (reach out, deliver access, run errands, etc.).
- **Audience** includes **foreigners in Russia** (students and similar) who need help with **payments, subscriptions, connectivity, paperwork, and logistics**.
- **Fulfillment pattern**: select product → pay → **team reaches out** / order thread → completion.

---

## 2. Catalog categories


| Category                  | Typical content                                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Logistics & time**      | Document pickup/delivery, queues, notary/MFC runs, embassy courier, print & bind, document photos, small moves, disposal, package hold, forward shipping |
| **Money & subscriptions** | Virtual cards (standard, Apple ID, Google Play, Spotify, cloud), pay-this-invoice, gift-style products, top-up style flows                               |
| **Connectivity**          | VPN (subscription + optional setup help), eSIM / local SIM guidance or assisted order                                                                    |
| **AI & tools**            | ChatGPT, Claude, Gemini, Grok, Midjourney, Kling, Gamma, Higgsfield, etc. — named products with tiers/durations where needed                             |
| **Communication**         | SMS-capable numbers for 2FA, mail scan/hold/forward                                                                                                      |
| **Language & life**       | Russian phone proxy (time boxes), translation / certified / notary chains as packages                                                                    |
| **Bundles**               | Arrival pack, exam week pack, subscription-month pack, digital nomad pack                                                                                |


### Product identifiers (no SKUs; no internal IDs in UI)

- **No SKU codes.** Products are created in Office with **title** (and other fields); the database holds a primary key (typically UUID) for relations and APIs only.
- **App and Office** must **not** show raw UUIDs or other internal primary keys. Surfaces use **product title**, category, dates, and **human-facing transaction references** (same pattern as existing Send money — e.g. the existing `transaction_id` / reference users already see).
- Support and ops triage using **product name + transaction reference + user + time**, not database IDs in the interface.

---

## 3. Office — `/hub` product configuration (data model)

Office is the **source of truth** for catalog and checkout behavior.

- **List:** table of Hub products (filters/search as needed).
- **Create / edit** fields (minimum):
  - Name, description, **category**
  - **Type** (pricing mode):
    - **Fixed price** — funded amount is set in Office; user does not type a base amount.
    - **User input** — user enters how much to fund (see §6).
  - **Fixed price:** price (canonical currency per product policy).
  - **User input:** **fee %** on the funded amount (same *mathematical role* as logistics % on cash-hand in Send: percent of the funded/receive-side basis, then converted to pay currency via corridor); optional later: min/max fee, min/max funded amount. **One-time vs recurring** (if present) is **admin/ops context only** — it does **not** trigger in-app rebilling; see §6.1.
  - Fulfillment: SLA copy, internal notes.
  - **Dynamic form schema** for checkout step 2 (text, URL, select, required flags) — product-specific fields (invoice details, Apple ID email, addresses, time windows, etc.).

---

## 4. Office — admin UX walkthrough (`/hub`)

### 4.1 Hub home — product list

**Purpose:** see everything you sell, jump to edit, filter.

- **Table columns (example):** Name · Category · **Type** (Fixed / User input) · Price or “User amount” · Fee % (if User input) · Status (Draft / Live) · Updated.
- **Row actions:** Edit · Duplicate · Archive / Deactivate (match existing Office patterns).
- **Top bar:** Search, category filter, type filter, **“New product”**.
- **Empty state:** short copy + **Create first product**.

### 4.2 Create / edit product

**Basics**

- Product **name** (customer-facing).
- **Short description** (card + checkout summary).
- **Long description** (optional, detail page).
- **Category** (Logistics, Money, Connectivity, AI, Communication, Language, Bundles).
- **Status:** Draft / Live.
- Optional: hero image / icon.

**Pricing (main fork)**

- **Type:** **Fixed price** | **User input** (segmented control or radios).

**If Fixed price**

- **Amount** + **currency** (canonical price, e.g. USD).

**If User input**

- **Default input currency** (e.g. USD — matches app default).
- **Fee %** (required).
- Optional later: min/max funded amount, min/max fee.
- **One-time vs recurring:** optional labels for **staff** (fulfillment expectations, how you describe the service internally). **Not** a user-facing subscription checkout.

**Checkout fields (app step 2)**

- Dynamic form builder or structured list: **Label** · **Field type** (text, number, URL, select, textarea) · **Required** · **Placeholder** · options for selects.
- **Preview:** “What the user sees on the details step.”

**Fulfillment (internal)**

- **SLA text** (customer-facing, e.g. “We contact you within 24 hours”).
- **Internal notes** (staff only).

**Save**

- **Save draft** · **Publish** (if Draft/Live split).

### 4.3 Optional admin patterns

- **Duplicate product** for sibling listings (e.g. variant copies).
- **Manual sort** for catalog order (if productized).
- **Last edited** metadata (if Office supports it elsewhere).

---

## 5. Office — `/transactions` and Hub orders

- The **Office transactions** page is the **operational view of all paid movements**, including **Send money** and **Hub**.
- **Hub purchases create the same transaction type** as Send (extended with Hub metadata — see §10). They **must appear** in this list so ops/finance see **orders** in one place.
- **Recommended UX:**
  - **Filter or tabs:** All · Send money · **Hub** (or a **Type** column: `send` | `hub`).
  - **Columns (extend existing):** Date · User · **Type** · Amount / currencies · Status · **Hub product title** (when `hub`) · **Transaction reference** (human-facing id — same as Send; not raw DB UUID) · Link to detail.
  - **Row / detail drawer:** show **Hub snapshot** — product, funded amount (if user input), fee breakdown, contact/address, **dynamic form answers**, fulfillment notes.
- **Deep link:** from a Hub product or user record to **their transactions** filtered to Hub.

---

## 6. User-facing Hub UI — amounts & FX (no “You receive” copy)

Hub does **not** need to show Send labels like **“You receive.”** That vocabulary is **internal context** only (same basis as in Send math).

### Shared rules

- All conversion uses **existing `/send` logic**: corridors, rates, transfer fees, and **hub %** where configured.
- The user **never edits** the **converted pay amount** in the selected pay currency. That value is **read-only**.
- The user **can change the pay currency** (picker); the read-only amount **updates** from rates.
- **Internally**, the **funded amount** still plays the same role as the receive-side basis in Send for fee math; **do not expose** that as “You receive” in Hub.

### Fixed-price products

- Show product with a **clear fixed price** (funded amount for the product).
- Show **currency picker** (pay with).
- Show **read-only** amount in that currency = full calculation (rate + corridor fee + hub % if non-zero for that product).

### User-input products

- User enters **how much to fund**; **USD (or team default)** is the default input currency.
- Show **read-only** pay amount in the **selected pay currency**; user **only changes currency** on that side, not the number.
- **Hub %** (Office-configured) applies to the **funded amount** (same basis as logistics % on funded/receive in Send), then rolls into the read-only pay total.

### Optional labels

Use neutral copy: **“Amount,”** **“How much to cover,”** **“Product price,”** **“You’ll pay”** (read-only) — not “You receive.”

### 6.1 Recurring — admin context only; single payment at checkout

- If Office stores **one-time vs recurring**, that is for **admin and ops** (what kind of obligation or follow-up the product implies). It may appear in **Office** and in **transaction snapshot** for support.
- **Checkout always collects one payment per order** — the **first** charge for that purchase. There is **no** in-app recurring billing, dunning, or “next charge” automation in this plan. Later renewals are **out of band** (new order, ops, or other process — not specified here).

---

## 7. App — user UX walkthrough (`/hub`)

### 7.1 Hub discovery — catalog

- **Entry:** nav or home tile → **Hub**.
- **Layout:** category tabs/chips + **grid or list** of product cards.
- **Card:** name · one-line description · **price hint** (fixed: show price; user input: e.g. “You set amount + fee”) · optional category badge.
- **Tap** → product detail.

### 7.2 Product detail

- Title, full description, what’s included, **SLA** from Office.
- **Primary CTA:** **Continue** / **Order** → checkout step 1.

### 7.3 Checkout — step 1: Pay amount (Send-style, Hub rules)

**Fixed price**

- Show **product price** clearly.
- **Pay with:** currency picker.
- **Amount in pay currency:** **read-only** (updates when currency changes).

**User input**

- **Editable:** funded amount (default currency USD or product default).
- **Pay with:** currency picker.
- **Total in pay currency:** **read-only**.

**Shared**

- Optional fee breakdown (corridor fee, hub % line) like Send.
- **Continue** (validate min/max when configured).

### 7.4 Checkout — step 2: Details

**Contact / delivery (Send-like)**

- Name, phone, address, saved-address picker if reused from Send.

**Product fields**

- Render Office **dynamic fields** with validation.

**Continue to payment.**

### 7.5 Checkout — step 3: Pay

- Reuse **Send payment** UI: methods, total, transaction id when generated.
- **Confirm** → success.

### 7.6 Post-pay

- **Confirmation:** order/transaction id, “We’ll reach out,” link to **transaction detail** (see §8).

---

## 8. App — transactions UI: reuse for Hub

- **Reuse the existing app transaction list and transaction detail** for Hub: **one** transactions area for the user, not a separate silo.
- **List rows:** show a **badge or label** (e.g. **Send** vs **Hub**) so users can scan; Hub rows show **product name** (or short title) in addition to amount/status/date.
- **Detail screen:** same layout as Send money detail **extended** with a **Hub section** when `type === hub`:
  - Product name, pricing type (fixed / user input), funded amount if applicable, hub fee line items.
  - **Contact & delivery** snapshot.
  - **Answers** from checkout step 2 (dynamic form).
  - Status / support CTA unchanged where possible.
- **Deep links:** Hub confirmation screen → same **transaction id** route the rest of the app uses.

This keeps **one mental model** (“Transactions”) and avoids duplicating payment history UI.

---

## 9. Checkout flow (app) — summary table


| Step                | Behavior                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Amount & FX** | Currency picker + **read-only** pay total; **fixed** = show product price only; **user input** = editable funded amount (default USD). **No recipient** UI. |
| **2 — Details**     | Same **pattern** as Send cash-hand: name, phone, address, saved addresses. **Plus** product-specific fields from Office.                                    |
| **3 — Pay**         | Same payment UX as Send; generate **transaction id** when entering pay step (same pattern as Send).                                                         |


After successful payment: create a **transaction** equivalent to Send money flow, extended for Hub (below).

---

## 10. Transactions (data model)

- **Core:** same shape as Send (amounts, currencies, rate, fees, user, status, payment reference, etc.).
- **Hub extensions:** e.g. `type: hub`, `hub_product_id` (FK only — never shown raw in UI), line items, **snapshot** of product **title** + contact/address + dynamic form answers, **Type** (fixed vs user input), **funded amount** if user input, **hub fee breakdown**, optional **one-time vs recurring** flag **from product** (ops context only; see §6.1).
- `**recipient_id`:** not used for bank recipient; optional future payee entity.

---

## 11. Fulfillment & ops

- Paid order → **transaction** + **order thread** / ticket.
- **Queue:** by product, SLA, assignee; **templates** per product (or product category) for handoff messages.
- **Payment rail:** same settlement path as Send; reference ties payment to Hub order.
- **Office `/transactions`** is the primary **order list** for ops; filter to Hub when fulfilling marketplace orders.

---

## 12. Engineering notes

- Extract or parameterize Send UI: e.g. `mode: "send" | "hub"`, `showRecipient: false` for Hub.
- **Fee helper:** e.g. `computeHubMoneyFee(fundedAmount, rate, feeType, feePercent)` — mirror `computeLogisticsFee` (percent of funded/receive basis, convert to pay currency with `roundMoney`).
- **Routes:** `/hub` catalog → `/hub/checkout/...` (URL may use an internal id server-side; **do not** display UUID in UI — prefer loading context by id after navigation or use a future slug if added); Office CRUD + public list API for app.
- **App transactions route:** accept Hub payloads; **reuse components** with conditional Hub block (§8).
- **Office transactions API/page:** query includes `type` filter; render Hub columns and detail fields.

---

## 13. Build order

Superseded by the **Implementation plan (build)** at the top of this document; kept as a short reminder:

1. Schema → admin Hub CRUD → Office transactions Hub → user Hub checkout → combined transactions UI → hardening.

---

## 14. Summary


| Layer                      | Responsibility                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| **Office `/hub`**          | Products, Type (fixed vs user input), prices, %, step-2 fields                           |
| **Office `/transactions`** | **All orders** including Hub; filter; detail with Hub snapshot                           |
| **App Hub**                | Catalog; checkout with **read-only pay amount** + **currency picker**                    |
| **App transactions**       | **Same UI as Send**; Hub as labeled rows + extra detail section                          |
| **Engine**                 | `/send` rates/fees + hub % on funded basis                                               |
| **Post-pay**               | Send-like **transaction** + ops fulfillment                                              |
| **Identifiers**            | No SKUs; DB PK (e.g. UUID) **API-only**; UI uses **titles** + **transaction references** |


---

## 15. Gaps & follow-ups (not fully specified yet)

These are **not blockers for v1**, but worth deciding so the plan does not leave blind spots.


| Area                    | What’s missing / open                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Checkout scope**      | Plan assumes **one product per checkout**. **Cart / multi-product** orders (and combined totals) are out of scope unless added later.                                                      |
| **Rate lock**           | **Implemented (v1):** `POST /api/hub/checkout` **recomputes** FX, corridor fee, and Hub fee from live `exchange_rates` at submit time (see Implementation plan). Optional later: warn if client preview diverged. |
| **Payments edge cases** | **Hub idempotency:** optional `idempotencyKey` + unique partial index on `(user_id, reference)` for `HUB:*` references; duplicate submit returns existing transaction. Still align failed/pending/retry UX with Send where applicable. |
| **Refunds & disputes**  | **Refund / partial refund**, cancellation before fulfillment, chargeback handling — policy and whether Office can trigger status + money movement.                                         |
| **Recurring**           | **One-time vs recurring** in Office is **context for admin/ops** only. **Checkout is always a single payment** (first charge for that order); no in-app automated rebilling (see §6.1).    |
| **Logistics geography** | **City / region availability** for errands (hide or flag products not servicable locally) — not in spec.                                                                                   |
| **Catalog lifecycle**   | **Archive / unpublish** product: checkout rejects non-`live` products; **snapshot** on `transactions` preserves title and answers for historical orders.                                                                 |
| **PII & Office access** | Dynamic forms may hold **sensitive data**. Define **retention**, who in Office can see it, and whether to **mask** fields in list views.                                                   |
| **Notifications**       | **Email / push** when payment completes, when ops picks up the order, when fulfilled — not specified.                                                                                      |
| **Support thread**      | “Order thread / ticket” is mentioned; **in-app vs external** (email, Telegram) and link to **transaction reference** should match support tooling.                                         |
| **Trust & policy**      | **Prohibited goods**, SLA disclaimers, or **acknowledgment** checkboxes for certain categories — product/legal as needed.                                                                  |
| **Office RBAC**         | Who can **edit catalog** vs **view transactions / PII** — follow existing Office roles or extend.                                                                                          |
| **Analytics**           | **Hub vs Send** reporting (volume, margin on % products) — optional dashboard later.                                                                                                       |


---

*Last updated — April 2026.*