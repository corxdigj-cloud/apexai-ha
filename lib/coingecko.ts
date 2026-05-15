const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
}
if (API_KEY) headers['x-cg-demo-api-key'] = API_KEY

export const TRACKED_COINS = ['bitcoin', 'ethereum', 'solana', 'injective-protocol', 'ripple']
export const COIN_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  INJ: 'injective-protocol',
  XRP: 'ripple',
}
export const COIN_SYMBOLS: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  'injective-protocol': 'INJ',
  ripple: 'XRP',
}

export async function fetchCoinPrices() {
  const ids = TRACKED_COINS.join(',')
  const res = await fetch(
    `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`,
    { headers, next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error('Failed to fetch prices')
  return res.json()
}

export async function fetchCoinHistory(coinId: string, days: number | string) {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
    { headers, next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function fetchTopCoins(limit = 20) {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`,
    { headers, next: { revalidate: 120 } }
  )
  if (!res.ok) throw new Error('Failed to fetch top coins')
  return res.json()
}

export async function fetchGlobalData() {
  const res = await fetch(`${COINGECKO_BASE}/global`, {
    headers,
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error('Failed to fetch global data')
  return res.json()
}

export function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

export function formatMarketCap(mc: number): string {
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`
  return `$${mc.toLocaleString()}`
}
