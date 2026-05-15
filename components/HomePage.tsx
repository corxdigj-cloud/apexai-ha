'use client'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import {
  Brain, Shield, Activity, Bell,
  Wallet, ArrowRight, Sparkles, BarChart3, Globe, Lock,
  ChevronDown, Mail, Zap, TrendingUp, MessageSquare, Code2
} from 'lucide-react'
import dynamic from 'next/dynamic'
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false })
import { CoinData } from '@/types'
import { formatPrice, formatMarketCap } from '@/lib/coingecko'

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const duration = 1500
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * ease)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{prefix}{display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}</>
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const normalized = data.map(v => ((v - min) / range) * 36)
  const points = normalized.map((v, i) => `${(i / (data.length - 1)) * 110},${36 - v}`).join(' ')
  const color = positive ? '#10b981' : '#ef4444'
  return (
    <svg width="110" height="40" viewBox="0 0 110 40">
      <defs>
        <linearGradient id={`g${positive ? 'p' : 'n'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,36 ${points} 110,36`} fill={`url(#g${positive ? 'p' : 'n'})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CoinCard({ coin, index }: { coin: CoinData; index: number }) {
  const positive = (coin.price_change_percentage_24h || 0) >= 0
  const sparkData = coin.sparkline_in_7d?.price?.slice(-20) || []
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '20px', flex: '1', minWidth: '180px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {coin.image && <img src={coin.image} alt={coin.name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />}
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>{coin.symbol?.toUpperCase()}</div>
            <div style={{ color: '#475569', fontSize: '12px' }}>{coin.name}</div>
          </div>
        </div>
        <div className={`badge ${positive ? 'badge-green' : 'badge-red'}`}>
          {positive ? '+' : ''}{(coin.price_change_percentage_24h || 0).toFixed(2)}%
        </div>
      </div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>
        {formatPrice(coin.current_price)}
      </div>
      <div style={{ color: '#475569', fontSize: '12px', marginBottom: '10px' }}>
        MCap: {formatMarketCap(coin.market_cap)}
      </div>
      {sparkData.length > 0 && <Sparkline data={sparkData} positive={positive} />}
    </motion.div>
  )
}

const portfolioAllocation = [
  { name: 'Bitcoin', value: 45, color: '#F7931A' },
  { name: 'Ethereum', value: 28, color: '#627EEA' },
  { name: 'Solana', value: 15, color: '#9945FF' },
  { name: 'Other', value: 12, color: '#3b82f6' },
]

const perfData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: 38000 + Math.sin(i * 0.4) * 4000 + i * 380 + (Math.random() - 0.3) * 1500,
}))

const features = [
  { icon: Brain, title: 'AI Portfolio Analysis', desc: 'LLaMA 3.3 70B analyzes holdings, risk exposure, and market position to deliver personalized insights.', badge: 'AI Powered', color: '#8b5cf6' },
  { icon: Shield, title: 'Risk Management', desc: 'Real-time risk scoring across volatility, correlation, and market exposure with dynamic rebalancing suggestions.', badge: 'Protection', color: '#3b82f6' },
  { icon: Globe, title: 'Market Intelligence', desc: 'Live market data from 500+ exchanges with on-chain analytics and institutional flow tracking.', badge: 'Live Data', color: '#06b6d4' },
  { icon: Wallet, title: 'Wallet Tracking', desc: 'Connect any EVM or Solana wallet to automatically import and track your entire portfolio.', badge: 'Multi-Chain', color: '#10b981' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Set custom price, volatility, and portfolio threshold alerts with AI-powered anomaly detection.', badge: 'Real-Time', color: '#f59e0b' },
  { icon: Lock, title: 'Secure & Private', desc: 'Non-custodial, read-only portfolio access. Your keys stay yours. Enterprise-grade encryption.', badge: 'Secure', color: '#ef4444' },
]

const faqs = [
  { q: 'How does the AI analysis work?', a: 'ApexAI uses Groq-powered LLaMA 3.3 70B to analyze your portfolio composition, market conditions, and risk metrics to generate personalized insights and recommendations.' },
  { q: 'Is my wallet data safe?', a: 'We only request read-only access to your wallet. We never have custody of your funds. All data is encrypted and stored securely on Supabase with row-level security.' },
  { q: 'Which wallets are supported?', a: 'We support MetaMask, WalletConnect, Phantom, and Coinbase Wallet. More integrations are coming soon including Ledger hardware wallets.' },
  { q: 'How often is market data updated?', a: 'Live prices refresh every 60 seconds via CoinGecko API. Portfolio calculations update in real-time based on the latest market prices.' },
  { q: 'Can I analyze any crypto asset?', a: 'The AI analyzer supports manual input for any cryptocurrency. Simply enter the coin name, amount, and your buy price to get an instant AI analysis.' },
]

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [msg, setMsg] = useState('')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.success) { setStatus('success'); setMsg(data.message); setForm({ name: '', email: '', message: '' }) }
      else { setStatus('error'); setMsg(data.error || 'Failed to send') }
    } catch { setStatus('error'); setMsg('Network error') }
  }
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <input placeholder="Your name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="dark-input" required />
      <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="dark-input" required />
      <textarea placeholder="Your message..." value={form.message} onChange={e => setForm({...form,message:e.target.value})} className="dark-input" rows={4} style={{resize:'vertical'}} required />
      {status==='success'&&<div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'8px',padding:'12px',color:'#10b981',fontSize:'14px'}}>{msg}</div>}
      {status==='error'&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',padding:'12px',color:'#ef4444',fontSize:'14px'}}>{msg}</div>}
      <button type="submit" className="btn-primary" disabled={status==='loading'} style={{justifyContent:'center'}}>
        <Mail size={16}/>{status==='loading'?'Sending...':'Send Message'}
      </button>
    </form>
  )
}

export default function HomePage() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number|null>(null)

  useEffect(() => {
    fetch('/api/prices').then(r=>r.json()).then(d=>{setCoins(d);setLoading(false)}).catch(()=>setLoading(false))
  }, [])

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar />

      {/* HERO */}
      <section style={{paddingTop:'130px',paddingBottom:'80px',padding:'130px 24px 80px',maxWidth:'1200px',margin:'0 auto',textAlign:'center'}}>
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
          <div className="badge badge-blue" style={{marginBottom:'24px',display:'inline-flex'}}>
            <Sparkles size={12} style={{marginRight:'6px'}}/> AI-Powered Crypto Intelligence
          </div>
          <h1 style={{fontSize:'clamp(40px,7vw,84px)',fontWeight:900,fontFamily:'Orbitron,monospace',lineHeight:1.1,marginBottom:'24px'}}>
            <span style={{color:'#f1f5f9'}}>NEXT-GEN</span><br/>
            <span className="gradient-text">CRYPTO INTELLIGENCE</span>
          </h1>
          <p style={{fontSize:'18px',color:'#94a3b8',maxWidth:'580px',margin:'0 auto 40px',lineHeight:1.7}}>
            AI-powered portfolio analytics that reveals hidden risks, identifies opportunities, and delivers institutional-grade insights for every crypto investor.
          </p>
          <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/analyzer"><button className="btn-primary" style={{fontSize:'16px',padding:'14px 32px'}}><Brain size={18}/>Analyze Portfolio</button></Link>
            <Link href="/charts"><button className="btn-secondary" style={{fontSize:'16px',padding:'14px 32px'}}><BarChart3 size={18}/>View Markets</button></Link>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:'48px',marginTop:'64px',flexWrap:'wrap'}}>
            {[{label:'Assets Tracked',value:10000,suffix:'+'},{label:'AI Analyses',value:50000,suffix:'+'},{label:'Avg Accuracy',value:94,suffix:'%'}].map(s=>(
              <div key={s.label} style={{textAlign:'center'}}>
                <div style={{fontSize:'36px',fontWeight:800,fontFamily:'Orbitron,monospace'}} className="gradient-text"><AnimatedNumber value={s.value} suffix={s.suffix}/></div>
                <div style={{color:'#475569',fontSize:'12px',marginTop:'4px',textTransform:'uppercase',letterSpacing:'1px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* TICKER */}
      {coins.length > 0 && (
        <div style={{borderTop:'1px solid rgba(99,102,241,0.1)',borderBottom:'1px solid rgba(99,102,241,0.1)',padding:'12px 0',background:'rgba(10,15,30,0.4)',overflow:'hidden'}}>
          <div className="ticker-wrap">
            <div className="ticker-content">
              {[...Array(4)].map((_,i)=>coins.map(coin=>(
                <span key={`${coin.id}-${i}`} style={{padding:'0 24px',display:'inline-flex',alignItems:'center',gap:'8px',color:'#94a3b8',fontSize:'13px',fontFamily:'JetBrains Mono,monospace'}}>
                  <span style={{color:'#f1f5f9',fontWeight:600}}>{coin.symbol?.toUpperCase()}</span>
                  {formatPrice(coin.current_price)}
                  <span style={{color:(coin.price_change_percentage_24h||0)>=0?'#10b981':'#ef4444'}}>
                    {(coin.price_change_percentage_24h||0)>=0?'▲':'▼'} {Math.abs(coin.price_change_percentage_24h||0).toFixed(2)}%
                  </span>
                  <span style={{color:'#1e293b',marginLeft:'4px'}}>•</span>
                </span>
              )))}
            </div>
          </div>
        </div>
      )}

      {/* LIVE MARKET */}
      <section style={{maxWidth:'1200px',margin:'80px auto',padding:'0 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'16px'}}>
          <div>
            <h2 style={{fontSize:'28px',fontWeight:700,color:'#f1f5f9',fontFamily:'Orbitron,monospace',letterSpacing:'1px'}}>LIVE MARKETS</h2>
            <p style={{color:'#475569',marginTop:'4px',fontSize:'14px'}}>Real-time prices from CoinGecko</p>
          </div>
          <Link href="/charts"><button className="btn-secondary" style={{padding:'8px 18px',fontSize:'13px'}}>View All <ArrowRight size={14}/></button></Link>
        </div>
        {loading ? (
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            {[...Array(5)].map((_,i)=><div key={i} className="skeleton" style={{flex:'1',minWidth:'180px',height:'180px'}}/>)}
          </div>
        ) : (
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            {coins.map((coin,i)=><CoinCard key={coin.id} coin={coin} index={i}/>)}
          </div>
        )}
      </section>

      {/* PORTFOLIO OVERVIEW */}
      <section style={{maxWidth:'1200px',margin:'0 auto 80px',padding:'0 24px'}}>
        <div style={{marginBottom:'32px'}}>
          <h2 style={{fontSize:'28px',fontWeight:700,color:'#f1f5f9',fontFamily:'Orbitron,monospace',letterSpacing:'1px'}}>PORTFOLIO OVERVIEW</h2>
          <p style={{color:'#475569',marginTop:'4px',fontSize:'14px'}}>Demo portfolio — connect yours to see real data</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'20px',marginBottom:'20px'}}>
          {/* Main card */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass-card" style={{padding:'24px',gridColumn:'span 2'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px',flexWrap:'wrap',gap:'16px'}}>
              <div>
                <div style={{color:'#475569',fontSize:'12px',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Total Portfolio Value</div>
                <div style={{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,fontFamily:'Orbitron,monospace'}} className="gradient-text">
                  <AnimatedNumber value={48291.5} prefix="$" decimals={2}/>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
                  <TrendingUp size={15} color="#10b981"/>
                  <span style={{color:'#10b981',fontWeight:600,fontSize:'14px'}}>+$1,234.50 (2.63%)</span>
                  <span style={{color:'#475569',fontSize:'12px'}}>today</span>
                </div>
              </div>
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                {[{label:'Risk Score',value:'6.2/10',color:'#f59e0b'},{label:'Sharpe',value:'1.84',color:'#10b981'},{label:'Beta',value:'1.12',color:'#3b82f6'}].map(m=>(
                  <div key={m.label} style={{textAlign:'center',background:'rgba(10,15,30,0.6)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:'10px',padding:'10px 14px'}}>
                    <div style={{color:m.color,fontWeight:700,fontSize:'16px',fontFamily:'JetBrains Mono,monospace'}}>{m.value}</div>
                    <div style={{color:'#475569',fontSize:'10px',marginTop:'2px'}}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={perfData}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide/>
                <YAxis hide domain={['auto','auto']}/>
                <Tooltip contentStyle={{background:'rgba(10,15,30,0.95)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'8px',color:'#f1f5f9',fontSize:'12px'}} formatter={(v:any)=>[`$${v.toLocaleString('en-US',{maximumFractionDigits:0})}`,'Value']}/>
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#pg)"/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass-card" style={{padding:'24px'}}>
            <div style={{color:'#475569',fontSize:'12px',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'16px'}}>Asset Allocation</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={portfolioAllocation} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {portfolioAllocation.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'rgba(10,15,30,0.95)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'8px',color:'#f1f5f9',fontSize:'12px'}}/>
              </PieChart>
            </ResponsiveContainer>
            {portfolioAllocation.map(a=>(
              <div key={a.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'8px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',background:a.color}}/>
                  <span style={{color:'#94a3b8',fontSize:'13px'}}>{a.name}</span>
                </div>
                <span style={{color:'#f1f5f9',fontWeight:600,fontFamily:'JetBrains Mono,monospace',fontSize:'13px'}}>{a.value}%</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'14px'}}>
          {[{coin:'Bitcoin',symbol:'BTC',value:'$21,731',change:'+3.2%',pos:true,icon:'₿'},{coin:'Ethereum',symbol:'ETH',value:'$13,484',change:'-1.1%',pos:false,icon:'Ξ'},{coin:'Solana',symbol:'SOL',value:'$7,137',change:'+8.4%',pos:true,icon:'◎'},{coin:'Other',symbol:'4 coins',value:'$5,939',change:'+1.7%',pos:true,icon:'+'}].map((a,i)=>(
            <motion.div key={a.coin} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15+i*0.05}} className="glass-card" style={{padding:'18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                <div style={{width:'34px',height:'34px',borderRadius:'9px',background:'rgba(99,102,241,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>{a.icon}</div>
                <span className={`badge ${a.pos?'badge-green':'badge-red'}`}>{a.change}</span>
              </div>
              <div style={{color:'#f1f5f9',fontWeight:700,fontSize:'17px',fontFamily:'JetBrains Mono,monospace'}}>{a.value}</div>
              <div style={{color:'#475569',fontSize:'12px',marginTop:'3px'}}>{a.coin} · {a.symbol}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{maxWidth:'1200px',margin:'0 auto 80px',padding:'0 24px'}}>
        <div style={{textAlign:'center',marginBottom:'48px'}}>
          <h2 style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:800,color:'#f1f5f9',fontFamily:'Orbitron,monospace',letterSpacing:'1px',marginBottom:'16px'}}>
            BUILT FOR <span className="gradient-text">SERIOUS TRADERS</span>
          </h2>
          <p style={{color:'#64748b',maxWidth:'480px',margin:'0 auto',lineHeight:1.7,fontSize:'15px'}}>Professional-grade tools previously only available to institutional investors</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'20px'}}>
          {features.map((f,i)=>(
            <motion.div key={f.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} whileHover={{y:-4}} className="glass-card" style={{padding:'26px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'14px'}}>
                <div style={{width:'46px',height:'46px',borderRadius:'12px',background:`${f.color}18`,border:`1px solid ${f.color}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <f.icon size={21} color={f.color}/>
                </div>
                <span className="badge" style={{color:f.color,borderColor:`${f.color}40`,background:`${f.color}15`,border:`1px solid ${f.color}40`}}>{f.badge}</span>
              </div>
              <h3 style={{fontSize:'17px',fontWeight:700,color:'#f1f5f9',marginBottom:'10px'}}>{f.title}</h3>
              <p style={{color:'#64748b',fontSize:'13px',lineHeight:1.6}}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{maxWidth:'1200px',margin:'0 auto 80px',padding:'0 24px'}}>
        <motion.div initial={{opacity:0,scale:0.98}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} style={{background:'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(139,92,246,0.12))',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'24px',padding:'clamp(40px,5vw,60px) 40px',textAlign:'center',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-80px',left:'50%',transform:'translateX(-50%)',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)',pointerEvents:'none'}}/>
          <div className="badge badge-purple" style={{marginBottom:'20px',display:'inline-flex'}}><Brain size={12} style={{marginRight:'6px'}}/>AI-Powered</div>
          <h2 style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:800,color:'#f1f5f9',fontFamily:'Orbitron,monospace',marginBottom:'16px',letterSpacing:'1px'}}>GET YOUR FREE AI ANALYSIS</h2>
          <p style={{color:'#94a3b8',maxWidth:'480px',margin:'0 auto 32px',fontSize:'15px',lineHeight:1.7}}>Input your holdings and our LLaMA 3.3 70B-powered AI will generate a comprehensive portfolio health report in seconds.</p>
          <Link href="/analyzer"><button className="btn-primary" style={{fontSize:'16px',padding:'14px 36px'}}><Sparkles size={18}/>Start AI Analysis<ArrowRight size={16}/></button></Link>
        </motion.div>
      </section>

      {/* CONTACT + FAQ */}
      <section id="contact" style={{maxWidth:'1200px',margin:'0 auto 80px',padding:'0 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:'48px'}}>
          <div>
            <h2 style={{fontSize:'26px',fontWeight:700,color:'#f1f5f9',fontFamily:'Orbitron,monospace',letterSpacing:'1px',marginBottom:'8px'}}>CONTACT US</h2>
            <p style={{color:'#475569',marginBottom:'24px',fontSize:'14px'}}>Get in touch with our team</p>
            <ContactForm/>
          </div>
          <div>
            <h2 style={{fontSize:'26px',fontWeight:700,color:'#f1f5f9',fontFamily:'Orbitron,monospace',letterSpacing:'1px',marginBottom:'8px'}}>FAQ</h2>
            <p style={{color:'#475569',marginBottom:'24px',fontSize:'14px'}}>Common questions answered</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {faqs.map((faq,i)=>(
                <div key={i} className="glass-card" style={{overflow:'hidden'}}>
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',textAlign:'left',padding:'16px 20px',background:'transparent',border:'none',color:'#f1f5f9',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',fontWeight:600,fontSize:'14px',fontFamily:'Space Grotesk,sans-serif',gap:'12px'}}>
                    <span>{faq.q}</span>
                    <ChevronDown size={15} style={{color:'#475569',transform:openFaq===i?'rotate(180deg)':'none',transition:'transform 0.2s',flexShrink:0}}/>
                  </button>
                  {openFaq===i&&(
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} style={{padding:'0 20px 16px',color:'#94a3b8',fontSize:'13px',lineHeight:1.6}}>
                      {faq.a}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(99,102,241,0.1)',padding:'40px 24px',background:'rgba(3,7,18,0.8)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center'}}><Zap size={16} color="white"/></div>
            <span style={{fontFamily:'Orbitron,monospace',fontWeight:700,fontSize:'18px',color:'#f1f5f9'}}>APEX<span style={{color:'#3b82f6'}}>AI</span></span>
          </div>
          <div style={{display:'flex',gap:'20px',flexWrap:'wrap'}}>
            {['Privacy','Terms','Contact'].map(l=><a key={l} href={l==='Contact'?'#contact':'#'} style={{color:'#475569',textDecoration:'none',fontSize:'13px'}}>{l}</a>)}
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            {[MessageSquare,Code2,Mail].map((Icon,i)=>(
              <button key={i} style={{width:'34px',height:'34px',borderRadius:'8px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#64748b'}}>
                <Icon size={15}/>
              </button>
            ))}
          </div>
          <div style={{color:'#1e293b',fontSize:'12px',width:'100%',textAlign:'center',paddingTop:'16px',borderTop:'1px solid rgba(99,102,241,0.08)'}}>
            © 2025 ApexAI. All rights reserved. Not financial advice.
          </div>
        </div>
      </footer>
    </div>
  )
}
