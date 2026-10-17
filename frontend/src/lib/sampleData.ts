export interface SampleLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  confidence: number;
}

export interface SampleExtractionData {
  vendor: string;
  invoice_number: string;
  date: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  tip: number;
  total: number;
  overall_confidence: number;
  line_items: SampleLineItem[];
  _validation?: {
    math_consistent: boolean;
    pii_detected: boolean;
    flagged_fields: string[];
    schema_version: string;
  };
}

export interface SampleInvoice {
  id: 'saas' | 'thermal' | 'gst';
  label: string;
  buttonLabel: string;
  filename: string;
  fileSize: string;
  dimensions: string;
  documentType: string;
  confidence: number;
  status: 'auto_approved' | 'pending_review';
  statusBadge: string;
  statusReason?: string;
  svgPreview: string;
  extractedData: SampleExtractionData;
}

// Crisp vector SVG previews rendered as Data URLs for zero-latency sample inspection
const SAAS_INVOICE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%" style="background:#ffffff; font-family:Inter,sans-serif; color:#09090b;">
  <rect width="400" height="520" fill="#ffffff" stroke="#e4e4e7" stroke-width="2"/>
  <rect x="24" y="24" width="352" height="6" fill="#18181b"/>
  
  <text x="24" y="58" font-size="16" font-weight="700" fill="#09090b">VERCEL INC.</text>
  <text x="24" y="74" font-size="9" fill="#71717a">440 N BARRANCA AVE #4133 · COVINA, CA 91723</text>
  
  <text x="376" y="58" font-size="12" font-weight="700" text-anchor="end" fill="#09090b">TAX INVOICE</text>
  <text x="376" y="74" font-size="9" font-family="monospace" text-anchor="end" fill="#52525b">#INV-2026-8842</text>
  
  <line x1="24" y1="92" x2="376" y2="92" stroke="#e4e4e7" stroke-width="1"/>
  
  <text x="24" y="112" font-size="8" font-weight="600" fill="#71717a">BILLED TO</text>
  <text x="24" y="126" font-size="10" font-weight="600" fill="#09090b">CevonX Systems Operations</text>
  <text x="24" y="138" font-size="9" fill="#52525b">team-infra@cevonx.com</text>
  
  <text x="260" y="112" font-size="8" font-weight="600" fill="#71717a">INVOICE DATE</text>
  <text x="260" y="126" font-size="10" font-family="monospace" fill="#09090b">OCT 12, 2026</text>
  <text x="260" y="138" font-size="9" fill="#52525b">Payment: Credit Card (••4912)</text>
  
  <line x1="24" y1="154" x2="376" y2="154" stroke="#e4e4e7" stroke-width="1"/>
  
  <!-- Table Header -->
  <rect x="24" y="166" width="352" height="22" fill="#f4f4f5"/>
  <text x="32" y="180" font-size="8" font-weight="700" fill="#52525b">DESCRIPTION</text>
  <text x="250" y="180" font-size="8" font-weight="700" text-anchor="end" fill="#52525b">QTY</text>
  <text x="310" y="180" font-size="8" font-weight="700" text-anchor="end" fill="#52525b">UNIT</text>
  <text x="368" y="180" font-size="8" font-weight="700" text-anchor="end" fill="#52525b">AMOUNT</text>
  
  <!-- Line 1 -->
  <text x="32" y="206" font-size="9" font-weight="600" fill="#09090b">Pro Team Subscription</text>
  <text x="32" y="217" font-size="8" fill="#71717a">Monthly Seat License (4 seats)</text>
  <text x="250" y="210" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">4</text>
  <text x="310" y="210" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">$20.00</text>
  <text x="368" y="210" font-size="9" font-family="monospace" font-weight="600" text-anchor="end" fill="#09090b">$80.00</text>
  
  <line x1="24" y1="228" x2="376" y2="228" stroke="#f4f4f5" stroke-width="1"/>
  
  <!-- Line 2 -->
  <text x="32" y="246" font-size="9" font-weight="600" fill="#09090b">Serverless Function Execution</text>
  <text x="32" y="257" font-size="8" fill="#71717a">GB-hour usage overage tier</text>
  <text x="250" y="250" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">1</text>
  <text x="310" y="250" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">$34.50</text>
  <text x="368" y="250" font-size="9" font-family="monospace" font-weight="600" text-anchor="end" fill="#09090b">$34.50</text>
  
  <line x1="24" y1="268" x2="376" y2="268" stroke="#f4f4f5" stroke-width="1"/>
  
  <!-- Line 3 -->
  <text x="32" y="286" font-size="9" font-weight="600" fill="#09090b">Edge Middleware Invocations</text>
  <text x="32" y="297" font-size="8" fill="#71717a">2M billable fast routing calls</text>
  <text x="250" y="290" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">2</text>
  <text x="310" y="290" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">$15.00</text>
  <text x="368" y="290" font-size="9" font-family="monospace" font-weight="600" text-anchor="end" fill="#09090b">$30.00</text>
  
  <line x1="24" y1="312" x2="376" y2="312" stroke="#e4e4e7" stroke-width="1"/>
  
  <!-- Totals Section -->
  <text x="260" y="336" font-size="9" fill="#71717a">Subtotal:</text>
  <text x="368" y="336" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">$144.50</text>
  
  <text x="260" y="352" font-size="9" fill="#059669">Annual Credit (10%):</text>
  <text x="368" y="352" font-size="9" font-family="monospace" text-anchor="end" fill="#059669">-$14.45</text>
  
  <text x="260" y="368" font-size="9" fill="#71717a">State Tax (8%):</text>
  <text x="368" y="368" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">$10.40</text>
  
  <line x1="260" y1="378" x2="376" y2="378" stroke="#09090b" stroke-width="1.5"/>
  
  <text x="260" y="398" font-size="11" font-weight="700" fill="#09090b">Total Due (USD):</text>
  <text x="368" y="398" font-size="13" font-weight="700" font-family="monospace" text-anchor="end" fill="#09090b">$140.45</text>
  
  <rect x="24" y="440" width="352" height="48" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="34" y="458" font-size="8" font-weight="700" fill="#09090b">AUDIT PROVENANCE HASH</text>
  <text x="34" y="474" font-size="8" font-family="monospace" fill="#64748b">SHA256: 7d42cfb018...99e1 [CEVONDOCS-VERIFIED]</text>
