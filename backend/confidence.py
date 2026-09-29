import logging
from typing import Union, List, Tuple, Dict, Any
import config
from schemas import InvoiceSchema

logger = logging.getLogger("cevondocs")


def route_document(
    invoice_data: Union[InvoiceSchema, Dict[str, Any]],
    threshold: float = config.REVIEW_THRESHOLD,
) -> Tuple[str, List[str]]:
    """
    Inspects all confidence fields in the invoice data against the threshold.
    Returns (status, flagged_fields).
      - status: 'auto_approved' or 'pending_review'
      - flagged_fields: list of field names below threshold
    """
    if isinstance(invoice_data, InvoiceSchema):
        data = invoice_data.model_dump()
    else:
        data = invoice_data

    flagged_fields: List[str] = []

    # Map of confidence field to readable field name
    top_level_map = {
        "vendor_confidence": "vendor",
        "invoice_number_confidence": "invoice_number",
        "date_confidence": "date",
        "currency_confidence": "currency",
        "subtotal_confidence": "subtotal",
        "tax_confidence": "tax",
        "total_confidence": "total",
    }

    # 0. Check overall confidence (validation-adjusted)
    ov_conf = data.get("overall_confidence")
    is_overall_low = (ov_conf is not None and float(ov_conf) < threshold)

    # 1. Check top-level confidence fields
    for conf_key, field_name in top_level_map.items():
        conf_val = data.get(conf_key)
        if conf_val is None:
            conf_val = 0.0
        if conf_val < threshold:
            flagged_fields.append(field_name)

    # Optional fields (discount, shipping, tip): only flag if extracted, non-zero, and explicit confidence is low
    optional_conf_map = {
        "discount_confidence": "discount",
        "shipping_confidence": "shipping",
        "tip_confidence": "tip",
    }
    for conf_key, field_name in optional_conf_map.items():
        val = data.get(field_name)
        if val is not None and float(val or 0.0) > 0.0:
            c_val = data.get(conf_key)
            if c_val is not None and float(c_val) < threshold:
                flagged_fields.append(field_name)

    # 2. Check line items confidence
    line_items = data.get("line_items", [])
    for idx, item in enumerate(line_items):
        if isinstance(item, dict):
            item_conf = item.get("confidence")
        else:
            item_conf = getattr(item, "confidence", None)
        if item_conf is None:
            item_conf = 0.0
        if item_conf < threshold:
            flagged_fields.append(f"line_items[{idx}]")

    # 3. Arithmetic consistency check (Subtotal - Discount + Tax + Shipping + Tip ≈ Total)
    is_math_inconsistent = False
    subtotal = data.get("subtotal")
    discount = data.get("discount")
    shipping = data.get("shipping")
    tax = data.get("tax")
    tip = data.get("tip")
    total = data.get("total")

    if subtotal is not None and total is not None:
        try:
            st_val = float(subtotal or 0.0)
            disc_val = abs(float(discount or 0.0))
            ship_val = float(shipping or 0.0)
            tax_val = float(tax or 0.0)
            tip_val = float(tip or 0.0)
            tot_val = float(total or 0.0)

            if tot_val > 0 or st_val > 0:
                diff_standard = abs((st_val - disc_val + tax_val + ship_val + tip_val) - tot_val)
                diff_tax_inclusive = abs((st_val - disc_val + ship_val + tip_val) - tot_val)
                diff_post_discount = abs((st_val + tax_val + ship_val + tip_val) - tot_val)

                matches_math = (
                    diff_standard <= 0.05
                    or (tax_val > 0 and diff_tax_inclusive <= 0.05)
                    or (disc_val > 0 and diff_post_discount <= 0.05)
                )

                if not matches_math:
                    is_math_inconsistent = True
                    if "arithmetic_mismatch" not in flagged_fields:
                        flagged_fields.append("arithmetic_mismatch")
                    if "total" not in flagged_fields:
                        flagged_fields.append("total")
        except (ValueError, TypeError):
            pass

    # 4. Check validation engine results if available
    is_val_failed = False
    val_meta = data.get("_validation")
    if isinstance(val_meta, dict):
        failed_checks = val_meta.get("failed_checks") or []
        if failed_checks:
            is_val_failed = True
            for check in failed_checks:
                c_str = str(check).lower()
                if "subtotal + tax" in c_str or "does not equal total" in c_str:
                    if "arithmetic_mismatch" not in flagged_fields:
                        flagged_fields.append("arithmetic_mismatch")
                elif "line item" in c_str:
                    if "line_items_mismatch" not in flagged_fields:
                        flagged_fields.append("line_items_mismatch")
                elif "missing required field" in c_str:
                    for f_key in ["vendor", "invoice_number", "date", "currency", "total", "subtotal"]:
                        if f_key in c_str and f_key not in flagged_fields:
                            flagged_fields.append(f_key)
                elif "negative" in c_str:
                    if "negative_value" not in flagged_fields:
                        flagged_fields.append("negative_value")
                else:
                    if "validation_failed" not in flagged_fields:
                        flagged_fields.append("validation_failed")

    # 5. Check overall confidence
    if is_overall_low and "overall_confidence" not in flagged_fields:
        flagged_fields.append("overall_confidence")

    # Deduplicate flagged_fields while preserving order
    deduped_flagged: List[str] = []
    for f in flagged_fields:
        if f not in deduped_flagged:
            deduped_flagged.append(f)
    flagged_fields = deduped_flagged

    if flagged_fields or is_overall_low or is_math_inconsistent or is_val_failed:
        status = "pending_review"
    else:
        status = "auto_approved"

    logger.info(f"Routed document: status='{status}', overall_conf={ov_conf}, flagged_count={len(flagged_fields)}")
    return status, flagged_fields
