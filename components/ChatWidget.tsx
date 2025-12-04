import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Minimize2, Loader2 } from 'lucide-react';
import { chatWithInstructor } from '../services/geminiService';
import { ChatMessage } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Jambo! 👋 I am your NTSA Driving Instructor. Ask me anything about driving rules, signs, or safety!!!', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithInstructor(userMsg.text, history);
    
    const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end max-w-[calc(100vw-2rem)] sm:max-w-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[calc(100vw-2rem)] sm:w-[90vw] md:w-[400px] max-w-[400px] h-[calc(100vh-8rem)] sm:h-[500px] max-h-[600px] rounded-xl shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden animate-fade-in-up transition-all">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">NTSA AI Instructor</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-hide space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm break-words overflow-wrap-anywhere ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'model' ? <MarkdownRenderer content={msg.text} /> : msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about traffic rules..."
                className="w-full bg-gray-100 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-1.5 bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">AI can make mistakes. Verify with NTSA handbook.</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 px-3 sm:px-5 rounded-full shadow-lg transition-all transform hover:scale-105"
        >
          <MessageCircle size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base hidden sm:inline whitespace-nowrap">Ask Instructor</span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;