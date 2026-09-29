"""
Shared Normalization Layer for CevonDocs Multi-Provider Extraction System.
Standardizes provider JSON outputs, line item aliases, and calculations prior to Pydantic validation.

==================================================
CONFIDENCE SCORING POLICY
==================================================
Confidence scores communicate reliability based on HOW each field value was obtained:
- EXPLICIT_EXTRACTED (0.95 - 0.99): Directly extracted by the vision AI model from legible text.
- STRONG_OCR          (0.90)       : Derived from high-confidence OCR text detection.
- COMPUTED            (0.80 - 0.85): Deterministically computed (e.g., amount = quantity * unit_price).
- NORMALIZED          (0.75)       : Mapped from provider key aliases (e.g., price -> unit_price).
- SCHEMA_REQUIRED     (0.50)       : Structural fallback inserted solely for Pydantic type bounds.
- MISSING             (0.00)       : Unavailable or unextracted business field.

==================================================
DATA PROVENANCE POLICY
==================================================
Each normalized field internally retains its origin in `_provenance`:
- EXTRACTED : Directly extracted from vision model payload.
- COMPUTED  : Mathematically derived (e.g., amount = quantity * unit_price).
- NORMALIZED: Aliased key mapped (e.g., price -> unit_price).
- DEFAULTED : Missing in raw payload and set to default value.
"""

import re
from typing import Any

CONFIDENCE_TIERS = {
    "EXPLICIT_EXTRACTED": 0.94,
    "STRONG_OCR": 0.88,
    "COMPUTED": 0.82,
    "NORMALIZED": 0.75,
    "SCHEMA_REQUIRED": 0.50,
    "MISSING": 0.00,
}

CONF_FIELDS = [
    "vendor_confidence",
    "invoice_number_confidence",
    "date_confidence",
    "currency_confidence",
    "subtotal_confidence",
    "discount_confidence",
    "shipping_confidence",
    "tax_confidence",
    "tip_confidence",
    "total_confidence",
]

FIELD_DEFAULTS = {
    "vendor": ("", CONFIDENCE_TIERS["MISSING"]),
    "invoice_number": ("", CONFIDENCE_TIERS["MISSING"]),
    "date": ("", CONFIDENCE_TIERS["MISSING"]),
    "currency": ("", CONFIDENCE_TIERS["MISSING"]),
    "subtotal": (0.0, CONFIDENCE_TIERS["MISSING"]),
    "discount": (0.0, 1.0),
    "shipping": (0.0, 1.0),
    "tax": (0.0, CONFIDENCE_TIERS["MISSING"]),
    "tip": (0.0, 1.0),
    "total": (0.0, CONFIDENCE_TIERS["MISSING"]),
}


def _clean_amount(val: Any, default: float = 0.0) -> float:
    """Sanitizes monetary string or number into float."""
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        cleaned = re.sub(r"[^\d.-]", "", val.replace("(", "-").replace(")", "").strip())
        try:
            return float(cleaned)
        except ValueError:
            return default
    return default


def track_field_provenance(raw_data: dict, normalized_data: dict) -> dict:
    """
    Attaches internal provenance metadata tracking the origin of each field:
    - EXTRACTED : Directly extracted from vision model payload.
    - COMPUTED  : Mathematically derived (e.g., amount = quantity * unit_price).
    - NORMALIZED: Aliased key mapped (e.g., price -> unit_price).
    - DEFAULTED : Missing in raw payload and set to default value.
    """
    provenance = {}

    top_fields = [
        "vendor", "invoice_number", "date", "currency",
        "subtotal", "discount", "shipping", "tax", "tip", "total"
    ]
    for field in top_fields:
        if field in raw_data and raw_data[field] is not None and raw_data[field] != "":
            provenance[field] = "EXTRACTED"
        else:
            provenance[field] = "DEFAULTED"

    items_provenance = []
    raw_items = raw_data.get("line_items", [])
    norm_items = normalized_data.get("line_items", [])

    for idx, norm_item in enumerate(norm_items):
        item_prov = {}
        raw_item = raw_items[idx] if isinstance(raw_items, list) and idx < len(raw_items) and isinstance(raw_items[idx], dict) else {}

        # description
        item_prov["description"] = "EXTRACTED" if raw_item.get("description") else "DEFAULTED"
        # quantity
        item_prov["quantity"] = "EXTRACTED" if raw_item.get("quantity") is not None else "DEFAULTED"

        # unit_price
        if raw_item.get("unit_price") is not None:
            item_prov["unit_price"] = "EXTRACTED"
        elif raw_item.get("price") is not None:
            item_prov["unit_price"] = "NORMALIZED"
        else:
            item_prov["unit_price"] = "DEFAULTED"

        # amount
        if raw_item.get("amount") is not None:
            item_prov["amount"] = "EXTRACTED"
        elif item_prov["unit_price"] in ("EXTRACTED", "NORMALIZED") and item_prov["quantity"] in ("EXTRACTED", "DEFAULTED"):
            item_prov["amount"] = "COMPUTED"
        else:
            item_prov["amount"] = "DEFAULTED"

        items_provenance.append(item_prov)

    provenance["line_items"] = items_provenance
    normalized_data["_provenance"] = provenance
    return normalized_data


