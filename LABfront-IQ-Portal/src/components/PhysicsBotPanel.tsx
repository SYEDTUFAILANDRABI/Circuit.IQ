/**
 * PhysicsBotPanel.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Floating draggable chat panel for the AI PhysicsBot tutor.
 *
 * Wires up to:
 *   • Zustand physicsBotOpen / setPhysicsBotOpen
 *   • POST /api/physicsbot/ask
 *
 * The panel passes the current circuit state from the Zustand store (experiment
 * key) so the AI can give context-aware answers. Circuit component/wire detail
 * is injected via postMessage from the 3D lab iframe when available.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CircuitContext {
  placed_components?: unknown[];
  wires?: unknown[];
  params?: Record<string, number>;
  readings?: Record<string, number>;
}

export default function PhysicsBotPanel() {
  const physicsBotOpen = useAppStore((state) => state.physicsBotOpen);
  const setPhysicsBotOpen = useAppStore((state) => state.setPhysicsBotOpen);
  const currentExperiment = useAppStore((state) => state.currentExperiment);

  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [minimized, setMinimized]     = useState(false);
  const [circuitCtx, setCircuitCtx]   = useState<CircuitContext>({});

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Focus input when panel opens ───────────────────────────────────────────
  useEffect(() => {
    if (physicsBotOpen && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [physicsBotOpen, minimized]);

  // ── Listen for circuit state updates from the 3D lab iframe ───────────────
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'CIRCUIT_STATE_UPDATE') {
        setCircuitCtx(event.data.payload ?? {});
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // ── Send question to /api/physicsbot/ask ───────────────────────────────────
  const sendMessage = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: Message = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/physicsbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          experiment:    currentExperiment ?? 'unknown',
          circuit_state: circuitCtx,
        }),
      });

      const data = await response.json();
      const answer = data.answer ?? "Sorry, I couldn't process that. Try again!";
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Connection error — make sure the backend is running on port 5000.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, currentExperiment, circuitCtx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!physicsBotOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="physicsbot-panel"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className={cn(
          'fixed bottom-6 right-6 z-[200] w-[360px] rounded-2xl shadow-2xl',
          'bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10',
          'flex flex-col overflow-hidden',
          minimized ? 'h-auto' : 'h-[480px]'
        )}
        drag
        dragMomentum={false}
        dragElastic={0}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-none">PhysicsBot</p>
            <p className="text-xs text-blue-200 mt-0.5 truncate">
              {currentExperiment ? `Experiment: ${currentExperiment}` : 'AI Physics Tutor'}
            </p>
          </div>
          <button
            onClick={() => setMinimized((m) => !m)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Minimize"
          >
            {minimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
          </button>
          <button
            onClick={() => setPhysicsBotOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body (hidden when minimised) ── */}
        {!minimized && (
          <>
            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8">
                  <Bot size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Ask me anything about your circuit or experiment!</p>
                  <p className="text-xs mt-1 opacity-70">I can see your live circuit state.</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-2 border border-slate-200 dark:border-white/10 focus-within:border-blue-400 transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your circuit…"
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Send"
                >
                  <Send size={13} />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 mt-1.5">
                Powered by Gemini AI · Context-aware physics tutoring
              </p>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
