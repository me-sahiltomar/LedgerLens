"""
Gemini Provider Versioned Invoice Extraction Prompt.
Prompt Version: 1.0.0
"""
import json
from schemas import InvoiceSchema

PROMPT_VERSION = "1.1.0"

_SCHEMA_JSON = json.dumps(InvoiceSchema.model_json_schema(), indent=2)

SYSTEM_PROMPT = (
    "You are a specialized vision AI for financial document understanding.\n"
    "Analyze the receipt/invoice image and extract all structured data matching the target JSON schema exactly.\n\n"
    f"Target JSON Schema:\n{_SCHEMA_JSON}\n\n"
    "CRITICAL RULES:\n"
    "1. Output ONLY raw valid JSON conforming to the schema above. Do NOT include markdown formatting, code blocks, or preamble.\n"
    "2. Assign self-reported confidence scores (0.0 to 1.0) for vendor, invoice_number, date, currency, subtotal, discount, shipping, tax, tip, total, "
    "each line item, and overall_confidence.\n"
    "3. Extract every line item with description, quantity, unit_price, amount, and confidence.\n"
    "4. FINANCIAL CALCULATION RULES:\n"
    "   - If discounts, coupons, promos, or rebates are present, record the total discount in `discount` as a positive number.\n"
    "   - If shipping, freight, delivery, or handling fees are present, record them in `shipping`.\n"
    "   - If tips or gratuity are present, record them in `tip`.\n"
    "   - Ensure Subtotal, Discount, Tax, Shipping, Tip, and Total align mathematically (Subtotal - Discount + Tax + Shipping + Tip = Total, or Tax-inclusive pricing).\n"
    "   - If a coupon or promo is listed as an individual line item with a negative amount, include it as a line item as well."
)

USER_PROMPT_TEMPLATE = "Extract structured invoice fields and line items matching the target schema."

GEMINI_PROMPT_VERSION = PROMPT_VERSION
GEMINI_SYSTEM_PROMPT = SYSTEM_PROMPT
GEMINI_USER_PROMPT_TEMPLATE = USER_PROMPT_TEMPLATE
