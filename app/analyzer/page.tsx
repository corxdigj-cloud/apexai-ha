'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  Brain, Plus, Trash2, Send, Bot, User, Zap, AlertTriangle,
  CheckCircle, TrendingUp, Target, Activity, Shield, Sparkles, Download
} from 'lucide-react'
import dynamic from 'next/dynamic'
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false })
import { Holding, Message } from '@/types'
const ConnectWalletModal = dynamic(() => import('@/components/ui/ConnectWalletModal'), { ssr: false })

const COIN_SUGGESTIONS = ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'Injective (INJ)', 'XRP', 'Cardano (ADA)', 'Avalanche (AVAX)', 'Chainlink (LINK)', 'Polygon (MATIC)', 'Uniswap (UNI)', 'Polkadot (DOT)', 'Cosmos (ATOM)']

const COIN_PRICES: Record<string, number> = {
  'Bitcoin (BTC)': 67842, 'Ethereum (ETH)': 3521, 'Solana (SOL)': 178.5,
  'Injective (INJ)': 24.3, 'XRP': 0.617, 'Cardano (ADA)': 0.48,
  'Avalanche (AVAX)': 38.2, 'Chainlink (LINK)': 14.8, 'Polygon (MATIC)': 0.72,
  'Uniswap (UNI)': 8.9, 'Polkadot (DOT)': 7.3, 'Cosmos (ATOM)': 8.1,
}

const RADAR_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

function parseMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f1f5f9">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color:#94a3b8">$1</em>')
    .replace(/^### (.*)/gm, '<div style="font-weight:700;color:#3b82f6;margin:12px 0 6px;font-size:14px">$1</div>')
    .replace(/^## (.*)/gm, '<div style="font-weight:700;color:#8b5cf6;margin:14px 0 8px;font-size:15px">$1</div>')
    .replace(/^# (.*)/gm, '<div style="font-weight:800;color:#f1f5f9;margin:16px 0 10px;font-size:16px">$1</div>')
    .replace(/^- (.*)/gm, '<div style="padding:3px 0;padding-left:16px;position:relative;color:#94a3b8;font-size:13px"><span style="position:absolute;left:0;color:#3b82f6">•</span>$1</div>')
    .replace(/\n/g, '<br/>')
}

export default function AnalyzerPage() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { coin: 'Bitcoin (BTC)', coinId: 'bitcoin', amount: 0.5, buyPrice: 58000 },
    { coin: 'Ethereum (ETH)', coinId: 'ethereum', amount: 4, buyPrice: 3200 },
  ])
  const [newHolding, setNewHolding] = useState({ coin: '', amount: '', buyPrice: '' })
  const [coinSuggestion, setCoinSuggestion] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<{ analysis: string; healthScore: number; riskLevel: string; sentiment: string; totalValue: string } | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hi! I\'m your AI portfolio analyst powered by LLaMA 3.3 70B. Add your holdings and click **Analyze Portfolio** for a comprehensive analysis, or ask me anything about crypto!' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Enrich holdings with current prices
  const enrichedHoldings = holdings.map(h => ({
    ...h,
    currentPrice: COIN_PRICES[h.coin] || h.buyPrice,
  }))

  const totalValue = enrichedHoldings.reduce((s, h) => s + (h.currentPrice || h.buyPrice) * h.amount, 0)
  const totalCost = enrichedHoldings.reduce((s, h) => s + h.buyPrice * h.amount, 0)
  const totalPnL = totalValue - totalCost
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost * 100) : 0

  const addHolding = () => {
    if (!newHolding.coin || !newHolding.amount || !newHolding.buyPrice) return
    const coinId = newHolding.coin.toLowerCase().replace(/\s*\(.*?\)/, '').replace(/\s+/g, '-')
    setHoldings([...holdings, {
      coin: newHolding.coin,
      coinId,
      amount: parseFloat(newHolding.amount),
      buyPrice: parseFloat(newHolding.buyPrice),
    }])
    setNewHolding({ coin: '', amount: '', buyPrice: '' })
    setCoinSuggestion([])
  }

  const removeHolding = (i: number) => setHoldings(holdings.filter((_, idx) => idx !== i))

  const handleAnalyze = async () => {
    if (holdings.length === 0) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings: enrichedHoldings }),
      })
      const data = await res.json()
      setAnalysis(data)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Analysis complete! Your portfolio has a health score of **${data.healthScore}/100** with **${data.riskLevel}** risk. Check the analysis panel for full details.`
      }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Analysis service temporarily unavailable. Please try again.' }])
    } finally {
      setAnalyzing(false)
    }
  }

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatLoading(true)
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatMessage: userMsg,
          holdings: enrichedHoldings,
          history: messages.slice(-8),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'I could not generate a response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  // Radar data
  const radarData = [
    { subject: 'Diversification', value: Math.min(holdings.length * 20, 90) },
    { subject: 'Risk Mgmt', value: analysis ? 100 - (analysis.healthScore * 0.4) : 55 },
    { subject: 'Market Cap', value: 70 },
    { subject: 'Liquidity', value: 85 },
    { subject: 'Growth', value: totalPnLPct > 0 ? Math.min(totalPnLPct * 2, 95) : 40 },
    { subject: 'Stability', value: 60 },
  ]

  // Pie data
  const pieData = enrichedHoldings.map((h, i) => ({
    name: h.coin,
    value: (h.currentPrice || h.buyPrice) * h.amount,
    color: RADAR_COLORS[i % RADAR_COLORS.length],
  }))

  // PnL trend
  const pnlTrend = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: totalCost + (totalPnL * (i / 29)) + Math.sin(i * 0.5) * (totalCost * 0.02),
  }))

  const sentimentColor = analysis?.sentiment === 'Bullish' ? '#10b981' : analysis?.sentiment === 'Bearish' ? '#ef4444' : '#f59e0b'

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '90px', maxWidth: '1400px', margin: '0 auto', padding: '90px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, fontFamily: 'Orbitron,monospace', color: '#f1f5f9', letterSpacing: '1px', marginBottom: '8px' }}>
                AI <span className="gradient-text">PORTFOLIO ANALYZER</span>
              </h1>
              <p style={{ color: '#475569', fontSize: '14px' }}>Powered by LLaMA 3.3 70B via Groq</p>
            </div>
            <button onClick={() => setWalletOpen(true)} className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px' }}>
              <Zap size={15} /> Import from Wallet
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }} className="analyzer-grid">
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Holdings input */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '16px' }}>📊 My Holdings</div>
                  <div className="badge badge-blue">{holdings.length} assets</div>
                </div>

                {/* Holdings list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {enrichedHoldings.map((h, i) => {
                    const value = (h.currentPrice || h.buyPrice) * h.amount
                    const pnl = ((h.currentPrice || h.buyPrice) - h.buyPrice) / h.buyPrice * 100
                    const pos = pnl >= 0
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${RADAR_COLORS[i % RADAR_COLORS.length]}20`, border: `1px solid ${RADAR_COLORS[i % RADAR_COLORS.length]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                          {h.coin.includes('BTC') ? '₿' : h.coin.includes('ETH') ? 'Ξ' : h.coin.includes('SOL') ? '◎' : '○'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.coin}</div>
                          <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>
                            {h.amount} × ${h.buyPrice.toLocaleString()} avg
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px', fontFamily: 'JetBrains Mono,monospace' }}>${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                          <div style={{ color: pos ? '#10b981' : '#ef4444', fontSize: '12px', fontFamily: 'JetBrains Mono,monospace' }}>{pos ? '+' : ''}{pnl.toFixed(2)}%</div>
                        </div>
                        <button onClick={() => removeHolding(i)} style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Add holding form */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'start' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      placeholder="Coin (e.g. Bitcoin)" value={newHolding.coin}
                      onChange={e => {
                        setNewHolding({ ...newHolding, coin: e.target.value })
                        const filtered = COIN_SUGGESTIONS.filter(c => c.toLowerCase().includes(e.target.value.toLowerCase()) && e.target.value.length > 0)
                        setCoinSuggestion(filtered.slice(0, 4))
                      }}
                      className="dark-input" style={{ fontSize: '13px' }}
                    />
                    {coinSuggestion.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(10,15,30,0.98)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', zIndex: 100, marginTop: '4px' }}>
                        {coinSuggestion.map(s => (
                          <div key={s} onClick={() => {
                            setNewHolding({ ...newHolding, coin: s, buyPrice: COIN_PRICES[s]?.toString() || newHolding.buyPrice })
                            setCoinSuggestion([])
                          }} style={{ padding: '10px 14px', cursor: 'pointer', color: '#f1f5f9', fontSize: '13px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}
                            onMouseEnter={e => (e.target as HTMLElement).style.background = 'rgba(59,130,246,0.1)'}
                            onMouseLeave={e => (e.target as HTMLElement).style.background = 'transparent'}
                          >{s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input placeholder="Amount" type="number" value={newHolding.amount} onChange={e => setNewHolding({ ...newHolding, amount: e.target.value })} className="dark-input" style={{ fontSize: '13px' }} />
                  <input placeholder="Buy Price $" type="number" value={newHolding.buyPrice} onChange={e => setNewHolding({ ...newHolding, buyPrice: e.target.value })} className="dark-input" style={{ fontSize: '13px' }} />
                  <button onClick={addHolding} className="btn-primary" style={{ padding: '12px 14px' }}><Plus size={18} /></button>
                </div>

                {/* Portfolio summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Value</div>
                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '18px', fontFamily: 'JetBrains Mono,monospace', marginTop: '4px' }}>${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total P&L</div>
                    <div style={{ color: totalPnL >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '18px', fontFamily: 'JetBrains Mono,monospace', marginTop: '4px' }}>
                      {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Return</div>
                    <div style={{ color: totalPnLPct >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '18px', fontFamily: 'JetBrains Mono,monospace', marginTop: '4px' }}>
                      {totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <button onClick={handleAnalyze} disabled={analyzing || holdings.length === 0} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px', opacity: analyzing || holdings.length === 0 ? 0.7 : 1, fontSize: '15px', padding: '14px' }}>
                  {analyzing ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> Analyzing with AI...</>
                  ) : (
                    <><Sparkles size={18} /> Analyze Portfolio</>
                  )}
                </button>
              </div>

              {/* Analysis result */}
              <AnimatePresence>
                {analysis && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Brain size={18} color="#8b5cf6" /> AI Analysis Report
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span className={`badge ${analysis.riskLevel.includes('High') ? 'badge-red' : analysis.riskLevel === 'Medium' ? 'badge-blue' : 'badge-green'}`}>
                          {analysis.riskLevel} Risk
                        </span>
                        <span className="badge" style={{ color: sentimentColor, borderColor: sentimentColor + '40', background: sentimentColor + '15' }}>
                          {analysis.sentiment}
                        </span>
                      </div>
                    </div>

                    {/* Health score */}
                    <div style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>Portfolio Health Score</span>
                        <span style={{ fontWeight: 800, fontSize: '24px', fontFamily: 'Orbitron,monospace', color: analysis.healthScore >= 70 ? '#10b981' : analysis.healthScore >= 50 ? '#f59e0b' : '#ef4444' }}>{analysis.healthScore}<span style={{ fontSize: '14px', color: '#475569' }}>/100</span></span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(99,102,241,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.healthScore}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                          style={{ height: '100%', background: analysis.healthScore >= 70 ? 'linear-gradient(90deg,#10b981,#06b6d4)' : analysis.healthScore >= 50 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#ef4444,#dc2626)', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Analysis text */}
                    <div style={{ background: 'rgba(10,15,30,0.4)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', padding: '18px', maxHeight: '400px', overflowY: 'auto' }}>
                      <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#94a3b8' }} dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis.analysis) }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Charts */}
              {holdings.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
                  {/* Pie */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '14px', marginBottom: '16px' }}>📊 Allocation</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.97)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }}
                          formatter={(v: any) => [`$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                    {pieData.slice(0, 4).map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                          <span style={{ color: '#94a3b8', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{p.name}</span>
                        </div>
                        <span style={{ color: '#f1f5f9', fontSize: '12px', fontFamily: 'JetBrains Mono,monospace' }}>{(p.value / totalValue * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Radar */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '14px', marginBottom: '16px' }}>🎯 Risk Radar</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(99,102,241,0.2)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Portfolio" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* PnL trend */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '14px', marginBottom: '16px' }}>📈 P&L Trend</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={pnlTrend}>
                        <defs>
                          <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={totalPnL >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={totalPnL >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.97)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }}
                          formatter={(v: any) => [`$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'Value']} />
                        <Area type="monotone" dataKey="value" stroke={totalPnL >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2} fill="url(#pnlGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Chat panel */}
            <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: 'fit-content', position: 'sticky', top: '90px' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px' }}>AI Assistant</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} className="pulse-glow" />
                      <span style={{ color: '#10b981', fontSize: '11px' }}>LLaMA 3.3 70B · Online</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, maxHeight: '450px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: msg.role === 'user' ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="#8b5cf6" />}
                    </div>
                    <div style={{
                      maxWidth: '85%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.55,
                      background: msg.role === 'user' ? 'linear-gradient(135deg,rgba(59,130,246,0.25),rgba(139,92,246,0.25))' : 'rgba(10,15,30,0.7)',
                      border: '1px solid ' + (msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.1)'),
                      color: '#94a3b8',
                    }} dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                  </motion.div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={14} color="#8b5cf6" /></div>
                    <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(99,102,241,0.1)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0, 1, 2].map(i => <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#475569' }} />)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={{ padding: '16px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    placeholder="Ask about your portfolio..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
                    className="dark-input" style={{ flex: 1, fontSize: '13px', padding: '10px 14px' }}
                  />
                  <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} className="btn-primary" style={{ padding: '10px 14px', flexShrink: 0 }}>
                    <Send size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {['What is my risk?', 'Rebalancing tips', 'Market outlook'].map(q => (
                    <button key={q} onClick={() => { setChatInput(q) }} style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#64748b', fontSize: '11px', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .analyzer-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .analyzer-grid > div:first-child > div:first-child > div:nth-child(3) {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </div>
  )
}
