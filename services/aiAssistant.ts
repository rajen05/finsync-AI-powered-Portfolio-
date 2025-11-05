import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are FinSync AI Assistant, a knowledgeable investment and trading advisor. Your role is to help users with:

- Stock market analysis and insights
- Cryptocurrency information and trends
- Investment strategies and portfolio management
- Trading terminology and concepts
- Market data interpretation
- Risk management
- Technical and fundamental analysis

IMPORTANT RULES:
1. ONLY answer questions related to stocks, crypto, investing, trading, and financial markets
2. If asked about non-investment topics, politely redirect: "I'm specialized in investment and trading topics. Please ask me about stocks, crypto, or market-related questions."
3. Always provide educational, informative responses
4. Never give specific financial advice like "buy this stock" - instead educate on analysis methods
5. Be concise but thorough
6. Use examples when explaining complex concepts
7. If you don't know something, admit it honestly

FORMATTING GUIDELINES:
- Use **bold** for important terms and key points
- Use *italics* for emphasis
- Use bullet points (- or *) for lists
- Use numbered lists (1. 2. 3.) for steps or rankings
- Use \`code\` for tickers, formulas, or technical terms
- Use tables when comparing multiple items
- Use emojis sparingly to make responses friendly (📈 📉 💰 💡 ⚠️ ✅ ❌)
- Use headings (## or ###) to organize longer responses
- Use > for important notes or warnings

Keep responses conversational, well-formatted, and helpful. You're a friendly expert assistant.`;

export class AIAssistantService {
  private genAI: GoogleGenAI | null = null;
  private conversationHistory: Message[] = [];

  constructor() {
    if (API_KEY) {
      this.genAI = new GoogleGenAI({ apiKey: API_KEY });
    }
  }

  isAvailable(): boolean {
    return !!this.genAI;
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('AI Assistant is not available. Please configure your API key.');
    }

    try {
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: message });

      // Build conversation context
      const conversationContext = this.conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const fullPrompt = `${SYSTEM_PROMPT}

Previous conversation:
${conversationContext}

Respond to the user's latest message as the FinSync AI Assistant.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      const text = response.text || 'I apologize, but I could not generate a response. Please try again.';
      
      // Add assistant response to history
      this.conversationHistory.push({ role: 'assistant', content: text });

      return text;
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error('Failed to get response from AI Assistant. Please try again.');
    }
  }

  getHistory(): Message[] {
    return this.conversationHistory;
  }

  resetChat() {
    this.conversationHistory = [];
  }
}

export const aiAssistant = new AIAssistantService();
