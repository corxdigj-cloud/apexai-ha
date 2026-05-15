import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const { holdings, prices, chatMessage, history } = await request.json()

    // Build context about portfolio
    let portfolioContext = ''
    let totalValue = 0
    if (holdings && holdings.length > 0) {
      holdings.forEach((h: { coin: string; amount: number; buyPrice: number; currentPrice?: number }) => {
        const current = h.currentPrice || h.buyPrice
        const value = current * h.amount
        const pnl = ((current - h.buyPrice) / h.buyPrice * 100).toFixed(2)
        totalValue += value
        portfolioContext += `- ${h.coin}: ${h.amount} units @ buy $${h.buyPrice}, current $${current.toFixed(2)}, value $${value.toFixed(2)}, PnL: ${pnl}%\n`
      })
    }

    let systemPrompt = `You are ApexAI, an expert cryptocurrency portfolio analyst and financial advisor. 
You provide precise, data-driven insights about crypto portfolios.
Format your responses using clean markdown with bullet points and sections.
Be concise but thorough. Always end with actionable recommendations.
Current market context: BTC ~$67,000, ETH ~$3,500, SOL ~$178, overall market sentiment: cautiously bullish.`

    let userPrompt = ''

    if (chatMessage) {
      // Chat assistant mode
      userPrompt = chatMessage
      if (portfolioContext) {
        systemPrompt += `\n\nUser's portfolio:\n${portfolioContext}\nTotal Value: $${totalValue.toFixed(2)}`
      }
    } else {
      // Full portfolio analysis
      systemPrompt += `\n\nProvide a comprehensive portfolio analysis with:
1. **Portfolio Health Score** (0-100)
2. **Risk Assessment** (Low/Medium/Medium-High/High/Very High)
3. **Key Insights** (3-5 bullets)
4. **Warnings** (if any red flags)
5. **Recommendations** (3-5 actionable steps)
6. **Sentiment Outlook** (Bullish/Neutral/Bearish with reasoning)

Keep the tone professional but accessible. Use emojis sparingly for visual clarity.`

      userPrompt = `Analyze this crypto portfolio:\n${portfolioContext || 'No holdings provided - give general crypto portfolio advice.'}\nTotal Value: $${totalValue.toFixed(2)}`
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    // Add chat history if provided
    if (history && history.length > 0) {
      history.slice(-6).forEach((msg: { role: string; content: string }) => {
        messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content })
      })
    }

    messages.push({ role: 'user', content: userPrompt })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1200,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || 'Unable to generate analysis.'

    // Parse scores if full analysis
    if (!chatMessage) {
      const healthMatch = responseText.match(/(\d+)(?:\/100|\s*out of 100)/i)
      const riskMatch = responseText.match(/\b(Low|Medium-High|Medium|High|Very High)\b.*?risk/i)
      const sentimentMatch = responseText.match(/\b(Bullish|Bearish|Neutral)\b/i)

      return NextResponse.json({
        analysis: responseText,
        healthScore: healthMatch ? parseInt(healthMatch[1]) : 68,
        riskLevel: riskMatch ? riskMatch[1] : 'Medium',
        sentiment: sentimentMatch ? sentimentMatch[1] : 'Neutral',
        totalValue: totalValue.toFixed(2),
      })
    }

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'AI service temporarily unavailable', response: 'I apologize, the AI service is temporarily unavailable. Please try again shortly.' },
      { status: 500 }
    )
  }
}
