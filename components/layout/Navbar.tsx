'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, TrendingUp, BarChart3, Brain, Wallet } from 'lucide-react'
const AuthModal = dynamic(() => import('@/components/ui/AuthModal'), { ssr: false })
const ConnectWalletModal = dynamic(() => import('@/components/ui/ConnectWalletModal'), { ssr: false })

const navLinks = [
  { href: '/', label: 'Dashboard', icon: TrendingUp },
  { href: '/charts', label: 'Markets', icon: BarChart3 },
  { href: '/analyzer', label: 'AI Analyzer', icon: Brain },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(3,7,18,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
        padding: '0 24px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
          }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '20px', letterSpacing: '2px', color: '#f1f5f9' }}>
            APEX<span style={{ color: '#3b82f6' }}>AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden-mobile">
          {navLinks.map(link => {
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
                fontSize: '14px', fontWeight: 500, transition: 'all 0.2s ease',
                background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: active ? '#3b82f6' : '#94a3b8',
                border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              }}>
                <link.icon size={15} />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setAuthOpen(true)}
            className="btn-secondary hidden-mobile"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Sign In
          </button>
          <button
            onClick={() => setWalletOpen(true)}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Wallet size={15} />
            <span className="hidden-mobile">Connect Portfolio</span>
            <span className="show-mobile">Connect</span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="show-mobile-only"
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: '70px', left: 0, right: 0, zIndex: 999,
              background: 'rgba(3,7,18,0.97)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '10px', textDecoration: 'none',
                  fontSize: '15px', fontWeight: 500,
                  background: pathname === link.href ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: pathname === link.href ? '#3b82f6' : '#94a3b8',
                  border: '1px solid rgba(99,102,241,0.1)',
                }}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            <button onClick={() => { setAuthOpen(true); setMobileOpen(false) }} className="btn-secondary" style={{ marginTop: '8px', justifyContent: 'center' }}>
              Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hidden-mobile { display: flex; }
        .show-mobile { display: none; }
        .show-mobile-only { display: none; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: inline !important; }
          .show-mobile-only { display: block !important; }
        }
      `}</style>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  )
}
