import { SampleExtractionData } from './sampleData';

function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export function downloadExtractedCsv(
  data: SampleExtractionData | any,
  status: string = 'auto_approved'
): void {
  if (!data) return;

  const lines: string[] = [];

  // 1. Header Metadata Section
  lines.push('--- INVOICE SUMMARY ---');
  lines.push(
    [
      'Invoice Number',
      'Vendor / Merchant',
      'Date',
      'Currency',
      'Subtotal',
      'Discount',
      'Tax',
      'Shipping',
      'Tip',
      'Total',
      'Overall Confidence',
      'Audit Status',
    ].join(',')
  );

  lines.push(
    [
      escapeCsvCell(data.invoice_number || 'N/A'),
      escapeCsvCell(data.vendor || 'Unknown Vendor'),
      escapeCsvCell(data.date || 'N/A'),
      escapeCsvCell(data.currency || 'USD'),
      escapeCsvCell(Number(data.subtotal || 0).toFixed(2)),
      escapeCsvCell(Number(data.discount || 0).toFixed(2)),
      escapeCsvCell(Number(data.tax || 0).toFixed(2)),
      escapeCsvCell(Number(data.shipping || 0).toFixed(2)),
      escapeCsvCell(Number(data.tip || 0).toFixed(2)),
      escapeCsvCell(Number(data.total || 0).toFixed(2)),
      escapeCsvCell(
        `${(Number(data.overall_confidence || 0.95) * 100).toFixed(1)}%`
      ),
      escapeCsvCell(status),
    ].join(',')
  );

  lines.push(''); // blank row separator

  // 2. Line Items Section
  lines.push('--- EXTRACTED LINE ITEMS ---');
  lines.push(
    ['Line #', 'Description', 'Quantity', 'Unit Price', 'Total Amount', 'Field Confidence'].join(',')
  );

  if (Array.isArray(data.line_items) && data.line_items.length > 0) {
    data.line_items.forEach((item: any, idx: number) => {
      lines.push(
        [
          idx + 1,
          escapeCsvCell(item.description || 'Item'),
          escapeCsvCell(item.quantity ?? 1),
          escapeCsvCell(Number(item.unit_price || 0).toFixed(2)),
          escapeCsvCell(Number(item.amount || 0).toFixed(2)),
          escapeCsvCell(
            `${(Number(item.confidence || 0.9) * 100).toFixed(1)}%`
          ),
        ].join(',')
      );
    });
  } else {
    lines.push('1,"No line items extracted",0,0.00,0.00,0.0%');
  }

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const rawFilename = (data.vendor || 'invoice')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const invNumber = (data.invoice_number || 'export')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  const filename = `${rawFilename}_${invNumber}_extracted.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
