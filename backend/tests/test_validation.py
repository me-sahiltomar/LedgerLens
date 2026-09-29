import pytest
from datetime import date, timedelta
from backend.validation import evaluate_validation, parse_invoice_date, ValidationResult


def test_valid_invoice_validation():
    data = {
        "vendor": "Acme Corp",
        "invoice_number": "INV-1001",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": 100.0,
        "tax": 10.0,
        "total": 110.0,
        "line_items": [
            {"description": "Widget A", "quantity": 2.0, "unit_price": 50.0, "amount": 100.0, "confidence": 0.95}
        ],
        "overall_confidence": 0.95,
    }
    result = evaluate_validation(data)
    assert isinstance(result, ValidationResult)
    assert result.final_confidence >= 0.95
    assert len(result.failed_checks) == 0
    assert any("Financial totals verified" in c for c in result.passed_checks)
    assert any("Line item amounts sum matches subtotal" in c for c in result.passed_checks)


def test_incorrect_totals_validation():
    data = {
        "vendor": "Acme Corp",
        "invoice_number": "INV-1002",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": 100.0,
        "tax": 10.0,
        "total": 150.0,  # Incorrect total (100 + 10 != 150)
        "overall_confidence": 0.90,
    }
    result = evaluate_validation(data)
    assert any("Subtotal + Tax" in c for c in result.failed_checks)
    assert result.confidence_adjustment < 0.0
    assert result.final_confidence < 0.90


def test_missing_vendor_validation():
    data = {
        "vendor": "",  # Missing vendor
        "invoice_number": "INV-1003",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": 50.0,
        "tax": 5.0,
        "total": 55.0,
        "overall_confidence": 0.90,
    }
    result = evaluate_validation(data)
    assert any("Missing required field: Vendor Name" in c for c in result.failed_checks)


def test_missing_subtotal_validation():
    data = {
        "vendor": "Acme Corp",
        "invoice_number": "INV-1004",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": 0.0,  # Missing subtotal
        "tax": 0.0,
        "total": 50.0,
        "overall_confidence": 0.85,
    }
    result = evaluate_validation(data)
    assert any("Missing required field: Subtotal Amount" in c for c in result.failed_checks)


def test_missing_currency_validation():
    data = {
        "vendor": "Acme Corp",
        "invoice_number": "INV-1005",
        "date": "2026-07-20",
        "currency": "",  # Missing currency
        "subtotal": 50.0,
        "tax": 5.0,
        "total": 55.0,
        "overall_confidence": 0.85,
    }
    result = evaluate_validation(data)
    assert any("Missing required field: Currency" in c for c in result.failed_checks)


def test_negative_values_validation():
    data = {
        "vendor": "Acme Corp",
        "invoice_number": "INV-1006",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": -50.0,  # Negative subtotal
        "tax": 5.0,
        "total": -45.0,  # Negative total
        "line_items": [
            {"description": "Item", "quantity": -1.0, "unit_price": 50.0, "amount": -50.0, "confidence": 0.8}
        ],
        "overall_confidence": 0.85,
    }
    result = evaluate_validation(data)
    failed_text = " ".join(result.failed_checks)
    assert "Negative numeric value rejected" in failed_text or "Negative line item value rejected" in failed_text


def test_future_date_validation():
    future_dt = date.today() + timedelta(days=30)
    future_date_str = future_dt.strftime("%Y-%m-%d")
    data = {
        "vendor": "Acme Corp",
        "invoice_number": "INV-1007",
        "date": future_date_str,  # Future date
        "currency": "USD",
        "subtotal": 50.0,
        "tax": 5.0,
        "total": 55.0,
        "overall_confidence": 0.90,
    }
    result = evaluate_validation(data)
    assert any("Future invoice date detected" in c for c in result.failed_checks)


def test_low_resolution_image_validation():
    data = {
        "vendor": "Acme Corp",
        "invoice_number": "INV-1008",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": 50.0,
        "tax": 5.0,
        "total": 55.0,
        "overall_confidence": 0.90,
    }
    img_meta = {"width": 300, "height": 400}  # Low resolution (< 500px)
    result = evaluate_validation(data, image_metadata=img_meta)
    assert any("Low resolution image" in w for w in result.warnings)


def test_invoice_with_discount_passes_validation():
    # User's Commercial Invoice scenario: 12,800 - 300 + 12 = 12,512
    data = {
        "vendor": "Globex Corp",
        "invoice_number": "000562",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": 12800.0,
        "discount": 300.0,
        "tax": 12.0,
        "total": 12512.0,
        "line_items": [
            {"description": "Industrial Pump", "quantity": 1.0, "unit_price": 12800.0, "amount": 12800.0, "confidence": 0.95}
        ],
        "overall_confidence": 0.95,
    }
    result = evaluate_validation(data)
    assert len(result.failed_checks) == 0
    assert any("Financial totals verified" in c for c in result.passed_checks)
    assert any("Discount 300.00" in c for c in result.passed_checks)


def test_invoice_with_shipping_and_tip_validation():
    # Subtotal 100 - Discount 10 + Tax 8 + Shipping 15 + Tip 10 = Total 123
    data = {
        "vendor": "Catering Co",
        "invoice_number": "INV-7788",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": 100.0,
        "discount": 10.0,
        "tax": 8.0,
        "shipping": 15.0,
        "tip": 10.0,
        "total": 123.0,
        "line_items": [
            {"description": "Platter", "quantity": 2.0, "unit_price": 50.0, "amount": 100.0, "confidence": 0.95}
        ],
        "overall_confidence": 0.95,
    }
    result = evaluate_validation(data)
    assert len(result.failed_checks) == 0
    assert any("Financial totals verified" in c for c in result.passed_checks)


def test_tax_inclusive_pricing_validation():
    # VAT included: Subtotal 100 = Total 100, Tax 20 (UK/Europe)
    data = {
        "vendor": "London Bistro",
        "invoice_number": "VAT-992",
        "date": "2026-07-20",
        "currency": "GBP",
        "subtotal": 100.0,
        "tax": 20.0,
        "total": 100.0,
        "line_items": [
            {"description": "Dinner Menu", "quantity": 1.0, "unit_price": 100.0, "amount": 100.0, "confidence": 0.95}
        ],
        "overall_confidence": 0.95,
    }
    result = evaluate_validation(data)
    assert len(result.failed_checks) == 0
    assert any("tax-inclusive" in c for c in result.passed_checks)


def test_negative_discount_line_item_permitted():
    # Discount coupon line item with negative unit price and amount
    data = {
        "vendor": "Retail Express",
        "invoice_number": "RET-441",
        "date": "2026-07-20",
        "currency": "USD",
        "subtotal": 80.0,
        "tax": 8.0,
        "total": 88.0,
        "line_items": [
            {"description": "Sweater", "quantity": 1.0, "unit_price": 100.0, "amount": 100.0, "confidence": 0.95},
            {"description": "Promo Voucher Discount", "quantity": 1.0, "unit_price": -20.0, "amount": -20.0, "confidence": 0.95},
        ],
        "overall_confidence": 0.95,
    }
    result = evaluate_validation(data)
    # The negative line item must not trigger "Negative line item value rejected"
    assert not any("Negative line item value rejected" in f for f in result.failed_checks)
    assert len(result.failed_checks) == 0