</svg>
`)}`;

const THERMAL_RECEIPT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 540" width="100%" height="100%" style="background:#faf8f5; font-family:'Courier New',Courier,monospace; color:#27272a;">
  <rect width="340" height="540" fill="#fefdfb" stroke="#e7e5e4" stroke-width="2"/>
  
  <!-- Jagged Paper Top -->
  <path d="M0,0 L10,8 L20,0 L30,8 L40,0 L50,8 L60,0 L70,8 L80,0 L90,8 L100,0 L110,8 L120,0 L130,8 L140,0 L150,8 L160,0 L170,8 L180,0 L190,8 L200,0 L210,8 L220,0 L230,8 L240,0 L250,8 L260,0 L270,8 L280,0 L290,8 L300,0 L310,8 L320,0 L330,8 L340,0 L340,540 L0,540 Z" fill="#fefdfb"/>
  
  <g opacity="0.88">
    <text x="170" y="42" font-size="14" font-weight="bold" text-anchor="middle" fill="#292524">BLUE BOTTLE COFFEE</text>
    <text x="170" y="58" font-size="9" text-anchor="middle" fill="#78716c">115 SANSOME ST, SAN FRANCISCO CA</text>
    <text x="170" y="72" font-size="9" text-anchor="middle" fill="#78716c">STORE #042 · TILL 02</text>
    
    <text x="170" y="94" font-size="9" text-anchor="middle" fill="#57534e">------------------------------------</text>
    
    <text x="24" y="112" font-size="9" fill="#57534e">DATE: 14/10/2026 08:42 AM</text>
    <text x="316" y="112" font-size="9" text-anchor="end" fill="#57534e">RCPT# 7729</text>
    
    <text x="170" y="130" font-size="9" text-anchor="middle" fill="#57534e">------------------------------------</text>
    
    <text x="24" y="152" font-size="10" font-weight="bold" fill="#292524">1x SINGLE ORIGIN POUR</text>
    <text x="24" y="165" font-size="8" fill="#78716c">   (BELLA DONOVAN)</text>
    <text x="316" y="152" font-size="10" font-weight="bold" text-anchor="end" fill="#292524">6.25</text>
    
    <text x="24" y="190" font-size="10" font-weight="bold" fill="#292524">1x ALMOND CROISSANT</text>
    <text x="316" y="190" font-size="10" font-weight="bold" text-anchor="end" fill="#292524">5.50</text>
    
    <!-- Faded/Smudged Section Simulation -->
    <text x="24" y="228" font-size="10" font-weight="bold" fill="#78716c" opacity="0.6">1x COLD BREW 8OZ [~SMUDGED~]</text>
    <text x="316" y="228" font-size="10" font-weight="bold" text-anchor="end" fill="#78716c" opacity="0.6">4.75</text>
    
    <text x="170" y="254" font-size="9" text-anchor="middle" fill="#57534e">------------------------------------</text>
    
    <text x="24" y="276" font-size="9" fill="#57534e">SUBTOTAL</text>
    <text x="316" y="276" font-size="9" text-anchor="end" fill="#292524">16.50</text>
    
    <text x="24" y="294" font-size="9" fill="#57534e">TAX (9.0%)</text>
    <text x="316" y="294" font-size="9" text-anchor="end" fill="#292524">1.49</text>
    
    <text x="24" y="312" font-size="9" fill="#57534e">TIP (18%)</text>
    <text x="316" y="312" font-size="9" text-anchor="end" fill="#292524">3.00</text>
    
    <text x="170" y="332" font-size="9" text-anchor="middle" fill="#57534e">====================================</text>
    
    <text x="24" y="356" font-size="13" font-weight="bold" fill="#1c1917">TOTAL DUE USD</text>
    <text x="316" y="356" font-size="14" font-weight="bold" text-anchor="end" fill="#1c1917">$20.99</text>
    
    <text x="170" y="380" font-size="9" text-anchor="middle" fill="#57534e">====================================</text>
    
    <text x="170" y="410" font-size="8" text-anchor="middle" fill="#a8a29e">CARD: **** **** **** 8102 (CHIP READ)</text>
    <text x="170" y="424" font-size="8" text-anchor="middle" fill="#a8a29e">AUTH: 094191  REF: 8812903</text>
    
    <!-- Barcode -->
    <rect x="70" y="445" width="200" height="35" fill="#44403c"/>
    <text x="170" y="495" font-size="8" text-anchor="middle" fill="#78716c">THANK YOU FOR YOUR VISIT</text>
  </g>
