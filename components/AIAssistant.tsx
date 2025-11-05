import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiAssistant } from '../services/aiAssistant';
import { SendIcon } from './icons/SendIcon';
import { CloseIcon } from './icons/CloseIcon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onClose: () => void;
  initialQuery?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, initialQuery }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 **Hello! I'm your FynAI Assistant.**

I can help you with:
- 📈 **Stock market** analysis and insights
- 💰 **Cryptocurrency** information and trends  
- 📊 **Investment strategies** and portfolio management
- 📚 **Trading terminology** and concepts
- 🎯 **Market data** interpretation

*What would you like to learn about today?*`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-send initial query if provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInput(initialQuery);
      // Send the query automatically after a short delay
      setTimeout(async () => {
        const userMessage: Message = {
          role: 'user',
          content: initialQuery.trim(),
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
          const response = await aiAssistant.sendMessage(initialQuery.trim());
          
          const assistantMessage: Message = {
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
          console.error('Error getting AI response:', err);
          setError(err.message || 'Failed to get response from AI Assistant. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }, 500);
    }
  }, [initialQuery]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      if (!aiAssistant.isAvailable()) {
        throw new Error('AI Assistant is not configured. Please add your Gemini API key to .env.local');
      }

      const response = await aiAssistant.sendMessage(userMessage.content);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Assistant error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please make sure your API key is configured correctly and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    aiAssistant.resetChat();
    setMessages([
      {
        role: 'assistant',
        content: '🔄 **Chat history cleared!**\n\nHow can I help you with your investments today?',
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-black dark:bg-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-white dark:text-black">FynAI</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-white/80 dark:text-black/80 hover:text-white dark:hover:text-black text-xs px-2 py-1 rounded hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
            title="Clear chat history"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="text-white/80 dark:text-black/80 hover:text-white dark:hover:text-black transition-colors"
            title="Close chat"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white'
              }`}
            >
              <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <ReactMarkdown
                    components={{
                      // Custom styling for markdown elements
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-1 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="my-1" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside my-1 space-y-0.5" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside my-1 space-y-0.5" {...props} />,
                      li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      code: ({node, className, children, ...props}) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className="block bg-black/10 dark:bg-white/10 p-2 rounded text-xs font-mono overflow-x-auto my-1" {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({node, ...props}) => <pre className="my-1 overflow-x-auto" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-blue-500 pl-2 italic my-1" {...props} />
                      ),
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-2">
                          <table className="min-w-full border-collapse border border-gray-300 dark:border-slate-600 text-xs" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => <thead className="bg-gray-200 dark:bg-slate-600" {...props} />,
                      th: ({node, ...props}) => <th className="border border-gray-300 dark:border-slate-600 px-2 py-1 font-semibold" {...props} />,
                      td: ({node, ...props}) => <td className="border border-gray-300 dark:border-slate-600 px-2 py-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about stocks, crypto, or investing..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-white dark:text-black rounded-lg transition-colors flex items-center justify-center"
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Ask me anything about investing, stocks, crypto, or trading!
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
