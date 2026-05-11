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

**Russia + priority bridge fiats (Tier A / B):** Step A can be **disabled** so **`B' = BUY`** and **`S' = SELL`** exactly—p2p.army means stay the input to margin with **no mid compression**. Use this when corridors like **RUB↔NGN** need full supplier spread before the 5% bridge. Other tiers may keep Step A to damp bad prints.

---

## 5. Step B — Ciuna strict 5% USDT bridge (margin)

```text
ciuna_buy_raw(X)  = B'(X) × 1.05
ciuna_sell_raw(X) = S'(X) × 0.95
```

- **User buys USDT** with `X`: priced off **`ciuna_buy`**.
- **User sells USDT** for `X`: priced off **`ciuna_sell`**.

---

## 6. Step C — Minimum post-margin wedge (no inverted retail book)

Aggregates + ±5% can yield **`ciuna_buy_raw < ciuna_sell_raw`**, which is awkward for a broker-like quote. Enforce a minimum relative wedge **`m`** (tier table §8).

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

Apply **asymmetric caps** from the tier table (`cap_buy`, `cap_sell`):

```text
ciuna_buy(X)  = min(ciuna_buy(X),  mid_c(X) × (1 + cap_buy))
ciuna_sell(X) = max(ciuna_sell(X), mid_c(X) × (1 - cap_sell))
```

If a cap binds, re-check Step C if needed (in practice, rare if parameters are consistent).

---

## 8. Tier parameters (starter values)

Adjust after live stats (conversion, depth, complaints). Priority corridors: **RUB** (always) and **NGN, USD, EUR, KES, GHS**.

| Tier | Currencies | Pull band **b** (± vs mid, pre-margin) | Min wedge **m** (post ±5%) | **cap_buy** (vs `mid_c`) | **cap_sell** (vs `mid_c`) |
|------|------------|----------------------------------------|-----------------------------|---------------------------|----------------------------|
| **A – Russia rail** | **RUB** | **1.0%** (unused if Step A off) | **0.75%** | **1.25%** | **1.75%** |
| **B – African retail** | **NGN, KES, GHS** | **1.5%** (unused if Step A off) | **0.50%** | **1.50%** | **2.00%** |
| **C – Global legs** | **USD, EUR** | **0.25%** | **0.20%** | **0.40%** | **0.60%** |

**Other fiats:** default to **Tier B** unless liquidity is clearly spot-like (use **Tier C**) or a dedicated rail policy exists.

**USD note:** If you use **USDTUSD** spot as the USD leg instead of p2p.army, keep **Tier C** caps; document the chosen `BUY`/`SELL` convention (often both ≈ spot with tiny spread).

---

## 9. End-to-end checklist (each rate refresh)

1. Open `https://p2p.army/en/p2p/fiats/[CURRENCY]` (or your approved primary feed if USD is spot).
2. Record **`BUY`** and **`SELL`** for **USDT** with consistent rounding policy.
3. Compute **`mid`**, apply **Step A** (`B'`, `S'`) with tier **`b`** — **or** use raw **`B'=BUY`, `S'=SELL`** when Step A is off for that currency (Tier A/B in production sync).
4. Apply **Step B** (×1.05 / ×0.95).
5. Apply **Step C** (minimum wedge **`m`**).
6. Apply **Step D** (**`cap_buy` / `cap_sell`**).
7. For every active pair, compute **`rate(X→Y) = ciuna_sell(Y) / ciuna_buy(X)`**.
8. Spot-check **RUB legs** on inbound/outbound flows (highest scrutiny).

---

## 10. Monthly review

| Signal | Likely action |
|--------|----------------|
| Quotes vs competitors consistently **too generous** | Tighten **`b`** or **`cap_*`** slightly. |
| **Conversion** drops / quotes “too wide” | Loosen **`b`** a little, or relax **`cap_buy`** on the suffering leg. |
| Rare currencies still “inverted” after Step C | Raise **`m`** only for those currencies. |

---

## 11. Quick reference — symbols

| Symbol | Meaning |
|--------|--------|
| `BUY`, `SELL` | p2p.army visitor legs (fiat per 1 USDT). |
| `mid` | \((BUY + SELL) / 2\). |
| `B'`, `S'` | BUY/SELL after pull toward mid. |
| `ciuna_buy_raw`, `ciuna_sell_raw` | After ±5%, before wedge/caps. |
| `ciuna_buy`, `ciuna_sell` | Final published legs. |
| `mid_c` | Mid of final Ciuna legs (for caps). |

---

*Last consolidated from internal policy discussion. Update tier numbers here when finance/product approves changes.*
