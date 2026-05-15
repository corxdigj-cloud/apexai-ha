# ⚡ ApexAI — AI-Powered Crypto Intelligence

A production-ready, full-stack crypto portfolio analytics platform built with Next.js 15, powered by LLaMA 3.3 70B (via Groq), CoinGecko live market data, and Supabase backend.

---

## 🚀 Features

- **Live Market Dashboard** — Real-time prices for BTC, ETH, SOL, INJ, XRP via CoinGecko API
- **AI Portfolio Analyzer** — LLaMA 3.3 70B generates health scores, risk assessments, and personalized recommendations
- **AI Chat Assistant** — Conversational AI that knows your portfolio
- **Charts & Analytics** — Interactive price charts with time filters, RSI, fear & greed, support/resistance
- **Market Heatmap** — Visual 24h performance grid
- **Wallet Connect** — MetaMask, WalletConnect, Phantom, Coinbase wallet simulation
- **Supabase Auth** — Sign up / login with email
- **Contact Form** — Stored in Supabase
- **Responsive Design** — Mobile-first, premium dark UI

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| AI | Groq SDK (LLaMA 3.3 70B) |
| Market Data | CoinGecko Free API |
| Backend/DB | Supabase (Auth + PostgreSQL) |
| Deployment | Vercel |

---

## 📦 Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/your-username/apexai
cd apexai
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (server-side only)
- `NEXT_PUBLIC_COINGECKO_API_KEY` — CoinGecko demo API key (free at coingecko.com)
- `GROQ_API_KEY` — Groq API key (free at console.groq.com)

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** in your Supabase dashboard
3. Run the contents of `supabase-schema.sql`
4. Enable **Email authentication** under Authentication → Providers

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow prompts, then add environment variables in the Vercel dashboard.

### Option B: GitHub + Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo
4. Add environment variables under Project Settings → Environment Variables
5. Deploy

### Required Vercel Environment Variables

Add these in **Vercel Dashboard → Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_COINGECKO_API_KEY
GROQ_API_KEY
```

---

## 📁 Project Structure

```
apexai/
├── app/
│   ├── page.tsx              # Home dashboard (exports from components/)
│   ├── charts/page.tsx       # Charts & Analytics page
│   ├── analyzer/page.tsx     # AI Portfolio Analyzer
│   ├── api/
│   │   ├── prices/route.ts          # CoinGecko live prices
│   │   ├── prices/history/route.ts  # Price chart history
│   │   ├── ai-analyze/route.ts      # Groq AI analysis
│   │   ├── contact/route.ts         # Contact form
│   │   └── portfolio/route.ts       # Portfolio CRUD
│   ├── globals.css           # Dark theme design system
│   └── layout.tsx            # Root layout
├── components/
│   ├── layout/
│   │   └── Navbar.tsx        # Sticky navigation
│   ├── ui/
│   │   ├── AuthModal.tsx     # Supabase auth modal
│   │   └── ConnectWalletModal.tsx  # Wallet connection
│   └── HomePage.tsx          # Full homepage component
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── coingecko.ts          # CoinGecko API helpers
├── types/index.ts            # TypeScript types
├── supabase-schema.sql       # Database schema
├── .env.example              # Environment variable template
└── vercel.json               # Vercel deployment config
```

---

## 🔑 API Keys (Free Tiers)

| Service | Free Tier | Get Key |
|---------|-----------|---------|
| CoinGecko | 30 calls/min | [coingecko.com/api](https://www.coingecko.com/en/api) |
| Groq | 14,400 req/day | [console.groq.com](https://console.groq.com) |
| Supabase | 500MB DB, 2GB bandwidth | [supabase.com](https://supabase.com) |

---

## 📝 Notes

- **Not financial advice** — ApexAI is for informational purposes only
- Wallet connections are simulated (read-only demo mode)
- CoinGecko free tier: if rate limited, mock data is served automatically
- AI analysis requires holdings to be entered manually or via wallet import

---

© 2025 ApexAI. Built for the hackathon.