</svg>
`)}`;

const GST_INVOICE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 540" width="100%" height="100%" style="background:#ffffff; font-family:Inter,sans-serif; color:#09090b;">
  <rect width="420" height="540" fill="#ffffff" stroke="#e4e4e7" stroke-width="2"/>
  
  <rect x="24" y="24" width="372" height="70" fill="#fafafa" stroke="#e4e4e7" stroke-width="1"/>
  <text x="38" y="52" font-size="14" font-weight="bold" fill="#09090b">COGNITIVE SYSTEMS LTD.</text>
  <text x="38" y="68" font-size="8" fill="#52525b">GSTIN: 27AABCC8912C1Z4 · HSN TAX COMPLIANT</text>
  <text x="38" y="80" font-size="8" fill="#71717a">Cyber City, Tower 4, Sector 24, Gurugram, HR</text>
  
  <text x="382" y="52" font-size="12" font-weight="bold" text-anchor="end" fill="#09090b">GST TAX INVOICE</text>
  <text x="382" y="68" font-size="9" font-family="monospace" text-anchor="end" fill="#52525b">INV: GSTIN-994103</text>
  <text x="382" y="80" font-size="8" font-family="monospace" text-anchor="end" fill="#71717a">DATE: 15-OCT-2026</text>
  
  <!-- Line Items Table -->
  <rect x="24" y="106" width="372" height="24" fill="#f4f4f5"/>
  <text x="34" y="122" font-size="8" font-weight="700" fill="#52525b">SERVICE / ITEM (HSN/SAC)</text>
  <text x="250" y="122" font-size="8" font-weight="700" text-anchor="end" fill="#52525b">QTY</text>
  <text x="315" y="122" font-size="8" font-weight="700" text-anchor="end" fill="#52525b">RATE (INR)</text>
  <text x="386" y="122" font-size="8" font-weight="700" text-anchor="end" fill="#52525b">AMOUNT (INR)</text>
  
  <!-- Row 1 -->
  <text x="34" y="148" font-size="9" font-weight="600" fill="#09090b">Cloud Infra Architecture Consulting</text>
  <text x="34" y="159" font-size="8" font-mono font-family="monospace" fill="#71717a">SAC: 998313 · Tier 1 Technical Review</text>
  <text x="250" y="152" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">10</text>
  <text x="315" y="152" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">4,500.00</text>
  <text x="386" y="152" font-size="9" font-family="monospace" font-weight="600" text-anchor="end" fill="#09090b">45,000.00</text>
  <line x1="24" y1="170" x2="396" y2="170" stroke="#f4f4f5" stroke-width="1"/>
  
  <!-- Row 2 -->
  <text x="34" y="190" font-size="9" font-weight="600" fill="#09090b">Dedicated GPU Compute Cluster</text>
  <text x="34" y="201" font-size="8" font-mono font-family="monospace" fill="#71717a">SAC: 998315 · 40 Node Compute Hours</text>
  <text x="250" y="194" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">40</text>
  <text x="315" y="194" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">1,200.00</text>
  <text x="386" y="194" font-size="9" font-family="monospace" font-weight="600" text-anchor="end" fill="#09090b">48,000.00</text>
  <line x1="24" y1="212" x2="396" y2="212" stroke="#f4f4f5" stroke-width="1"/>
  
  <!-- Row 3 -->
  <text x="34" y="232" font-size="9" font-weight="600" fill="#09090b">Security Vulnerability Assessment</text>
  <text x="34" y="243" font-size="8" font-mono font-family="monospace" fill="#71717a">SAC: 998319 · SOC2 Compliance Audit</text>
  <text x="250" y="236" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">1</text>
  <text x="315" y="236" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">25,000.00</text>
  <text x="386" y="236" font-size="9" font-family="monospace" font-weight="600" text-anchor="end" fill="#09090b">25,000.00</text>
  <line x1="24" y1="254" x2="396" y2="254" stroke="#e4e4e7" stroke-width="1"/>
  
  <!-- Totals & Multi-Tier Tax -->
  <text x="240" y="278" font-size="9" fill="#71717a">Gross Taxable Amount:</text>
  <text x="386" y="278" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">118,000.00</text>
  
  <text x="240" y="294" font-size="9" fill="#059669">Early Settlement Rebate:</text>
  <text x="386" y="294" font-size="9" font-family="monospace" text-anchor="end" fill="#059669">-5,000.00</text>
  
  <text x="240" y="310" font-size="9" fill="#71717a">CGST @ 9.0%:</text>
  <text x="386" y="310" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">10,170.00</text>
  
  <text x="240" y="326" font-size="9" fill="#71717a">SGST @ 9.0%:</text>
  <text x="386" y="326" font-size="9" font-family="monospace" text-anchor="end" fill="#09090b">10,170.00</text>
  
  <line x1="240" y1="336" x2="386" y2="336" stroke="#09090b" stroke-width="1.5"/>
  
  <text x="240" y="358" font-size="11" font-weight="700" fill="#09090b">Total Invoice Amount (INR):</text>
  <text x="386" y="358" font-size="12" font-weight="700" font-family="monospace" text-anchor="end" fill="#09090b">₹ 1,33,340.00</text>
  
  <rect x="24" y="398" width="372" height="42" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="36" y="416" font-size="8" font-weight="700" fill="#09090b">BANK DETAILS FOR NEFT/RTGS</text>
  <text x="36" y="430" font-size="8" font-family="monospace" fill="#64748b">A/C: 9901428812903 · IFSC: HDFC0001892 · Gurugram Branch</text>
