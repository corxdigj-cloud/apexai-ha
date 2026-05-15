'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, Flame, Filter, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false })
import { CoinData, ChartPoint } from '@/types'
import { formatPrice, formatMarketCap, COIN_IDS } from '@/lib/coingecko'

const COINS = ['BTC', 'ETH', 'SOL', 'INJ', 'XRP']
const TIME_FILTERS = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
]

const mockNews = [
  { title: 'Bitcoin tests key resistance as institutional demand surges', time: '2h ago', sentiment: 'bullish', source: 'CryptoIntelligence' },
  { title: 'Ethereum Layer 2 TVL reaches new all-time high of $42B', time: '4h ago', sentiment: 'bullish', source: 'DeFiPulse' },
  { title: 'Solana ecosystem sees record daily active addresses', time: '6h ago', sentiment: 'bullish', source: 'SolanaFM' },
  { title: 'Regulatory clarity expected for DeFi protocols in Q1 2026', time: '8h ago', sentiment: 'neutral', source: 'TheBlock' },
  { title: 'Market volatility spikes as macro uncertainty weighs on risk assets', time: '12h ago', sentiment: 'bearish', source: 'CoinDesk' },
]

export default function ChartsPage() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [timeFilter, setTimeFilter] = useState(7)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)

  const coinId = COIN_IDS[selectedCoin] || 'bitcoin'
  const currentCoin = coins.find(c => c.symbol?.toUpperCase() === selectedCoin)
  const isPositive = (currentCoin?.price_change_percentage_24h || 0) >= 0

  const fetchChart = useCallback(async () => {
    setChartLoading(true)
    try {
      const res = await fetch(`/api/prices/history?coin=${coinId}&days=${timeFilter}`)
      const data = await res.json()
      const prices: [number, number][] = data.prices || []
      const formatted: ChartPoint[] = prices.map(([ts, price]) => {
        const d = new Date(ts)
        const label = timeFilter <= 1
          ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return { time: label, price: parseFloat(price.toFixed(6)) }
      })
      setChartData(formatted.filter((_, i) => i % Math.max(1, Math.floor(formatted.length / 200)) === 0))
    } catch (e) {
      console.error(e)
    } finally {
      setChartLoading(false)
    }
  }, [coinId, timeFilter])

  useEffect(() => {
    fetch('/api/prices').then(r => r.json()).then(d => { setCoins(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchChart() }, [fetchChart])

  const priceChange = chartData.length > 1
    ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price * 100)
    : 0

  // Heatmap data
  const heatmapCoins = [
    { name: 'BTC', change: 2.34, size: 'large' },
    { name: 'ETH', change: -1.2, size: 'large' },
    { name: 'BNB', change: 0.8, size: 'medium' },
    { name: 'SOL', change: 5.67, size: 'medium' },
    { name: 'XRP', change: -0.8, size: 'medium' },
    { name: 'ADA', change: 3.2, size: 'small' },
    { name: 'AVAX', change: -2.1, size: 'small' },
    { name: 'DOT', change: 1.4, size: 'small' },
    { name: 'LINK', change: 4.8, size: 'small' },
    { name: 'INJ', change: 8.12, size: 'small' },
    { name: 'MATIC', change: -3.4, size: 'small' },
    { name: 'UNI', change: 2.1, size: 'small' },
  ]

  // Mock market stats
  const rsi = 58
  const fearGreed = 65

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '90px', maxWidth: '1400px', margin: '0 auto', padding: '90px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, fontFamily: 'Orbitron,monospace', color: '#f1f5f9', letterSpacing: '1px', marginBottom: '8px' }}>
              MARKETS <span className="gradient-text">& ANALYTICS</span>
            </h1>
            <p style={{ color: '#475569', fontSize: '14px' }}>Professional trading charts and market intelligence</p>
          </div>

          {/* Coin selector */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {COINS.map(coin => {
              const c = coins.find(x => x.symbol?.toUpperCase() === coin)
              const pos = (c?.price_change_percentage_24h || 0) >= 0
              return (
                <button key={coin} onClick={() => setSelectedCoin(coin)} style={{
                  padding: '10px 18px', borderRadius: '10px', border: '1px solid',
                  borderColor: selectedCoin === coin ? '#3b82f6' : 'rgba(99,102,241,0.2)',
                  background: selectedCoin === coin ? 'rgba(59,130,246,0.15)' : 'rgba(10,15,30,0.6)',
                  color: selectedCoin === coin ? '#3b82f6' : '#94a3b8',
                  cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'Space Grotesk,sans-serif',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.2s',
                }}>
                  <span>{coin}</span>
                  {c && <span style={{ fontSize: '11px', color: pos ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono,monospace' }}>{pos ? '+' : ''}{(c.price_change_percentage_24h || 0).toFixed(2)}%</span>}
                </button>
              )
            })}
            <button onClick={fetchChart} style={{ marginLeft: 'auto', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(10,15,30,0.6)', color: '#64748b', cursor: 'pointer' }}>
              <RefreshCw size={16} style={{ animation: chartLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }} className="charts-grid">
            {/* Main chart */}
            <div>
              <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, fontFamily: 'JetBrains Mono,monospace', color: '#f1f5f9' }}>
                      {currentCoin ? formatPrice(currentCoin.current_price) : '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      {priceChange >= 0 ? <TrendingUp size={16} color="#10b981" /> : <TrendingDown size={16} color="#ef4444" />}
                      <span style={{ color: priceChange >= 0 ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '14px' }}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% ({TIME_FILTERS.find(t => t.days === timeFilter)?.label})
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {TIME_FILTERS.map(tf => (
                      <button key={tf.label} onClick={() => setTimeFilter(tf.days)} style={{
                        padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: timeFilter === tf.days ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'rgba(10,15,30,0.6)',
                        color: timeFilter === tf.days ? 'white' : '#64748b', fontWeight: 600, fontSize: '12px', fontFamily: 'Space Grotesk,sans-serif',
                      }}>{tf.label}</button>
                    ))}
                  </div>
                </div>

                {chartLoading ? (
                  <div className="skeleton" style={{ height: '280px', borderRadius: '10px' }} />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                      <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => formatPrice(v).replace('$', '$')} width={80} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.97)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', color: '#f1f5f9', fontSize: '13px' }} formatter={(v: any) => [formatPrice(v), selectedCoin]} />
                      <Area type="monotone" dataKey="price" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2} fill="url(#chartGrad)" dot={false} activeDot={{ r: 4, fill: isPositive ? '#10b981' : '#ef4444' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Volume bars */}
              {currentCoin && (
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Market Stats — {selectedCoin}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px' }}>
                    {[
                      { label: '24h Volume', value: formatMarketCap(currentCoin.total_volume) },
                      { label: 'Market Cap', value: formatMarketCap(currentCoin.market_cap) },
                      { label: 'Rank', value: `#${currentCoin.market_cap_rank}` },
                      { label: 'ATH', value: currentCoin.ath ? formatPrice(currentCoin.ath) : '—' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ color: '#475569', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', fontFamily: 'JetBrains Mono,monospace' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* RSI */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Technical Indicators</div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>RSI (14)</span>
                    <span style={{ color: rsi > 70 ? '#ef4444' : rsi < 30 ? '#10b981' : '#f59e0b', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace' }}>{rsi}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(99,102,241,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${rsi}%`, background: rsi > 70 ? '#ef4444' : rsi < 30 ? '#10b981' : '#f59e0b', borderRadius: '3px', transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: '#10b981', fontSize: '10px' }}>Oversold</span>
                    <span style={{ color: '#94a3b8', fontSize: '10px' }}>Neutral</span>
                    <span style={{ color: '#ef4444', fontSize: '10px' }}>Overbought</span>
                  </div>
                </div>

                {[
                  { label: 'MA 20', value: currentCoin ? formatPrice(currentCoin.current_price * 0.97) : '—', color: '#3b82f6' },
                  { label: 'MA 50', value: currentCoin ? formatPrice(currentCoin.current_price * 0.94) : '—', color: '#8b5cf6' },
                  { label: 'MA 200', value: currentCoin ? formatPrice(currentCoin.current_price * 0.88) : '—', color: '#06b6d4' },
                  { label: 'VWAP', value: currentCoin ? formatPrice(currentCoin.current_price * 0.995) : '—', color: '#f59e0b' },
                ].map(ma => (
                  <div key={ma.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '2px', background: ma.color, borderRadius: '1px' }} />
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{ma.label}</span>
                    </div>
                    <span style={{ color: '#f1f5f9', fontFamily: 'JetBrains Mono,monospace', fontSize: '13px', fontWeight: 600 }}>{ma.value}</span>
                  </div>
                ))}
              </div>

              {/* Fear & Greed */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Fear & Greed Index</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 900, fontFamily: 'Orbitron,monospace', color: fearGreed > 60 ? '#10b981' : fearGreed > 40 ? '#f59e0b' : '#ef4444' }}>{fearGreed}</div>
                  <div style={{ color: fearGreed > 60 ? '#10b981' : fearGreed > 40 ? '#f59e0b' : '#ef4444', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
                    {fearGreed > 60 ? 'Greed' : fearGreed > 40 ? 'Neutral' : 'Fear'}
                  </div>
                  <div style={{ height: '8px', background: 'linear-gradient(90deg,#ef4444,#f59e0b,#10b981)', borderRadius: '4px', position: 'relative', marginBottom: '8px' }}>
                    <div style={{ position: 'absolute', top: '-3px', left: `${fearGreed}%`, transform: 'translateX(-50%)', width: '14px', height: '14px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#475569' }}>
                    <span>Extreme Fear</span><span>Extreme Greed</span>
                  </div>
                </div>
              </div>

              {/* Support/Resistance */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Support / Resistance</div>
                {currentCoin && [
                  { label: 'R2', value: currentCoin.current_price * 1.08, type: 'resistance' },
                  { label: 'R1', value: currentCoin.current_price * 1.03, type: 'resistance' },
                  { label: 'Current', value: currentCoin.current_price, type: 'current' },
                  { label: 'S1', value: currentCoin.current_price * 0.97, type: 'support' },
                  { label: 'S2', value: currentCoin.current_price * 0.93, type: 'support' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                    <span style={{ color: l.type === 'resistance' ? '#ef4444' : l.type === 'support' ? '#10b981' : '#3b82f6', fontSize: '12px', fontWeight: 600 }}>{l.label}</span>
                    <span style={{ color: '#f1f5f9', fontFamily: 'JetBrains Mono,monospace', fontSize: '12px' }}>{formatPrice(l.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top movers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px', marginTop: '24px' }}>
            {[{ title: '🚀 Top Gainers', filter: 'gain' }, { title: '📉 Top Losers', filter: 'loss' }, { title: '🔥 Trending', filter: 'trend' }].map(section => (
              <div key={section.title} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '16px', fontSize: '15px' }}>{section.title}</div>
                {[...coins].sort((a, b) => section.filter === 'loss'
                  ? (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
                  : (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
                ).slice(0, 4).map(coin => (
                  <div key={coin.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {coin.image && <img src={coin.image} alt={coin.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />}
                      <div>
                        <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '13px' }}>{coin.symbol?.toUpperCase()}</div>
                        <div style={{ color: '#475569', fontSize: '11px' }}>{formatPrice(coin.current_price)}</div>
                      </div>
                    </div>
                    <span className={`badge ${(coin.price_change_percentage_24h || 0) >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}{(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Activity size={18} color="#3b82f6" />
              <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '16px' }}>Market Heatmap</span>
              <span style={{ color: '#475569', fontSize: '12px' }}>24h performance</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {heatmapCoins.map(coin => {
                const intensity = Math.abs(coin.change) / 10
                const bg = coin.change >= 0
                  ? `rgba(16,185,129,${Math.min(0.15 + intensity * 0.5, 0.7)})`
                  : `rgba(239,68,68,${Math.min(0.15 + intensity * 0.5, 0.7)})`
                const size = coin.size === 'large' ? 120 : coin.size === 'medium' ? 85 : 65
                return (
                  <div key={coin.name} style={{
                    width: `${size}px`, height: `${size}px`, borderRadius: '10px',
                    background: bg, border: `1px solid ${coin.change >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}>
                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: coin.size === 'large' ? '16px' : '13px' }}>{coin.name}</div>
                    <div style={{ color: coin.change >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: coin.size === 'large' ? '14px' : '11px', fontFamily: 'JetBrains Mono,monospace' }}>
                      {coin.change >= 0 ? '+' : ''}{coin.change}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* News */}
          <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Flame size={18} color="#f59e0b" />
              <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '16px' }}>Market Intelligence</span>
              <span className="badge badge-blue">AI Curated</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {mockNews.map((news, i) => (
                <div key={i} style={{ padding: '16px 0', borderBottom: i < mockNews.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '14px', marginBottom: '6px', lineHeight: 1.4 }}>{news.title}</div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontSize: '12px' }}>{news.source}</span>
                      <span style={{ color: '#1e293b' }}>•</span>
                      <span style={{ color: '#475569', fontSize: '12px' }}>{news.time}</span>
                    </div>
                  </div>
                  <span className={`badge ${news.sentiment === 'bullish' ? 'badge-green' : news.sentiment === 'bearish' ? 'badge-red' : 'badge-blue'}`}>
                    {news.sentiment}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .charts-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
