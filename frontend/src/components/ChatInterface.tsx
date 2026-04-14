import { useState } from "react";
import { motion } from "framer-motion";
import { useChat } from "../hooks/useChat";

const SUGGESTED_PROMPTS = [
  "What about swimming specifically?",
  "How has this archetype changed over 120 years?",
  "Which Paralympic events match me best?",
];

interface Props {
  sessionId: string;
}

export default function ChatInterface({ sessionId }: Props) {
  const { messages, loading, send } = useChat(sessionId);
  const [input, setInput] = useState("");

  function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;
    send(msg);
    setInput("");
  }

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-4 font-heading text-lg font-semibold text-white">
        Ask a Follow-Up
      </h2>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="rounded-full border border-silver/15 px-4 py-1.5 text-sm text-slate transition hover:border-gold/30 hover:text-gold"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "ml-auto max-w-[80%] bg-navy-mid text-white"
                : "mr-auto max-w-[80%] bg-navy-light text-silver"
            }`}
          >
            {msg.content}
          </motion.div>
        ))}
        {loading && (
          <div className="mr-auto flex gap-1 px-4 py-3">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold/40 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold/40 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gold/40 [animation-delay:300ms]" />
          </div>
        )}
      </div>

      {/* Input */}
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
          placeholder="Ask about your archetype..."
          className="flex-1 rounded-lg border border-silver/10 bg-navy-light px-4 py-3 text-white placeholder-slate/50 outline-none transition focus:border-gold/40"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="gradient-gold rounded-lg px-6 py-3 font-heading text-sm font-semibold text-navy transition disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </section>
  );
}
