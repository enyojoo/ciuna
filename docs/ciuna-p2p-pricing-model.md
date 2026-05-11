# Ciuna P2P pricing model (USDT bridge)

**Status:** Active policy for new rates and reviews.  
**Supplier reference:** [P2P.army fiat pages](https://p2p.army/en/p2p/fiats/) — `https://p2p.army/en/p2p/fiats/[CURRENCY]` (e.g. `NGN`, `RUB`, `GHS`).

---

## 1. Product flow (always two hops)

All quoted crosses assume routing through USDT:

- **Outbound (e.g. Russia → world):** `RUB → USDT → other` (e.g. NGN).
- **Inbound (e.g. world → Russia):** `other → USDT → RUB` (e.g. GHS → USDT → RUB).

**Cross-rate formula** (same for any `X → Y`):

```text
rate(X → Y) = ciuna_sell(Y) / ciuna_buy(X)
```

Meaning: **1 unit of X = rate units of Y**, matching the platform’s `exchange_rates` convention.

- **Leg 1:** Customer **acquires USDT** with `X` → use **`ciuna_buy(X)`** (fiat per 1 USDT).
- **Leg 2:** Customer **disposes of USDT** into `Y` → use **`ciuna_sell(Y)`** (fiat per 1 USDT).

---

## 2. Supplier inputs from p2p.army (semantics)

On each fiat page, use the **BUY** and **SELL** section averages for **USDT** (as shown in the aggregate tables).

| Label | Meaning |
|--------|---------|
| **BUY** | Fiat **per 1 USDT** when the **visitor buys USDT** with that fiat (makers sell USDT). |
| **SELL** | Fiat **per 1 USDT** when the **visitor sells USDT** for that fiat (makers buy USDT). |

**Important:** For some currencies (`RUB`, `RWF`, …), **numeric BUY can be lower than SELL**. That can be valid in aggregated books. **Do not swap** BUY/SELL to force one above the other **before** the pipeline below.

**Operational note:** Use the **same numbers** you’ll publish internally (single rounding chain). If you round `BUY`/`SELL` for display, recompute all downstream steps from those rounded values so tables and matrices never disagree.

---

## 3. Reference mid (midmarket anchor)

For each currency `X`:

```text
mid(X) = (BUY(X) + SELL(X)) / 2
```

All “near midmarket” rules below are defined relative to `mid(X)` unless stated otherwise.

---

## 4. Step A — Pull legs toward mid (pre-margin)

Controls outliers while staying **near** aggregated mid. Let **`b`** be the **pull band** from the tier table (§8).

```text
B'(X) = mid(X) + clamp(BUY(X)  - mid(X), -b × mid(X), +b × mid(X))
S'(X) = mid(X) + clamp(SELL(X) - mid(X), -b × mid(X), +b × mid(X))
```

`clamp(x, lo, hi) = min(max(x, lo), hi)`.

**Current implementation:** **`b = 0`** for **all** currencies — **B′ = BUY** and **S′ = SELL** (no pull toward mid; p2p.army / supplier legs used directly before Step B).

---

## 5. Step B — Ciuna USDT bridge (margin)

**Single knob (code):** **`CIUNA_BRIDGE_MARGIN`** in `packages/rate-sync/src/pricing-model.ts` — default **4.5%** (`0.045`). Change **only this constant** to widen or tighten EM retail vs naive mid; **√** multipliers and **Step D** caps derive from it (**`cap_* = CIUNA_BRIDGE_MARGIN + CAP_BUFFER`**, default **`CAP_BUFFER = 0`** → **4.5%** caps).

**Tier A (USD only):** **`buyMult = sellMult = 1`** — pass through **B′/S′** (no Step B on the dollar leg). **USDT** is dollar-denominated; **USD** is the anchor leg so margin is not double-stacked on both sides of the bridge vs naive mid.

**Tier B (all non-USD fiats — RUB, EUR, NGN, …):** apply **half** the target skew **per leg** (let bridge margin **s** = **`CIUNA_BRIDGE_MARGIN`**):

| | `ciuna_buy_raw` | `ciuna_sell_raw` |
|--|-----------------|------------------|
| Formula | B′ × **√(1 + s)** | S′ × **√(1 − s)** |
| at **s = 4.5%** | B′ × **1.022252** | S′ × **0.977241** |

So for a cross **X → Y** with **both** legs in tier **B** (all **√**):

```text
rate ∝ (√(1−s) · S'(Y)) / (√(1+s) · B'(X))
```

which is **one** effective **~s** retail layer vs a naive USDT mid on the bridge (e.g. **√0.955/√1.045 ≈ 0.9560** at **s = 4.5%**), not **two** (**0.955/1.045 ≈ 0.9139** from stacking **(1+s)/(1−s)** on **both** legs).

For **USD (tier A) → B**, only the **B** leg uses **√** multipliers; the **USD** leg stays at **1**. **EUR ↔ RUB**, **EUR ↔ NGN**, etc. are **B ↔ B** — both legs use **√**.

```text
ciuna_buy_raw(X)  = B'(X) × buyMult
ciuna_sell_raw(X) = S'(X) × sellMult
```

- **User buys USDT** with `X`: priced off **`ciuna_buy`**.
- **User sells USDT** for `X`: priced off **`ciuna_sell`**.

---

## 6. Step C — Minimum post-margin wedge (no inverted retail book)

Aggregates + Step B can yield **`ciuna_buy_raw < ciuna_sell_raw`**, which is awkward for a broker-like quote. Enforce a minimum relative wedge **`m`** (tier table §8).

If `ciuna_buy_raw(X) < ciuna_sell_raw(X) × (1 + m)` then:

```text
ciuna_buy(X)  = ciuna_sell_raw(X) × (1 + m)
ciuna_sell(X) = ciuna_sell_raw(X)
```

Otherwise:

```text
ciuna_buy(X)  = ciuna_buy_raw(X)
ciuna_sell(X) = ciuna_sell_raw(X)
```

---

## 7. Step D — Customer protection caps vs working mid

Define:

```text
mid_c(X) = (ciuna_buy(X) + ciuna_sell(X)) / 2
```

Apply **caps** from the tier table (`cap_buy`, `cap_sell`). **Important:** caps must not be tighter than your **effective** Step B skew, or they **pull published rates back toward `mid_c`** and erase the retail skew. **Implementation:** **`cap_buy = cap_sell = CIUNA_BRIDGE_MARGIN + CAP_BUFFER`** (default **`CAP_BUFFER = 0`** → **4.5%** each side at default **4.5%** margin). **Tier B** uses **√** multipliers per leg, so per-leg departure from **B′/S′** is ~**half** the one-leg skew before wedge/caps.

```text
ciuna_buy(X)  = min(ciuna_buy(X),  mid_c(X) × (1 + cap_buy))
ciuna_sell(X) = max(ciuna_sell(X), mid_c(X) × (1 - cap_sell))
```

If a cap binds, re-check Step C if needed (in practice, rare if parameters are consistent).

**Lowering `cap_buy` / `cap_sell` (e.g. below `CIUNA_BRIDGE_MARGIN`):** Step D then **pulls final legs back toward `mid_c`** when limits bind — **worse for Ciuna’s spread**, often **better for the customer**. Avoid caps **well below** your Step B skew (e.g. **0.5%**) or margin collapses again. **Default:** caps **equal** **`CIUNA_BRIDGE_MARGIN`** (no buffer), so they sit **at** the target skew — caps may bind **more often** than with a positive buffer.

---

## 8. Tier parameters (starter values)

Adjust after live stats (conversion, depth, complaints). Priority corridors: **RUB** (always) and **NGN, USD, EUR, KES, GHS**.

| Tier | Currencies | Pull **b** (pre-margin) | Min wedge **m** (post Step B; §6) | Step B (buy / sell) | **cap_buy** | **cap_sell** |
|------|------------|-------------------------|-----------------------------------|---------------------|-------------|--------------|
| **A – USD anchor** | **USD** | **0** | **0.20%** | **×1 / ×1** (no skew on leg) | **4.5%** | **4.5%** |
| **B – All other fiats** | **RUB, EUR, NGN, …** (every code except **USD**) | **0** | **0.50%** | **√(1+s) / √(1−s)** with **s** = **`CIUNA_BRIDGE_MARGIN`** | same | same |

**Codes:** **`TierName`** in code is only **`"A"`** | **`"B"`** — **USD → A**, **everything else → B** (sanity naming: one anchor, one broad market bucket).

**Tuning:** change **`CIUNA_BRIDGE_MARGIN`** only; **√** Step B (tier **B**) and **shared caps** follow automatically. **Min wedge `m`** (§6) and **pull `b`** stay per tier until you promote them to config.

**Caps (Step D):** **`cap_buy = cap_sell = CIUNA_BRIDGE_MARGIN + CAP_BUFFER`** vs `mid_c` — see §7. Default **`CAP_BUFFER = 0`** ( **4.5%** ). Add slack with a positive **`CAP_BUFFER`** in `pricing-model.ts` if caps should sit above margin.

**Debug / measurement:** set env **`RATE_SYNC_DEBUG=1`** on the sync process (CLI: `npm run sync:debug -w @ciuna/rate-sync`). Each currency logs one JSON line to stderr with supplier inputs, **B′/S′**, tier knobs, and final legs.

**USD (tier A):** **B′/S′** pass through Step B (**×1**); **`m`** and **caps** still apply in Steps C/D.

---

## 9. End-to-end checklist (each rate refresh)

1. Open `https://p2p.army/en/p2p/fiats/[CURRENCY]` (or your approved primary feed if USD is spot).
2. Record **`BUY`** and **`SELL`** for **USDT** with consistent rounding policy.
3. Compute **`mid`**, apply **Step A** (`B'`, `S'`) with tier **`b`** (**`b = 0` → no pull**, raw BUY/SELL).
4. Apply **Step B** (tier **buyMult / sellMult** — see §5).
5. Apply **Step C** (minimum wedge **`m`**).
6. Apply **Step D** (**`cap_buy` / `cap_sell`**).
7. For every active pair, compute **`rate(X→Y) = ciuna_sell(Y) / ciuna_buy(X)`**.
8. Spot-check **RUB legs** on inbound/outbound flows (highest scrutiny).

---

## 10. Monthly review

| Signal | Likely action |
|--------|----------------|
| Quotes vs competitors consistently **too generous** | Lower **`CIUNA_BRIDGE_MARGIN`** slightly (caps follow). Or tighten **`b`** / **`m`** per tier. |
| **Conversion** drops / quotes “too wide” | Raise **`CIUNA_BRIDGE_MARGIN`**, or relax **`cap_*`** by increasing **`CAP_BUFFER`**. |
| Rare currencies still “inverted” after Step C | Raise **`m`** only for those currencies. |

---

## 11. Quick reference — symbols

| Symbol | Meaning |
|--------|--------|
| `BUY`, `SELL` | p2p.army visitor legs (fiat per 1 USDT). |
| `mid` | \((BUY + SELL) / 2\). |
| `B'`, `S'` | BUY/SELL after pull toward mid. |
| `ciuna_buy_raw`, `ciuna_sell_raw` | After Step B multipliers, before wedge/caps. |
| `ciuna_buy`, `ciuna_sell` | Final published legs. |
| `mid_c` | Mid of final Ciuna legs (for caps). |

---

*Last consolidated from internal policy discussion. Update tier numbers here when finance/product approves changes.*
