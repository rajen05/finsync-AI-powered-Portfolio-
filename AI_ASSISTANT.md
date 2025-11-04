# AI Investment Assistant

## Overview
FinSync now includes an AI-powered investment assistant that helps users with questions about stocks, crypto, trading, and market analysis.

## Features

### 🤖 Smart Investment Advisor
- Answers questions about stocks, cryptocurrencies, and investing
- Explains trading terminology and concepts
- Provides market insights and analysis guidance
- Educational responses focused on teaching, not specific financial advice

### 🎯 Focused Expertise
The AI assistant is programmed to **only** answer investment-related questions:
- Stock market analysis
- Cryptocurrency information
- Investment strategies
- Trading terms and concepts
- Portfolio management
- Risk management
- Technical and fundamental analysis

If you ask non-investment questions, it will politely redirect you back to investment topics.

### 💬 Chat Interface
- **Floating Button**: Click the blue chat icon in the bottom-right corner
- **Real-time Responses**: Powered by Google's Gemini AI
- **Conversation History**: Maintains context throughout your chat session
- **Clear Chat**: Reset conversation at any time
- **Mobile Responsive**: Works on all screen sizes

## How to Use

1. **Open Chat**: Click the floating blue chat button (bottom-right corner)
2. **Ask Questions**: Type your investment-related question
3. **Get Answers**: Receive detailed, educational responses
4. **Continue Conversation**: The AI remembers context from previous messages
5. **Clear History**: Click "Clear" to start a fresh conversation
6. **Close Chat**: Click the X to close the chat window

## Example Questions

### Stock Market
- "What is P/E ratio and how do I use it?"
- "Explain the difference between market cap and enterprise value"
- "What are the key indicators for stock valuation?"

### Cryptocurrency
- "How does Bitcoin mining work?"
- "What's the difference between proof of work and proof of stake?"
- "Explain DeFi and its risks"

### Trading Strategies
- "What is dollar-cost averaging?"
- "Explain the difference between day trading and swing trading"
- "What are stop-loss orders?"

### Portfolio Management
- "How should I diversify my portfolio?"
- "What's a good asset allocation for long-term investing?"
- "Explain risk-adjusted returns"

## Technical Details

### Architecture
- **Service**: `services/aiAssistant.ts` - Handles Gemini API communication
- **Component**: `components/AIAssistant.tsx` - Chat UI interface
- **Integration**: Added to `Dashboard.tsx` as floating button

### API Configuration
The AI assistant uses your existing Gemini API key from `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

### Model
- Uses `gemini-2.0-flash-exp` for fast, accurate responses
- Conversation history maintained in memory
- System prompt ensures investment-focused responses

### Error Handling
- Graceful error messages if API key is missing
- Retry capability for failed requests
- Clear error states in UI

## Privacy & Security

- ✅ Conversations are **not stored** on servers
- ✅ Chat history clears when you close the browser
- ✅ No personal financial data is sent to the AI
- ✅ Educational responses only, no specific financial advice

## Limitations

### What the AI Will NOT Do
- ❌ Provide specific stock recommendations ("buy AAPL")
- ❌ Predict future prices or market movements
- ❌ Give personalized financial advice
- ❌ Answer non-investment questions
- ❌ Access your actual portfolio data

### What the AI WILL Do
- ✅ Explain investment concepts and terminology
- ✅ Discuss general market trends and analysis methods
- ✅ Teach you how to evaluate investments
- ✅ Provide educational context and examples
- ✅ Help you understand financial metrics

## Future Enhancements

Potential improvements:
- [ ] Portfolio-aware responses (analyze your actual holdings)
- [ ] Voice input/output
- [ ] Suggested follow-up questions
- [ ] Export chat history
- [ ] Multi-language support
- [ ] Integration with real-time market data
- [ ] Bookmark useful responses

## Troubleshooting

### "AI Assistant is not available"
- Check that `GEMINI_API_KEY` is set in `.env.local`
- Restart your development server after adding the key

### Slow Responses
- Normal for complex questions (5-10 seconds)
- Check your internet connection
- Verify API key is valid

### Generic/Unhelpful Answers
- Try being more specific in your questions
- Provide context (e.g., "I'm a beginner investor...")
- Ask follow-up questions to clarify

## Disclaimer

**Important**: The AI Assistant is for educational purposes only. It does not provide personalized financial advice. Always do your own research and consult with a qualified financial advisor before making investment decisions.

---

Built with ❤️ using Google Gemini AI
