# LedgerLens UX & Document Intelligence Design Specification

> **Parent Specification**: This document extends [x:\Products\DESIGN.md](file:///x:/Products/DESIGN.md).  
> All global design tokens (Inter typography scale, 6px `rounded-md` controls, 8px `rounded-lg` cards, 1px structural borders, and monochrome-first palette) are inherited directly from the root design system.

---

## 1. Domain Purpose & Role

LedgerLens (internal slug: `cevondocs`) is a **multi-provider AI vision document intelligence and validation platform**. It extracts structured financial records from receipt and invoice images, runs rule-based mathematical and schema validations, applies PII screening and cryptographic watermarking, and provides a human-in-the-loop review workflow for low-confidence or anomalous documents.

The interface prioritizes **side-by-side visual verification, arithmetic transparency, and rapid human recalibration**.

---

## 2. Document Inspector & Split-Pane Layout

The central workspace of LedgerLens is the **Split-Pane Review Workspace** (`ReviewTab.tsx`):

### 2.1 Workspace Geometry
* **Grid Layout**: 2-column split layout on desktop (`grid-cols-1 lg:grid-cols-12 gap-6`).
  * **Document Queue / Sidebar**: 3 columns (`lg:col-span-3`) listing documents requiring review.
  * **Document Preview Pane**: 4 columns (`lg:col-span-4`) rendering the high-resolution source document image.
  * **Extraction & Recalibration Pane**: 5 columns (`lg:col-span-5`) containing the editable financial schema form.

### 2.2 Document Image Preview
* **Canvas**: Fixed-aspect ratio container with pan/zoom support (`bg-[#0b0f19]` with 1px border `rgba(255, 255, 255, 0.08)`).
* **Provenance Toggle**: Segmented control switching between:
  * `Watermarked (Tamper-Evident)`: Displays cryptographic provenance watermark stamp.
  * `Original`: Displays raw uploaded source image for visual comparison.
* **Aspect Preservation**: Uses `object-contain` to prevent distortion of receipts or invoices.

---

## 3. Confidence Metrics & Validation Indicators

LedgerLens surfaces extraction certainty directly adjacent to extracted fields to facilitate rapid human verification.

### 3.1 Confidence Scoring
* **Overall Document Confidence**: Displayed as a percentage badge in the inspector header:
  * `High (>= 90%)`: `text-emerald-400 bg-emerald-500/10 border-emerald-500/20`
  * `Medium (70% - 89%)`: `text-amber-400 bg-amber-500/10 border-amber-500/20`
  * `Low (< 70%)`: `text-red-400 bg-red-500/10 border-red-500/20` (Triggers automatic review queue routing).
* **Field-Level Confidence**: Small indicator dots adjacent to numeric fields requiring operator confirmation.

### 3.2 Rule-Based Validation Alerts
When extraction values fail mathematical or logical consistency checks, prominent inline warning cards appear:
* **Math Mismatch Warning**: Triggered when `Subtotal + Tax != Total`:
  * Styling: `bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-md text-xs flex items-center gap-2`.
* **Missing Field Alert**: Triggered when mandatory invoice numbers or dates are unextracted.
* **PII Detection Chip**: Indicates presence of redacted tax IDs or credit card numbers.

---

## 4. Review Queue & Operational States

Documents transition through four canonical operational states:

| Status | Meaning | Badge Styling |
|---|---|---|
| `PENDING_REVIEW` | Extracted but flagged by validation or low confidence | `bg-amber-500/10 text-amber-400 border-amber-500/20` |
| `VALIDATED` | Passed all mathematical rules and confidence thresholds | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` |
| `FLAGGED` | Failed safety screening or irreconcilable totals | `bg-red-500/10 text-red-400 border-red-500/20` |
| `APPROVED` | Verified and committed by human reviewer | `bg-blue-500/10 text-blue-400 border-blue-500/20` |

---

## 5. Line-Item Editor UX

The line-items table enables dense, rapid tabular editing:
* **Table Architecture**: Compact row height (`py-1.5 px-2`), tabular numerals (`font-mono tabular-nums`).
* **Columns**: `Description` (flexible width), `Qty` (narrow), `Unit Price` (currency formatted), `Amount` (auto-calculated).
* **Actions**: Add Row (`+ Add Item`), Delete Row (`Trash` icon button), Recalculate Totals button.
* **Keyboard Navigation**: Pressing `Tab` cycles sequentially through editable cells.

---

## 6. Alignment with Root Design Rules

LedgerLens implements the shared CevonX design standards:
1. **Control Radius**: All buttons, form inputs, and queue cards adhere strictly to `rounded-md` (6px).
2. **Card Surfaces**: Outer containers adhere to `rounded-lg` (8px). (Legacy 16px cards from early prototypes will migrate to `rounded-lg` during routine maintenance).
3. **Typography**: Clean `Inter` font stack with monospace numeric fields (`font-mono tabular-nums`).
4. **No Pill Buttons**: Normal action buttons (`Approve & Commit`, `Flag for Manual Audit`) use `rounded-md`.
