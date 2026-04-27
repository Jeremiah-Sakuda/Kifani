import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../hooks/useChat";

const SUGGESTED_PROMPTS = [
  "Why this sport and not another?",
  "What about endurance events specifically?",
  "What classification would I look up if I had a leg amputation?",
  "How has this archetype evolved over 120 years?",
];

interface Props {
  sessionId: string;
}

export default function ChatInterface({ sessionId }: Props) {
  const { messages, loading, send } = useChat(sessionId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;
    send(msg);
    setInput("");
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-forge-charcoal/60 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-forge-graphite/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-core/10">
            <svg className="h-4 w-4 text-gold-core" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-lg text-white">Continue the Conversation</h3>
            <p className="text-xs text-smoke">Powered by Gemini</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="max-h-96 min-h-[200px] overflow-y-auto p-6">
        {/* Suggested prompts when no messages */}
        {messages.length === 0 && (
          <div className="mb-6">
            <p className="mb-3 text-xs uppercase tracking-wider text-ash">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <motion.button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-full bg-forge-steel px-4 py-2 text-sm text-smoke transition hover:bg-forge-iron hover:text-white"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Message thread */}
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gold-core/20 text-white"
                      : "bg-forge-steel text-silver"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-gold-core" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-core">
                        Gemini
                      </span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-forge-steel px-4 py-3">
                <div className="loading-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="text-xs text-smoke">Thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-forge-graphite/50 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your archetype, sports, or classifications..."
            className="input flex-1 bg-forge-steel/80"
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary px-6"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </motion.button>
        </form>
      </div>
    </div>
  );
}
