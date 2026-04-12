/**
 * Single source of truth for all GuidePay plan data.
 * Used by Landing page, Coverage page, and Dashboard.
 * Never hardcode ₹49, ₹58, ₹69 directly in JSX.
 */

export const PAYOUT_TIERS = [
  { tier: 'Bronze', orders: '< 8 orders/day', payout: 400, color: '#9CA3AF' },
  { tier: 'Silver', orders: '8–14 orders/day', payout: 600, color: '#2E90FA' },
  { tier: 'Gold', orders: '15+ orders/day', payout: 900, color: '#F59E0B' },
]

export const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    basePrice: 49,
    coverage: 600,
    payoutCoverage: '100%',
    badge: null,
    popular: false,
    description: 'For low-risk zones',
    zone: 'Low risk zone',
    cta: 'Get Basic',
    features: [
      'Up to ₹600/week coverage',
      'IMD flood trigger',
      'Platform outage trigger',
      'Govt curfew trigger',
      'UPI instant payout',
      'Basic risk score',
    ],
    notIncluded: [
      'AI 24h advance forecast',
      'Priority claim review',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    basePrice: 58,
    coverage: 600,
    badge: 'Most Popular',
    popular: true,
    description: 'Best for most workers',
    zone: 'Medium risk zone',
    cta: 'Get Standard →',
    features: [
      'Up to ₹600/week coverage',
      'All 5 triggers included',
      'UPI payout under 2 hours',
      'AI 24h flood forecast',
      'Worker risk score tracking',
      'Priority claim review',
      'Festival disruption cover',
      'Air quality cover',
    ],
    notIncluded: [],
  },
  {
    id: 'premium',
    name: 'Premium',
    basePrice: 69,
    coverage: 600,
    badge: 'Best Protection',
    popular: false,
    description: 'For high-risk flood zones',
    zone: 'High risk zone',
    cta: 'Get Premium',
    features: [
      'Up to ₹900/week (Gold tier)',
      'All 5 triggers included',
      'UPI payout under 1 hour',
      'AI 7-day flood forecast',
      'Auto coverage extension',
      'Priority fraud protection',
      'Dedicated claim tracking',
      'WhatsApp alerts',
      '24/7 support priority',
    ],
    notIncluded: [],
  },
  {
    id: 'daily',
    name: 'Daily Shield',
    basePrice: 12,
    coverage: 600,
    badge: 'MOST AFFORDABLE',
    popular: false,
    daily: true,
    description: 'Perfect for workers who want flexible daily protection',
    zone: 'Any zone',
    cta: 'Get Daily Shield',
    features: [
      'Up to ₹900/day (Gold tier)',
      'All 5 triggers included',
      'UPI payout in 2 hours',
      'Expires after 24 hours',
      'Flexible — renew anytime',
    ],
    notIncluded: ['Weekly auto-renewal', 'AI 7-day forecast'],
  },
]

export const getPlanById = (id) =>
  PLANS.find(p => p.id === id) || PLANS[1]

/**
 * Adjust plan price based on ML premium for the worker's zone.
 * @param {number} basePrice - Plan's base price
 * @param {number|null} mlPremium - ML-calculated premium from API
 * @param {number} standardBase - Standard plan base price (default 58)
 */
export const getAdjustedPrice = (basePrice, mlPremium, standardBase = 58) => {
  if (!mlPremium) return basePrice
  const ratio = mlPremium / standardBase
  return Math.max(35, Math.round(basePrice * ratio))
}

export default PLANS
