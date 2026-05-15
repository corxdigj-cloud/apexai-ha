export interface CoinData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  total_volume: number
  sparkline_in_7d?: { price: number[] }
  market_cap_rank: number
  circulating_supply: number
  ath: number
  atl: number
}

export interface Holding {
  id?: string
  coin: string
  coinId: string
  amount: number
  buyPrice: number
  currentPrice?: number
}

export interface Portfolio {
  id?: string
  user_id?: string
  name: string
  holdings: Holding[]
  total_value?: number
  created_at?: string
}

export interface AIAnalysis {
  healthScore: number
  riskLevel: 'Low' | 'Medium' | 'Medium-High' | 'High' | 'Very High'
  summary: string
  recommendations: string[]
  warnings: string[]
  diversificationScore: number
  volatilityScore: number
  marketExposure: string
  sentiment: 'Bullish' | 'Neutral' | 'Bearish'
}

export interface ChartPoint {
  time: string
  price: number
  volume?: number
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}
