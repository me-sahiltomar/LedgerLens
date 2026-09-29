from confidence import route_document
from schemas import InvoiceSchema, LineItem


def test_high_confidence_auto_approve():
    invoice = InvoiceSchema(
        vendor="Clear Supermarket",
        vendor_confidence=0.98,
        invoice_number="INV-8877",
        invoice_number_confidence=0.92,
        date="2026-07-22",
        date_confidence=0.95,
        currency="USD",
        currency_confidence=1.0,
        subtotal=45.0,
        subtotal_confidence=0.96,
        tax=4.50,
        tax_confidence=0.96,
        total=49.50,
        total_confidence=0.99,
        line_items=[
            LineItem(
                description="Groceries",
                quantity=1.0,
                unit_price=45.0,
                amount=45.0,
                confidence=0.95
            )
        ],
        overall_confidence=0.96
    )

    status, flagged = route_document(invoice, threshold=0.75)
    assert status == "auto_approved"
    assert len(flagged) == 0


def test_low_confidence_pending_review():
    invoice = InvoiceSchema(
        vendor="Blurry Vendor Name",
        vendor_confidence=0.45,  # Below 0.75 -> Flagged
        invoice_number="INV-???",
        invoice_number_confidence=0.50,  # Below 0.75 -> Flagged
        date="2026-07-22",
        date_confidence=0.90,
        currency="USD",
        currency_confidence=1.0,
        subtotal=100.0,
        subtotal_confidence=0.90,
        tax=10.0,
        tax_confidence=0.90,
        total=110.0,
        total_confidence=0.90,
        line_items=[
            LineItem(
                description="Item 1",
                quantity=1.0,
                unit_price=50.0,
                amount=50.0,
                confidence=0.90
            ),
            LineItem(
                description="Unclear Item 2",
                quantity=1.0,
                unit_price=50.0,
                amount=50.0,
                confidence=0.60  # Below 0.75 -> Flagged
            )
        ],
        overall_confidence=0.65
    )

    status, flagged = route_document(invoice, threshold=0.75)
    assert status == "pending_review"
    assert flagged == ["vendor", "invoice_number", "line_items[1]", "overall_confidence"]


def test_exact_threshold_boundary():
    invoice = InvoiceSchema(
        vendor="Boundary Vendor",
        vendor_confidence=0.75,  # Exactly equal to threshold -> Passed
        invoice_number="INV-75",
        invoice_number_confidence=0.75,
        date="2026-07-22",
        date_confidence=0.75,
        currency="USD",
        currency_confidence=0.75,
        subtotal=10.0,
        subtotal_confidence=0.75,
        tax=1.0,
        tax_confidence=0.75,
        total=11.0,
        total_confidence=0.75,
        line_items=[
            LineItem(
                description="Item",
                quantity=1.0,
                unit_price=10.0,
                amount=10.0,
                confidence=0.75
            )
        ],
        overall_confidence=0.75
    )

    status, flagged = route_document(invoice, threshold=0.75)
    assert status == "auto_approved"
    assert len(flagged) == 0


def test_missing_confidence_fails_closed():
    # Dictionary with missing vendor_confidence
    raw_data = {
        "vendor": "Test Vendor",
        # vendor_confidence is missing!
        "invoice_number": "INV-100",
        "invoice_number_confidence": 0.9,
        "date": "2026-07-22",
        "date_confidence": 0.9,
        "currency": "USD",
        "currency_confidence": 0.9,
        "subtotal": 100.0,
        "subtotal_confidence": 0.9,
        "tax": 10.0,
        "tax_confidence": 0.9,
        "total": 110.0,
        "total_confidence": 0.9,
        "line_items": [
            {"description": "Item 1", "confidence": 0.9}
        ]
    }

    status, flagged = route_document(raw_data, threshold=0.75)
    assert status == "pending_review"
    assert "vendor" in flagged


def test_confidence_boundary_074_and_075():
    # 0.74 -> pending_review
    data_074 = {
        "vendor_confidence": 0.74,
        "invoice_number_confidence": 0.75,
        "date_confidence": 0.75,
        "currency_confidence": 0.75,
        "subtotal_confidence": 0.75,
        "tax_confidence": 0.75,
        "total_confidence": 0.75,
        "line_items": [{"confidence": 0.75}]
    }
    status_074, flagged_074 = route_document(data_074, threshold=0.75)
    assert status_074 == "pending_review"
    assert flagged_074 == ["vendor"]

    # 0.75 -> auto_approved
    data_075 = {
        "vendor_confidence": 0.75,
        "invoice_number_confidence": 0.75,
        "date_confidence": 0.75,
        "currency_confidence": 0.75,
        "subtotal_confidence": 0.75,
        "tax_confidence": 0.75,
        "total_confidence": 0.75,
        "line_items": [{"confidence": 0.75}]
    }
    status_075, flagged_075 = route_document(data_075, threshold=0.75)
    assert status_075 == "auto_approved"
    assert len(flagged_075) == 0


def test_overall_confidence_low_flagged():
    data = {
        "vendor_confidence": 0.9,
        "invoice_number_confidence": 0.9,
        "date_confidence": 0.9,
        "currency_confidence": 0.9,
        "subtotal_confidence": 0.9,
        "tax_confidence": 0.9,
        "total_confidence": 0.9,
        "line_items": [{"confidence": 0.9}],
        "overall_confidence": 0.65,  # Overall low despite high field scores
    }
    status, flagged = route_document(data, threshold=0.75)
    assert status == "pending_review"
    assert "overall_confidence" in flagged


def test_arithmetic_mismatch_routes_to_pending_review():
    # High confidence on all fields, but Subtotal (12800) + Tax (12) != Total (12512)
    data = {
        "vendor": "Globex Corporation",
        "vendor_confidence": 0.99,
        "invoice_number": "000562",
        "invoice_number_confidence": 0.99,
        "date": "11/05/2020",
        "date_confidence": 0.99,
        "currency": "USD",
        "currency_confidence": 1.0,
        "subtotal": 12800.0,
        "subtotal_confidence": 0.99,
        "tax": 12.0,
        "tax_confidence": 0.99,
        "total": 12512.0,  # 12800 + 12 != 12512!
        "total_confidence": 0.99,
        "line_items": [{"description": "Item", "amount": 12800.0, "confidence": 0.99}],
        "overall_confidence": 0.82,  # Even though 0.82 > 0.75 threshold
    }
    status, flagged = route_document(data, threshold=0.75)
    assert status == "pending_review"
    assert "arithmetic_mismatch" in flagged
    assert "total" in flagged


def test_validation_failed_checks_route_to_pending_review():
    data = {
        "vendor": "Test Corp",
        "vendor_confidence": 0.95,
        "invoice_number": "INV-1",
        "invoice_number_confidence": 0.95,
        "date": "2026-07-22",
        "date_confidence": 0.95,
        "currency": "USD",
        "currency_confidence": 0.95,
        "subtotal": 100.0,
        "subtotal_confidence": 0.95,
        "tax": 10.0,
        "tax_confidence": 0.95,
        "total": 110.0,
        "total_confidence": 0.95,
        "overall_confidence": 0.90,
        "_validation": {
            "failed_checks": ["Subtotal + Tax (100.00 + 10.00) does not equal Total (115.00)"]
        }
    }
    status, flagged = route_document(data, threshold=0.75)
    assert status == "pending_review"
    assert "arithmetic_mismatch" in flagged