def normalize_confidence_fields(data: dict) -> dict:
    """
    Ensures all top-level field confidence scores exist and fall within [0.0, 1.0].
    Preserves distinction between extracted, computed, normalized, and missing values.
    """
    for field_name in CONF_FIELDS:
        base_field = field_name.replace("_confidence", "")
        base_val = data.get(base_field)
        val = data.get(field_name)

        # Missing or empty value check
        if base_val is None or base_val == "":
            data[field_name] = CONFIDENCE_TIERS["MISSING"]
        elif val is None or not isinstance(val, (int, float)):
            data[field_name] = CONFIDENCE_TIERS["EXPLICIT_EXTRACTED"]
        else:
            data[field_name] = max(0.0, min(1.0, float(val)))
    return data


def normalize_line_items(data: dict) -> dict:
    """
    Standardizes line_items array:
    - Converts alias 'price' -> 'unit_price' (assigns NORMALIZED tier: 0.75)
    - Computes missing 'amount' = quantity * unit_price (assigns COMPUTED tier: 0.82)
    - Preserves missing status without inventing vendor or item names.
    """
    items = data.get("line_items")
    if not isinstance(items, list):
        data["line_items"] = []
        return data

    normalized_items = []
    for item in items:
        if not isinstance(item, dict):
            continue

        item_copy = dict(item)

        # Description (No fabrication: default to "" if missing)
        if not item_copy.get("description"):
            item_copy["description"] = ""

        # Quantity
        qty_val = item_copy.get("quantity")
        try:
            qty = float(qty_val) if qty_val is not None else 1.0
        except (ValueError, TypeError):
            qty = 1.0
        item_copy["quantity"] = qty

        # Unit Price & Alias Mapping (price -> unit_price)
        unit_price_val = item_copy.get("unit_price")
        price_alias = item_copy.get("price")
        has_unit_price = unit_price_val is not None
        has_price_alias = price_alias is not None

        if has_unit_price:
            try:
                u_price = float(unit_price_val)
            except (ValueError, TypeError):
                u_price = 0.0
            item_conf = CONFIDENCE_TIERS["EXPLICIT_EXTRACTED"]
        elif has_price_alias:
            try:
                u_price = float(price_alias)
            except (ValueError, TypeError):
                u_price = 0.0
            item_conf = CONFIDENCE_TIERS["NORMALIZED"]
        else:
            u_price = 0.0
            item_conf = CONFIDENCE_TIERS["MISSING"]

        item_copy["unit_price"] = u_price

        # Amount Calculation (derive mathematically ONLY)
        amount_val = item_copy.get("amount")
        if amount_val is not None:
            try:
                item_copy["amount"] = float(amount_val)
            except (ValueError, TypeError):
                item_copy["amount"] = round(qty * u_price, 2)
        else:
            item_copy["amount"] = round(qty * u_price, 2)
            if item_conf == CONFIDENCE_TIERS["EXPLICIT_EXTRACTED"]:
                item_conf = CONFIDENCE_TIERS["COMPUTED"]

        # Line Item Confidence Score
        provided_conf = item_copy.get("confidence")
        if provided_conf is not None and isinstance(provided_conf, (int, float)):
            item_copy["confidence"] = max(0.0, min(1.0, float(provided_conf)))
        else:
            item_copy["confidence"] = item_conf

        normalized_items.append(item_copy)

    data["line_items"] = normalized_items
    return data


def compute_overall_confidence(data: dict) -> float:
    """
    Computes balanced overall AI confidence combining:
    - 70% mean field confidence across all extracted fields
    - 30% lowest critical field confidence (vendor, invoice_number, date, total, subtotal)
    """
    all_scores = []
    critical_scores = []

    critical_fields = ["vendor", "invoice_number", "date", "subtotal", "total"]
    optional_fields = {"discount", "shipping", "tip"}

    for field_name in CONF_FIELDS:
        base_name = field_name.replace("_confidence", "")
        # For optional fields, only include in overall score if the field is present and non-zero
        if base_name in optional_fields:
            opt_val = data.get(base_name)
            if opt_val is None or _clean_amount(opt_val) == 0.0:
                continue

        val = data.get(field_name)
        if isinstance(val, (int, float)):
            score = float(val)
            all_scores.append(score)
            if base_name in critical_fields:
                critical_scores.append(score)

    items = data.get("line_items", [])
    if isinstance(items, list):
        for item in items:
            if isinstance(item, dict):
                c = item.get("confidence")
                if isinstance(c, (int, float)):
                    all_scores.append(float(c))

    if not all_scores:
        return CONFIDENCE_TIERS["MISSING"]

    mean_conf = sum(all_scores) / len(all_scores)
    min_crit_conf = min(critical_scores) if critical_scores else mean_conf

    balanced = (0.70 * mean_conf) + (0.30 * min_crit_conf)
    return max(0.0, min(1.0, round(balanced, 3)))


