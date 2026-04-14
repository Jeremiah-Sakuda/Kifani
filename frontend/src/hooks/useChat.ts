import { useState } from "react";
import { sendChatMessage, type ChatMessage } from "../services/api";

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function send(content: string) {
    const userMsg: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendChatMessage(sessionId, content);
      const assistantMsg: ChatMessage = { role: "assistant", content: res.reply };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, send };
}
