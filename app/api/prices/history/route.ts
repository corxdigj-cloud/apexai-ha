import { NextResponse } from 'next/server'
import { fetchCoinHistory } from '@/lib/coingecko'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const coin = searchParams.get('coin') || 'bitcoin'
  const days = searchParams.get('days') || '7'

  try {
    const data = await fetchCoinHistory(coin, days)
    return NextResponse.json(data)
  } catch (error) {
    console.error('History fetch error:', error)
    // Return generated mock data
    const points = generateMockHistory(coin, parseInt(days as string) || 7)
    return NextResponse.json({ prices: points })
  }
}

function generateMockHistory(coin: string, days: number) {
  const basePrices: Record<string, number> = {
    bitcoin: 67000, ethereum: 3500, solana: 175, 'injective-protocol': 24, ripple: 0.61
  }
  const base = basePrices[coin] || 100
  const now = Date.now()
  const points = []
  const count = Math.min(days * 24, 500)
  let price = base * 0.92
  for (let i = count; i >= 0; i--) {
    const time = now - i * (days * 3600000 / count)
    price = price * (1 + (Math.random() - 0.48) * 0.025)
    points.push([time, price])
  }
  return points
}