</svg>
`)}`;

export const SAMPLE_INVOICES: Record<'saas' | 'thermal' | 'gst', SampleInvoice> = {
  saas: {
    id: 'saas',
    label: 'SaaS Vendor Invoice',
    buttonLabel: 'Load Sample: SaaS Vendor Invoice',
    filename: 'vercel_saas_inv_8842.png',
    fileSize: '142.4 KB',
    dimensions: '1200 × 1560 px',
    documentType: 'Cloud Vendor Digital Invoice',
    confidence: 0.972,
    status: 'auto_approved',
    statusBadge: '97.2% Confidence · Auto-Approved',
    svgPreview: SAAS_INVOICE_SVG,
    extractedData: {
      vendor: 'Vercel Inc.',
      invoice_number: 'INV-2026-8842',
      date: '2026-10-12',
      currency: 'USD',
      subtotal: 144.50,
      discount: 14.45,
      tax: 10.40,
      shipping: 0.00,
      tip: 0.00,
      total: 140.45,
      overall_confidence: 0.972,
      line_items: [
        {
          description: 'Pro Team Subscription (Monthly Seat License)',
          quantity: 4,
          unit_price: 20.00,
          amount: 80.00,
          confidence: 0.98,
        },
        {
          description: 'Serverless Function Execution Overages (GB-hours)',
          quantity: 1,
          unit_price: 34.50,
          amount: 34.50,
          confidence: 0.96,
        },
        {
          description: 'Edge Middleware Requests (Million Invocations)',
          quantity: 2,
          unit_price: 15.00,
          amount: 30.00,
          confidence: 0.97,
        },
      ],
      _validation: {
        math_consistent: true,
        pii_detected: true,
        flagged_fields: [],
        schema_version: '2.1.0-pydantic-v2',
      },
    },
  },

  thermal: {
    id: 'thermal',
    label: 'Faded Thermal Retail Receipt',
    buttonLabel: 'Load Sample: Faded Thermal Retail Receipt',
    filename: 'bluebottle_thermal_receipt_7729.png',
    fileSize: '89.1 KB',
    dimensions: '1020 × 1620 px',
    documentType: 'Point-of-Sale POS Thermal Roll',
    confidence: 0.785,
    status: 'pending_review',
    statusBadge: '78.5% · Flagged for Human Review',
    statusReason: 'Low optical OCR confidence on line item #3 (optical smudge detected). Routed to review queue.',
    svgPreview: THERMAL_RECEIPT_SVG,
    extractedData: {
      vendor: 'Blue Bottle Coffee & Cafe',
      invoice_number: 'RCPT-7729',
      date: '2026-10-14',
      currency: 'USD',
      subtotal: 16.50,
      discount: 0.00,
      tax: 1.49,
      shipping: 0.00,
      tip: 3.00,
      total: 20.99,
      overall_confidence: 0.785,
      line_items: [
        {
          description: 'Single Origin Pour Over (Bella Donovan)',
          quantity: 1,
          unit_price: 6.25,
          amount: 6.25,
          confidence: 0.88,
        },
        {
          description: 'Almond Croissant (Pastry)',
          quantity: 1,
          unit_price: 5.50,
          amount: 5.50,
          confidence: 0.79,
        },
        {
          description: 'Cold Brew Bottle 8oz (Thermal smudge detected)',
          quantity: 1,
          unit_price: 4.75,
          amount: 4.75,
          confidence: 0.72,
        },
      ],
      _validation: {
        math_consistent: true,
        pii_detected: false,
        flagged_fields: ['line_items.2.confidence', 'overall_confidence'],
        schema_version: '2.1.0-pydantic-v2',
      },
    },
  },

  gst: {
    id: 'gst',
    label: 'Multi-Line Tax Invoice (GST)',
    buttonLabel: 'Load Sample: Multi-Line Tax Invoice (GST)',
    filename: 'cognitive_gst_invoice_994103.png',
    fileSize: '198.6 KB',
    dimensions: '1260 × 1620 px',
    documentType: 'Corporate GST Dual-Tax Invoice',
    confidence: 0.984,
    status: 'auto_approved',
    statusBadge: '98.4% Confidence · Auto-Approved',
    svgPreview: GST_INVOICE_SVG,
    extractedData: {
      vendor: 'Cognitive Systems Ltd.',
      invoice_number: 'GSTIN-994103',
      date: '2026-10-15',
      currency: 'INR',
      subtotal: 118000.00,
      discount: 5000.00,
      tax: 20340.00,
      shipping: 0.00,
      tip: 0.00,
      total: 133340.00,
      overall_confidence: 0.984,
      line_items: [
        {
          description: 'Cloud Infrastructure Architecture Consulting (SAC 998313)',
          quantity: 10,
          unit_price: 4500.00,
          amount: 45000.00,
          confidence: 0.99,
        },
        {
          description: 'Dedicated GPU Compute Cluster (SAC 998315)',
          quantity: 40,
          unit_price: 1200.00,
          amount: 48000.00,
          confidence: 0.97,
        },
        {
          description: 'Security & Vulnerability Compliance Audit (SAC 998319)',
          quantity: 1,
          unit_price: 25000.00,
          amount: 25000.00,
          confidence: 0.96,
        },
      ],
      _validation: {
        math_consistent: true,
        pii_detected: false,
        flagged_fields: [],
        schema_version: '2.1.0-pydantic-v2',
      },
    },
  },
};
