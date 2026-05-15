'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Zap, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props { open: boolean; onClose: () => void }

export default function AuthModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
        if (error) throw error
        setSuccess('Account created! Check your email to verify.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSuccess('Signed in successfully!')
        setTimeout(onClose, 1000)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{ width: '100%', maxWidth: '420px', padding: '40px', position: 'relative' }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Zap size={24} color="white" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px', fontFamily: 'Orbitron, monospace', letterSpacing: '1px' }}>
                {mode === 'login' ? 'WELCOME BACK' : 'JOIN APEX AI'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
              </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'rgba(10,15,30,0.8)', borderRadius: '10px', padding: '4px', marginBottom: '24px', border: '1px solid rgba(99,102,241,0.15)' }}>
              {(['login', 'signup'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, padding: '8px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                  background: mode === m ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                  color: mode === m ? 'white' : '#64748b', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s ease',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}>
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'signup' && (
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="dark-input" style={{ paddingLeft: '42px' }} required />
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="dark-input" style={{ paddingLeft: '42px' }} required />
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type={showPwd ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="dark-input" style={{ paddingLeft: '42px', paddingRight: '42px' }} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px' }}>{error}</div>}
              {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#10b981', fontSize: '13px' }}>{success}</div>}

              <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
