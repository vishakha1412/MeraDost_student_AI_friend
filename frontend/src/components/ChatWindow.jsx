import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { sendChat } from "../api";

const WELCOME = {
  chat: "Hey! I'm MeraDost 👋 Ask me anything - concepts, code, doubts, life advice, whatever you need.",
  rag: "Upload a document on the left, then ask me questions about it. I'll answer strictly from your files.",
  research: "I'm your Research Agent - I search the live web (via Tavily) to answer with up-to-date info and sources.",
  interview: "Set a target role on the left, then say 'start' and I'll begin your mock interview, one question at a time.",
  exam: "Set a topic and difficulty on the left, then ask me to generate practice questions or evaluate your answers.",
  assignment: "Set a topic on the left and tell me what your assignment needs - I'll help you write and understand it.",
};

export default function ChatWindow({ sessionId, mode, extra }) {
  const [messagesByMode, setMessagesByMode] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const messages = messagesByMode[mode] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function pushMessage(m, targetMode = mode) {
    setMessagesByMode((prev) => ({
      ...prev,
      [targetMode]: [...(prev[targetMode] || []), m],
    }));
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    pushMessage({ role: "user", content: text });
    setLoading(true);
    try {
      const reply = await sendChat({
        sessionId,
        mode,
        message: text,
        topic: extra.topic,
        role: extra.role,
        difficulty: extra.difficulty,
      });
      pushMessage({ role: "assistant", content: reply });
    } catch (err) {
      pushMessage({ role: "assistant", content: `⚠️ ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-5">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 text-xs sm:text-sm text-slate-300"
            >
              {WELCOME[mode]}
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
          </AnimatePresence>

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 bg-black/20 px-3 sm:px-6 py-3 sm:py-4">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2 sm:gap-3">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="max-h-32 flex-1 resize-none rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm outline-none focus:border-dost-400"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-dost-500 text-white shadow-glow disabled:opacity-40"
          >
            <Send size={15} className="sm:size-17" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
