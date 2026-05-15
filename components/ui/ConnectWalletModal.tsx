'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, CheckCircle, Copy, ExternalLink } from 'lucide-react'

interface Props { open: boolean; onClose: () => void }

const wallets = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#F6851B', desc: 'Connect via browser extension' },
  { id: 'phantom', name: 'Phantom', icon: '👻', color: '#AB9FF2', desc: 'Solana & multi-chain wallet' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', color: '#3B99FC', desc: 'Scan QR to connect' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '💙', color: '#0052FF', desc: 'Connect Coinbase wallet' },
]

// Simulated wallet addresses
const mockAddresses: Record<string, string> = {
  metamask: '0x742d35Cc6634C0532925a3b8D4C9F5aCb0e1234',
  phantom: '8jZm9KPqRVZqZcYkWxLmN3aQpHdT6uEyWsRt5vXcBnK',
  walletconnect: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  coinbase: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
}

export default function ConnectWalletModal({ open, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleConnect = async (walletId: string) => {
    setSelected(walletId)
    setConnecting(true)
    await new Promise(r => setTimeout(r, 1800))
    setConnecting(false)
    setConnected(true)
  }

  const handleCopy = () => {
    if (selected) {
      navigator.clipboard.writeText(mockAddresses[selected])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setSelected(null)
    setConnecting(false)
    setConnected(false)
    onClose()
  }

  const address = selected ? mockAddresses[selected] : ''
  const shortAddress = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{ width: '100%', maxWidth: '460px', padding: '40px', position: 'relative' }}
          >
            <button onClick={handleClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            {!connected ? (
              <>
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wallet size={20} color="white" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', fontFamily: 'Orbitron, monospace', letterSpacing: '1px' }}>CONNECT WALLET</h2>
                      <p style={{ color: '#64748b', fontSize: '13px' }}>Select your preferred wallet</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {wallets.map(wallet => (
                    <motion.button
                      key={wallet.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleConnect(wallet.id)}
                      disabled={connecting}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)',
                        background: selected === wallet.id && connecting ? 'rgba(59,130,246,0.1)' : 'rgba(10,15,30,0.6)',
                        cursor: connecting ? 'wait' : 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                        width: '100%',
                      }}
                    >
                      <span style={{ fontSize: '28px' }}>{wallet.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '15px' }}>{wallet.name}</div>
                        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{wallet.desc}</div>
                      </div>
                      {selected === wallet.id && connecting && (
                        <motion.div
                          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{ width: '20px', height: '20px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>

                <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
                  By connecting, you agree to our Terms of Service. This is a simulated demo connection.
                </p>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}
                >
                  <CheckCircle size={36} color="#10b981" />
                </motion.div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px', fontFamily: 'Orbitron, monospace' }}>CONNECTED!</h3>
                <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '24px' }}>
                  {wallets.find(w => w.id === selected)?.name} connected successfully
                </p>

                <div style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Wallet Address</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#f1f5f9' }}>{shortAddress}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: copied ? '#10b981' : '#64748b', cursor: 'pointer' }}>
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                      <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mock portfolio preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  {[
                    { label: 'Portfolio Value', value: '$48,291.50', color: '#f1f5f9' },
                    { label: '24h Change', value: '+$1,234', color: '#10b981' },
                    { label: 'Assets', value: '7 tokens', color: '#f1f5f9' },
                    { label: 'Network', value: selected === 'phantom' ? 'Solana' : 'Ethereum', color: '#8b5cf6' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ color: '#475569', fontSize: '11px', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ color: item.color, fontWeight: 600, fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <button onClick={handleClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