def normalize_invoice_json(data: dict) -> dict:
    """
    Master normalization pipeline enforcing Confidence & Data Provenance Policies.
    Guarantees structural validity and type safety before Pydantic InvoiceSchema validation.
    """
    if not isinstance(data, dict):
        raise ValueError("Provider output is not a valid JSON dictionary.")

    known_keys = {
        "vendor", "invoice_number", "date", "currency", "subtotal",
        "discount", "shipping", "tax", "tip", "total", "line_items", "price"
    }
    if not any(k in data for k in known_keys):
        # Return un-normalized if no recognizable invoice fields exist so Pydantic handles validation failure
        return data

    normalized = dict(data)

    # 0. Map financial key aliases
    if normalized.get("discount") is None:
        for alias in ["discount_amount", "discounts", "rebate", "rebates", "coupon", "coupons", "promo", "voucher"]:
            if normalized.get(alias) is not None:
                normalized["discount"] = normalized[alias]
                if f"{alias}_confidence" in normalized and "discount_confidence" not in normalized:
                    normalized["discount_confidence"] = normalized[f"{alias}_confidence"]
                break

    if normalized.get("shipping") is None:
        for alias in ["shipping_amount", "shipping_fee", "freight", "delivery", "delivery_fee", "postage", "handling"]:
            if normalized.get(alias) is not None:
                normalized["shipping"] = normalized[alias]
                if f"{alias}_confidence" in normalized and "shipping_confidence" not in normalized:
                    normalized["shipping_confidence"] = normalized[f"{alias}_confidence"]
                break

    if normalized.get("tip") is None:
        for alias in ["tips", "gratuity", "gratuities", "service_charge"]:
            if normalized.get(alias) is not None:
                normalized["tip"] = normalized[alias]
                if f"{alias}_confidence" in normalized and "tip_confidence" not in normalized:
                    normalized["tip_confidence"] = normalized[f"{alias}_confidence"]
                break

    # Sanitize numeric financial fields
    for num_f in ["subtotal", "tax", "total", "shipping", "tip"]:
        if num_f in normalized and normalized[num_f] is not None:
            normalized[num_f] = _clean_amount(normalized[num_f])

    if "discount" in normalized and normalized["discount"] is not None:
        normalized["discount"] = abs(_clean_amount(normalized["discount"]))

    # 1. Preserve missing required top-level fields without fabricating business placeholders
    for field_name, (fallback_value, fallback_conf) in FIELD_DEFAULTS.items():
        if field_name not in normalized or normalized[field_name] is None:
            normalized[field_name] = fallback_value
            conf_key = f"{field_name}_confidence"
            if conf_key not in normalized or normalized[conf_key] is None:
                normalized[conf_key] = fallback_conf

    # 2. Normalize top-level confidence fields
    normalized = normalize_confidence_fields(normalized)

    # 3. Normalize line items (maps aliases, computes amounts)
    normalized = normalize_line_items(normalized)

    # 4. Compute overall_confidence if missing
    ov_conf = normalized.get("overall_confidence")
    if ov_conf is None or not isinstance(ov_conf, (int, float)):
        normalized["overall_confidence"] = compute_overall_confidence(normalized)
    else:
        normalized["overall_confidence"] = max(0.0, min(1.0, float(ov_conf)))

    # 5. Attach internal data provenance metadata
    normalized = track_field_provenance(data, normalized)

    # 6. Run Rule-Based Confidence Validation Engine
    from backend.validation import evaluate_validation
    image_meta = data.get("_image_metadata") if isinstance(data.get("_image_metadata"), dict) else None

    # Preserve original unadjusted AI base confidence
    base_ai_conf = normalized.get("overall_confidence", 0.8)
    normalized["_ai_confidence"] = base_ai_conf

    val_result = evaluate_validation(normalized, image_metadata=image_meta)

    normalized["_validation"] = val_result.to_dict()
    normalized["overall_confidence"] = val_result.final_confidence

    return normalized
