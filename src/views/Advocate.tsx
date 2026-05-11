import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS } from '../constants';
import { chatWithAdvocate } from '../lib/gemini';

export default function Advocate({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hey — I’m here to help you figure out your grade situation and how to push back the right way. I know how Canvas, Gradescope, Moodle, Turnitin, and the rest actually work, and I can walk you through appeals step by step. I’m not a lawyer and I can’t promise you’ll win, but I’m on your side. What’s going on — and if you know it, what does your school use for grades (Canvas, Moodle, etc.)?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Map our app roles to Gemini roles
      const history = messages.slice(1).map(m => ({
        role: m.role === 'ai' ? 'model' as const : 'user' as const,
        text: m.text
      }));

      const response = await chatWithAdvocate(userMessage, history);
      
      setMessages(prev => [...prev, { role: 'ai', text: response || "I'm sorry, I couldn't process that request." }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Sorry, I ran into an error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto min-h-[min(88dvh,calc(100vh-7rem))] h-[min(88dvh,calc(100vh-7rem))] sm:rounded-2xl rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm relative">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center bg-gray-50 hover:bg-violet-50 rounded-xl transition-all text-on-surface-variant hover:text-violet-600 border border-gray-100 shrink-0"
            aria-label="Back"
          >
            <ICONS.ChevronLeft size={18} />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-base text-on-surface">Appeal assistant</h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse shrink-0" />
              <span className="text-[10px] font-semibold text-on-surface-variant">
                Online · here to help
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           {[ICONS.Shield, ICONS.Download].map((Icon, i) => (
             <button key={i} className="p-2.5 bg-gray-50 text-on-surface-variant hover:text-violet-600 transition-all rounded-xl border border-gray-100">
                <Icon size={16} />
             </button>
           ))}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 sm:space-y-10 relative z-10 scrollbar-hide">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[92%] sm:max-w-[85%] p-4 sm:p-5 rounded-2xl text-sm leading-relaxed ${
              m.role === 'ai'
                ? 'bg-violet-50 border border-violet-100 text-on-surface'
                : 'text-white shadow-lg'
            }`}
            style={m.role !== 'ai' ? { background: '#7c3aed' } : undefined}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-violet-50 border border-violet-100 p-4 rounded-2xl flex gap-2">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-200" />
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 sm:p-5 border-t border-gray-100 bg-white relative z-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="relative flex items-center max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about rubrics, feedback, or appeal steps…"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all pr-14 text-sm text-on-surface placeholder:text-on-surface-variant/50 min-h-[48px]"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-white rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all outline-none disabled:opacity-50 disabled:scale-100"
            style={{ background: '#7c3aed' }}
            aria-label="Send"
          >
            {loading ? <ICONS.RefreshCcw className="animate-spin" size={18} /> : <ICONS.Send size={18} />}
          </button>
        </div>
        <div className="flex justify-center items-center gap-3 mt-3">
           <div className="h-px w-6 bg-gray-100" />
           <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider text-center px-2">
              Educational support only · follow your school&apos;s policy
           </p>
           <div className="h-px w-6 bg-gray-100" />
        </div>
      </form>
    </div>
  );
}
