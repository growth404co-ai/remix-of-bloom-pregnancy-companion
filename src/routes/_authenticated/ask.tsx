import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({
    meta: [
      { title: "Ask Bloom AI" },
      { name: "description", content: "Chat with Bloom AI" },
    ],
  }),
  component: AskPage,
});

function AskPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    id: "bloom-chat",
    transport: chatTransport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <div className="flex h-screen flex-col bg-[var(--cream)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--bloom-border)] bg-white/80 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ink)]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--rose)] text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">Bloom AI</p>
            <p className="text-[10px] text-[var(--bloom-muted)]">
              {isLoading ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--rose)] text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="font-serif text-lg text-[var(--ink)]">Ask Bloom AI ✨</p>
            <p className="mt-1 text-sm text-[var(--bloom-muted)]">
              Ask anything about pregnancy, nutrition, or baby development.
            </p>
          </div>
        )}

        {messages.map((message: UIMessage) => {
          const text = message.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("");

          return (
            <div
              key={message.id}
              className={`mb-3 flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[var(--rose)] text-white"
                    : "border border-[var(--bloom-border)] bg-white text-[var(--ink)]"
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}

        {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
          <div className="mb-3 flex justify-start">
            <div className="max-w-[80%] rounded-2xl border border-[var(--bloom-border)] bg-white px-4 py-2.5 text-sm italic text-[var(--bloom-muted)]">
              Bloom is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-[var(--bloom-border)] bg-white px-4 py-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={1}
          placeholder="What would you like to know?"
          className="max-h-32 flex-1 resize-none rounded-xl border border-[var(--bloom-border)] bg-[var(--cream)] py-2.5 px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--rose)] text-white transition-colors hover:bg-[var(--rose-dark)] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
