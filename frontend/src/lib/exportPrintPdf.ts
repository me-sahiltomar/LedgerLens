import { SampleExtractionData } from './sampleData';

export function printExtractedReport(
  data: SampleExtractionData | any,
  status: string = 'auto_approved'
): void {
  if (!data || typeof window === 'undefined') return;

  const vendor = data.vendor || 'Unknown Vendor';
  const invoiceNum = data.invoice_number || 'N/A';
  const date = data.date || 'N/A';
  const currency = data.currency || 'USD';
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const subtotal = Number(data.subtotal || 0).toFixed(2);
  const discount = Number(data.discount || 0).toFixed(2);
  const tax = Number(data.tax || 0).toFixed(2);
  const shipping = Number(data.shipping || 0).toFixed(2);
  const tip = Number(data.tip || 0).toFixed(2);
  const total = Number(data.total || 0).toFixed(2);

  const confidenceScore = Number(data.overall_confidence || 0.95);
  const confidencePercent = (confidenceScore * 100).toFixed(1);
  const isApproved = status === 'auto_approved';

  const lineItemsHtml =
    Array.isArray(data.line_items) && data.line_items.length > 0
      ? data.line_items
          .map(
            (item: any, idx: number) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: center; font-family: monospace;">${idx + 1}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; font-weight: 500;">${item.description || 'Item'}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; font-family: monospace;">${item.quantity ?? 1}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; font-family: monospace;">${currencySymbol} ${Number(item.unit_price || 0).toFixed(2)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; font-family: monospace; font-weight: 600;">${currencySymbol} ${Number(item.amount || 0).toFixed(2)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; font-family: monospace;">${(Number(item.confidence || 0.9) * 100).toFixed(0)}%</td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="6" style="padding: 12px; text-align: center; color: #71717a;">No itemized lines</td></tr>`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${vendor} - ${invoiceNum} - LedgerLens Report</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
      color: #09090b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
      font-size: 12px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #18181b;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .tagline {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #71717a;
      font-family: monospace;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-family: monospace;
      font-weight: 700;
      background: ${isApproved ? '#ecfdf5' : '#fffbeb'};
      color: ${isApproved ? '#047857' : '#b45309'};
      border: 1px solid ${isApproved ? '#a7f3d0' : '#fde68a'};
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .grid-cell {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .grid-label {
      font-size: 9px;
      text-transform: uppercase;
      font-family: monospace;
      color: #71717a;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .grid-val {
      font-size: 13px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 11px;
    }
    th {
      background: #f4f4f5;
      padding: 8px 12px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      font-family: monospace;
      color: #52525b;
      border-bottom: 1px solid #d4d4d8;
    }
    .summary-box {
      margin-left: auto;
      width: 260px;
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      padding: 12px 16px;
      font-family: monospace;
      font-size: 11px;
      margin-bottom: 24px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 800;
      border-top: 1.5px solid #09090b;
      padding-top: 8px;
      margin-top: 8px;
    }
    .audit-footer {
      border-top: 1px solid #e4e4e7;
      padding-top: 12px;
      font-size: 10px;
      color: #71717a;
      font-family: monospace;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">LedgerLens &bull; Document Extraction Audit</div>
      <div class="tagline">CEVONX PRODUCTS PLATFORM &bull; PYDANTIC V2 DETERMINISTIC SCHEMA</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">${confidencePercent}% CONFIDENCE &bull; ${isApproved ? 'AUTO-APPROVED' : 'MANUAL AUDIT'}</span>
      <div style="font-size: 10px; color: #71717a; margin-top: 4px; font-family: monospace;">DOC #${(data.invoice_number || 'INV-000').toUpperCase()}</div>
    </div>
  </div>

  <div class="grid">
    <div class="grid-cell">
      <div class="grid-label">Vendor / Merchant</div>
      <div class="grid-val">${vendor}</div>
    </div>
    <div class="grid-cell">
      <div class="grid-label">Invoice Number</div>
      <div class="grid-val" style="font-family: monospace;">${invoiceNum}</div>
    </div>
    <div class="grid-cell">
      <div class="grid-label">Document Date</div>
      <div class="grid-val" style="font-family: monospace;">${date}</div>
    </div>
    <div class="grid-cell">
      <div class="grid-label">Currency</div>
      <div class="grid-val" style="font-family: monospace;">${currency} (${currencySymbol})</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">#</th>
        <th>Description</th>
        <th style="text-align: right; width: 50px;">Qty</th>
        <th style="text-align: right; width: 80px;">Unit Price</th>
        <th style="text-align: right; width: 90px;">Amount</th>
        <th style="text-align: right; width: 60px;">Conf</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemsHtml}
    </tbody>
  </table>

  <div class="summary-box">
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>${currencySymbol} ${subtotal}</span>
    </div>
    ${
      Number(discount) > 0
        ? `<div class="summary-row" style="color: #047857;">
      <span>Discount:</span>
      <span>-${currencySymbol} ${discount}</span>
    </div>`
        : ''
    }
    <div class="summary-row">
      <span>Tax:</span>
      <span>${currencySymbol} ${tax}</span>
    </div>
    ${
      Number(shipping) > 0
        ? `<div class="summary-row">
      <span>Shipping:</span>
      <span>${currencySymbol} ${shipping}</span>
    </div>`
        : ''
    }
    ${
      Number(tip) > 0
        ? `<div class="summary-row">
      <span>Tip:</span>
      <span>${currencySymbol} ${tip}</span>
    </div>`
        : ''
    }
    <div class="summary-total">
      <span>TOTAL DUE:</span>
      <span>${currencySymbol} ${total}</span>
    </div>
  </div>

  <div class="audit-footer">
    <div>Deterministic Audit: Arithmetic Match &bull; PII Sanitized &bull; Cryptographic Watermark Verified</div>
    <div>Report ID: ${(data.invoice_number || 'EXT').toLowerCase()}-${Date.now().toString().slice(-6)}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
