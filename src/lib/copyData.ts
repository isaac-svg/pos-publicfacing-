export const NAV = {
  brand: 'Shepherd',
  links: [
    { label: 'Features', href: '#pillars' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ],
  login: 'Log in',
  cta: 'Start Free Trial',
}

export const HERO = {
  headline: 'Stop Running a Shop That Leaks Money.',
  subheadline:
    'Take total control with the Gold Standard Retail OS. Eliminate cashier theft, stop bad credit debt, and run your business on autopilot.',
  cta: 'Start Your 14-Day Free Trial',
  ctaSubtext: 'No Credit Card Needed • Setup in 5 Minutes',
}

export const PROBLEM = {
  anchor: "You can't watch your shop 24/7. That's when money vanishes.",
  killers: [
    {
      id: 'cashier',
      title: 'The Cashier Leak',
      description:
        "Small 'mismatches' at closing time that add up to thousands a year.",
    },
    {
      id: 'debt',
      title: 'The Debt Black Hole',
      description:
        'Customers who buy on credit, ignore your texts, and ghost your cashiers.',
    },
    {
      id: 'network',
      title: 'The Network Crash',
      description:
        'Poor internet that freezes your checkout lines and drives customers away.',
    },
  ],
  callout:
    'Most software is just a glorified calculator. We built a Retail Vault.',
}

export const PILLARS = [
  {
    id: 'anti-theft',
    title: 'The Anti-Theft Guard',
    features: [
      {
        label: 'Live Register Tracking',
        description: 'Know exactly who opened the drawer and when.',
      },
      {
        label: 'Instant Variance Alerts',
        description:
          'If the cash drawer is short by even 1 Cedi, the system flags it instantly.',
      },
      {
        label: 'Zero Deleted Sales',
        description:
          'Track every single voided item and cancelled checkout in real-time.',
      },
    ],
  },
  {
    id: 'credit-shield',
    title: 'The Credit Shield',
    badge: 'World-First Feature',
    features: [
      {
        label: 'Ghana Card Verification',
        description:
          "Instantly verify a customer's real government ID before giving credit.",
      },
      {
        label: 'MoMo Name Verification',
        description:
          'Cross-check their phone registration name to stop identity fraud.',
      },
      {
        label: 'Automated Ghost Collector',
        description:
          'The system text-messages debtors automatically. No awkward phone calls.',
      },
    ],
  },
  {
    id: 'internet-shield',
    title: 'The Internet Bulletproof Shield',
    features: [
      {
        label: '100% Offline Checkout',
        description:
          'Internet dies? Light goes off? Keep scanning and printing receipts.',
      },
      {
        label: 'Local Snapshot Cache',
        description:
          'Your data is safely saved locally and auto-syncs the second network returns.',
      },
      {
        label: 'Hardware Persistence',
        description:
          'Your USB, LAN, and Bluetooth printers stay locked in. Zero driver errors.',
      },
    ],
  },
  {
    id: 'accountant',
    title: 'The 1-Click Accountant',
    features: [
      {
        label: 'Live Financial Reports',
        description:
          'Your Profit & Loss, Balance Sheets, and Cash Flow statements calculate automatically with every scan.',
      },
      {
        label: 'No Accounting Degree Needed',
        description:
          'Stop wasting hours on messy Excel sheets or paying for expensive software audits.',
      },
      {
        label: 'Real-Time Balance Checks',
        description:
          'Open your dashboard anywhere in the world and see your true take-home profits instantly.',
      },
    ],
  },
  {
    id: 'expense-matrix',
    title: 'The Expense & Supplier Matrix',
    features: [
      {
        label: 'Complete Supplier Tracking',
        description:
          'Log what you owe to suppliers, track purchase histories, and manage supplier payments in one place.',
      },
      {
        label: 'Stop Hidden Capital Leaks',
        description:
          'Monitor daily overhead like shop rent, utility bills, and staff salaries alongside inventory costs.',
      },
      {
        label: 'Maximize Cash Flow',
        description:
          'Instantly see exactly where your revenue is going before hidden expenses eat your margins.',
      },
    ],
  },
] as const

export const CLARITY_GRID = {
  rows: [
    {
      problem: 'Mobile Money Fraud',
      solution: 'Direct Mobile Money Automation',
      description:
        'Customers get a direct PIN prompt on their phones. No fake screenshots, no cashier manual errors.',
    },
    {
      problem: 'Empty Shelves',
      solution: 'Low-Stock SMS Alerts',
      description:
        'The system texts your personal phone the moment a bestseller runs low, so you can reorder instantly.',
    },
    {
      problem: 'Messy Accounting',
      solution: '1-Click Live Ledgers',
      description:
        'Your Profit & Loss, Balance Sheets, and Cash Flow update automatically with every single barcode scan.',
    },
  ],
}

export const TRIAL_OFFER = {
  headline: 'Try the Entire System Free for 14 Days',
  stack: [
    {
      title: 'Full Access',
      description:
        'Test every single feature, multi-shop layout, and credit shield tool.',
    },
    {
      title: 'Done-For-You Stock Upload',
      description:
        'Send us your Excel sheets or paper invoices—our team will upload your entire stock list for you during your trial.',
    },
    {
      title: 'Free Staff Training',
      description:
        'Short, 15-minute video guides to get your cashiers up to speed without you being there.',
    },
  ],
  cta: 'Claim Your Free 14-Day Trial Now',
  ctaSubtext:
    "Zero risk. Cancel anytime with one click if it doesn't transform your business.",
}

export const PRICING = {
  tiers: [
    {
      id: 'solo',
      name: 'The Solo Store',
      monthlyPrice: 99,
      annualPrice: 990,
      limits: '1 Shop Location • Max 2 Cashier Profiles',
      benefits: [
        'No More Wrong Change',
        'Works Without Internet',
        'Fast Product Setup',
        'Custom Shop Receipts',
        'Live Sales Counter',
      ],
      rules:
        'Cash payment method only. On-screen low-stock dashboard badges only. No outbound SMS allowed.',
    },
    {
      id: 'growth',
      name: 'The Growth Engine',
      tag: 'Best Value',
      popular: true,
      monthlyPrice: 169,
      annualPrice: 1690,
      limits: 'Up to 2 Shop Locations • Unlimited Cashiers',
      smsCredits: 'Includes 300 FREE System SMS Credits every single month!',
      benefits: [
        'Everything in Solo Store',
        'Catch Missing Cash Instantly',
        'Manage 2 Branches Safely',
        'Low-Stock SMS Text Alerts',
        'Track Expenses & Rent',
        'Keep Book for Regulars',
      ],
      rules:
        'Activates shift management, basic credit limits, and expense/supplier logging. No Ghana Card ID checks, no direct mobile money gateway, no accounting ledgers.',
    },
    {
      id: 'vip',
      name: 'The Retail VIP Suite',
      tag: 'Premium Flagship',
      monthlyPrice: 259,
      annualPrice: 2590,
      limits: 'Unlimited Shop Locations • Unlimited Cashiers',
      smsCredits:
        'Includes 900 FREE System SMS Credits every single month + High-Priority Routing!',
      benefits: [
        'Everything in Growth Engine',
        'No-Risk Credit Protection (Ghana Card + MoMo Name Verification + Guarantors)',
        'Automatic Mobile Money Checkout (Direct PIN Prompt)',
        '1-Click Shop Accounting (Real-time General Ledger, Balance Sheet, Cash Flow, Trial Balance)',
        'Infinite Scale Replication',
        'Done-For-You VIP Setup',
      ],
    },
  ],
}

export const FAQ = {
  items: [
    {
      question: "I don't have time to manually upload 500 different products.",
      answer:
        'Done-For-You Inventory Loading: Send us your current files or paper invoices. Our engineering team will format and clean your database, auto-generate your high-speed SKUs, and upload it to your profile within 24 hours. Free of charge.',
    },
    {
      question: 'What happens if my shop data cuts out mid-sale?',
      answer:
        'Zero-Downtime Cache Isolation: The application runs completely detached from web latency. If connection drops, operations remain completely identical. Transactions buffer safely in local snapshot caches and force-sync back to your ledger the exact millisecond internet returns.',
    },
    {
      question:
        'Chasing regular clients for debt ruins my neighborhood trust.',
      answer:
        'Autonomous Collection Reminders: Let the software do the heavy lifting. The system tracks due timelines and sends objective, platform-stamped reminders automatically. Because their National ID and verified mobile records are securely linked, they settle up immediately without a single awkward interaction.',
    },
    {
      question:
        'Do I need to buy expensive new barcode scanners and receipt printers from you?',
      answer:
        'Universal Hardware Support: No hardware lock-in. Our built-in hardware polling suite connects instantly to your existing USB, LAN, or Bluetooth printers and scanners without driver configuration errors.',
    },
    {
      question:
        'Can my cashiers look at my profit margins or change historical sales data?',
      answer:
        'Ironclad Owner Permission Guards: You are in absolute control. Cashiers are strictly locked into the checkout screen and cannot view accounting metrics, modify stock numbers, or void historical records without owner authorization.',
    },
    {
      question:
        'Are there hidden transactional fees on my Mobile Money sales?',
      answer:
        '0% Software Markup: We charge zero processing fees on top of your transactions. Your money moves directly through your own mobile money configuration straight into your business accounts at your standard provider rates.',
    },
    {
      question:
        'If I open a third branch outside Accra, can I really monitor it remotely?',
      answer:
        'Real-Time Central Command: Yes. Your dashboard syncs branch analytics automatically, allowing you to set distinct prices per shop, assign localized managers, and monitor closing variance reports anywhere in the world.',
    },
    {
      question: 'What happens at the end of my 14-day free trial?',
      answer:
        'Zero Commitment Walkaway: When the trial concludes, you choose the tier that fits your growth stage. Your database remains perfectly intact, and we never touch your cash flow without your explicit permission.',
    },
  ],
}

export const FOOTER = {
  brand: 'Shepherd POS',
  tagline: 'The Gold Standard Retail OS for Ghana',
  copyright: `© ${new Date().getFullYear()} Shepherd POS. All rights reserved.`,
}
