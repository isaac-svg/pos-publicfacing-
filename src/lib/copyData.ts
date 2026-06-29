export const HERO = {
  label: 'Shepherd POS',
  headline: 'Your Shop Runs. Even When You Don\'t.',
  sub: 'Real-time inventory. Cashier accountability. Credit collection on autopilot.',
  cta: 'Start free — 14 days, all features',
  ctaSecondary: 'See how it works',
}

export const PAIN_SECTION = {
  label: 'The Problem',
  headline: 'Retail in Ghana is still fighting yesterday\'s battles.',
  sub: 'Every day you\'re not using Shepherd, you\'re leaving money on the table.',
  cards: [
    {
      title: 'Cashier Theft',
      stat: '₵ 1,200+',
      description: 'Average monthly loss per shop to unrecorded sales, fake discounts, and phantom refunds.',
      icon: 'ShieldOff',
    },
    {
      title: 'Bad Credit',
      stat: '35%',
      description: 'Of credit sales never get collected. No reminders. No accountability. No system.',
      icon: 'CreditCard',
    },
    {
      title: 'Inventory Blindness',
      stat: '₵ 3,400+',
      description: 'Tied up in dead stock because you had no real-time data on what was moving.',
      icon: 'Package',
    },
  ],
}

export const CASHIER_MODULE = {
  label: 'Cashier Module',
  headline: 'Know exactly what every cashier is doing. In real time.',
  sub: 'Shift management with full accountability. Every transaction tracked. Every action logged.',
  stages: [
    {
      title: 'Shift Open',
      description: 'Cashier logs in with PIN. Starting float is recorded. Timer begins.',
      detail: 'No more shared logins. Every transaction is tied to a specific cashier.',
    },
    {
      title: 'Sale Logged',
      description: 'Every item scanned. Price verified. Payment recorded. Receipt printed.',
      detail: 'Cashier cannot modify prices beyond their权限. All discounts need manager approval.',
    },
    {
      title: 'Shift Close',
      description: 'Automatic reconciliation. Expected vs actual. Discrepancies flagged instantly.',
      detail: 'System compares sales against inventory movement for double verification.',
    },
    {
      title: 'Report Generated',
      description: 'Detailed report emailed to you. Cashier performance. Top products. Anomalies.',
      detail: 'Reports are generated automatically and sent to your phone via SMS and email.',
    },
  ],
}

export const CREDIT_SHIELD = {
  label: 'Credit Shield',
  headline: 'Stop chasing payments. Let the system do it.',
  sub: 'Automated credit collection that works while you sleep.',
  steps: [
    { title: 'Customer buys on credit', description: 'One tap. Credit limit checked. Sale completed.' },
    { title: 'SMS sent automatically', description: 'Customer receives instant SMS with amount and due date.' },
    { title: 'Payment reminder', description: 'Automated reminder 24 hours before due date.' },
    { title: 'Collection confirmed', description: 'Payment logged. Credit updated. Receipt sent.' },
  ],
  messages: [
    { sender: 'system', text: 'Credit alert: ₵150.00 due Jun 15' },
    { sender: 'customer', text: 'I\'ll come pay on Friday' },
    { sender: 'system', text: 'Reminder: ₵150.00 due tomorrow (Jun 15)' },
    { sender: 'customer', text: 'Coming to pay now' },
    { sender: 'system', text: '✅ Payment received: ₵150.00. Thank you!' },
  ],
}

export const SYSTEM_RESILIENCE = {
  label: 'Built for Ghana',
  headline: 'Runs anywhere. Works everywhere.',
  sub: 'From Accra to Tamale. Online or offline. Shepherd handles it.',
  features: [
    {
      title: 'Offline-First',
      description: 'Network down? No problem. Sales continue. Data syncs when you\'re back online.',
      icon: 'WifiOff',
    },
    {
      title: 'Any Printer',
      description: 'Thermal, A4, or mobile. Shepherd works with every printer available in Ghana.',
      icon: 'Printer',
    },
    {
      title: 'Multi-Shop Sync',
      description: 'Manage all your locations from one dashboard. Real-time. Unified.',
      icon: 'Store',
    },
    {
      title: 'Role-Based Access',
      description: 'Owners, managers, cashiers. Each with the right permissions. No more snooping.',
      icon: 'Shield',
    },
    {
      title: 'Real-Time Dashboard',
      description: 'Sales, profits, top products. All visible on your phone from anywhere.',
      icon: 'BarChart3',
    },
    {
      title: 'SMS Alerts',
      description: 'Get instant notifications for big sales, discrepancies, or suspicious activity.',
      icon: 'MessageSquare',
    },
  ],
}

export const SOCIAL_PROOF = {
  label: 'Trusted by Shop Owners',
  headline: 'Join businesses already running smoother.',
  stats: [
    { end: 500, suffix: '+', label: 'Businesses' },
    { end: 50000, suffix: '+', label: 'Transactions' },
    { end: 99.9, suffix: '%', label: 'Uptime' },
  ],
  testimonials: [
    {
      quote: 'Shepherd helped me recover over ₵2,000 in unrecorded sales in the first month. The credit collection feature alone is worth it.',
      name: 'Kwame A.',
      role: 'Shop Owner, Accra',
    },
    {
      quote: 'I manage 3 shops from my phone. The offline mode saved us during the network outages.',
      name: 'Ama S.',
      role: 'Business Owner, Kumasi',
    },
    {
      quote: 'The cashier accountability feature exposed things I didn\'t even know were happening. Essential for any retail business.',
      name: 'Yaw B.',
      role: 'Retailer, Takoradi',
    },
  ],
}

export const FINAL_CTA = {
  label: 'Get Started',
  headline: 'Ready to run your shop smarter?',
  sub: 'Start your 14-day free trial. No card required. No commitment.',
  cta: 'Start free — 14 days, all features',
  secondaryText: 'Full access. No credit card. Cancel anytime.',
}
