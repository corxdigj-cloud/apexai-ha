import { NextResponse } from 'next/server'
import { fetchCoinPrices, fetchTopCoins } from '@/lib/coingecko'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'tracked'

  try {
    if (type === 'top') {
      const data = await fetchTopCoins(20)
      return NextResponse.json(data)
    }
    const data = await fetchCoinPrices()
    return NextResponse.json(data)
  } catch (error) {
    console.error('CoinGecko error:', error)
    // Return mock data on failure
    return NextResponse.json(getMockPrices())
  }
}

function getMockPrices() {
  return [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67842, market_cap: 1335000000000, price_change_percentage_24h: 2.34, total_volume: 28000000000, sparkline_in_7d: { price: [64000,65000,66000,65500,67000,67500,67842] }, market_cap_rank: 1 },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3521, market_cap: 423000000000, price_change_percentage_24h: -1.2, total_volume: 14000000000, sparkline_in_7d: { price: [3600,3550,3500,3480,3520,3510,3521] }, market_cap_rank: 2 },
    { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 178.5, market_cap: 83000000000, price_change_percentage_24h: 5.67, total_volume: 3500000000, sparkline_in_7d: { price: [165,168,172,170,175,177,178.5] }, market_cap_rank: 5 },
    { id: 'injective-protocol', symbol: 'inj', name: 'Injective', current_price: 24.3, market_cap: 2300000000, price_change_percentage_24h: 8.12, total_volume: 180000000, sparkline_in_7d: { price: [22,23,22.5,23.5,24,24.1,24.3] }, market_cap_rank: 42 },
    { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.617, market_cap: 34000000000, price_change_percentage_24h: -0.8, total_volume: 1200000000, sparkline_in_7d: { price: [0.62,0.63,0.61,0.60,0.615,0.618,0.617] }, market_cap_rank: 7 },
  ]
}
