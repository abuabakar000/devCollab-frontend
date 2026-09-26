import { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import { FaTimes, FaRobot, FaPaperPlane, FaTrashAlt, FaLightbulb, FaExternalLinkAlt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

const quickPrompts = [
  "🚀 Find real-time or WebRTC projects",
  "⚡ Which projects use Go or Docker?",
  "👥 Recommend active developers to collaborate with",
  "💡 Summarize the DevCollab platform"
];

// Helper to render markdown-like text with clickable React Router links and formatting
const FormattedMessage = ({ text }) => {
  if (!text) return null;

  // Split into lines
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-xs md:text-sm leading-relaxed text-fg-default font-normal break-words">
      {lines.map((line, lineIdx) => {
        // Empty lines
        if (!line.trim()) return <div key={lineIdx} className="h-1.5" />;

        // Header / Divider
        if (line.startsWith("### ")) {
          return (
            <h4 key={lineIdx} className="font-bold text-accent text-sm md:text-base mt-2 mb-1">
              {line.replace("### ", "")}
            </h4>
          );
        }
        if (line.startsWith("---")) {
          return <hr key={lineIdx} className="border-white/10 my-2" />;
        }

        // Parse links: [Text](URL) and bold: **text**
        const parts = [];
        const regex = /\[(.*?)\]\((.*?)\)|\*\*(.*?)\*/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
          }

          if (match[1] && match[2]) {
            // Markdown link
            const linkText = match[1];
            const linkUrl = match[2];
            const isInternal = linkUrl.startsWith("/");

            if (isInternal) {
              parts.push(
                <Link
                  key={match.index}
                  to={linkUrl}
                  className="inline-flex items-center gap-1 font-bold text-accent hover:text-accent-hover underline decoration-accent/40 underline-offset-2 transition-colors mx-0.5"
                >
                  {linkText}
                  <FaExternalLinkAlt size={9} className="opacity-70" />
                </Link>
              );
            } else {
              parts.push(
                <a
                  key={match.index}
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-accent hover:text-accent-hover underline decoration-accent/40 underline-offset-2 transition-colors mx-0.5"
                >
                  {linkText}
                  <FaExternalLinkAlt size={9} className="opacity-70" />
                </a>
              );
            }
          } else if (match[3]) {
            // Bold
            parts.push(
              <strong key={match.index} className="font-bold text-fg-default">
                {match[3]}
              </strong>
            );
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }

        const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");

        return (
          <p key={lineIdx} className={isBullet ? "pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-accent font-medium text-fg-muted" : ""}>
            {parts}
          </p>
        );
      })}
    </div>
  );
};

const AICopilot = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hey there! I'm your **DevCollab AI Copilot** powered by Gemini. Ask me anything about our community's projects, tech stacks, or developers!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const newMessages = [...messages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = newMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.text
      }));

      const { data } = await api.post("/ai/chat", {
        message: textToSend,
        history: historyPayload
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "Sorry, I couldn't generate a response." }
      ]);
    } catch (err) {
      console.error("AI Copilot request failed:", err);
      const errMsg = err.response?.data?.message || "Failed to reach AI Copilot. Please check back in a moment!";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `⚠️ **Error:** ${errMsg}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        text: "Chat cleared! What would you like to explore next?"
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom-Left) */}
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[90]">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 bg-canvas-subtle/90 hover:bg-canvas-subtle backdrop-blur-xl border border-accent/40 hover:border-accent text-fg-default rounded-full shadow-2xl shadow-accent/20 hover:shadow-accent/40 hover:scale-105 active:scale-95 transition-all duration-300 neon-glow cursor-pointer"
            title="Ask DevCollab AI Copilot"
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent group-hover:rotate-12 transition-transform duration-300">
              <HiSparkles className="text-lg animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-accent flex items-center gap-1.5">
                AI Copilot
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              </span>
              <span className="text-[9px] text-fg-subtle font-medium hidden sm:inline">Ask anything</span>
            </div>
          </button>
        ) : null}
      </div>

      {/* AI Chat Window Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[95] w-[92vw] sm:w-[420px] h-[520px] md:h-[580px] flex flex-col glass-card rounded-[2rem] border border-accent/30 shadow-3xl overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-white/5 bg-canvas-default/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-inner">
                <HiSparkles size={20} className="animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-black text-sm md:text-base text-fg-default uppercase tracking-wider flex items-center gap-2">
                  DevCollab AI
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    Gemini Live
                  </span>
                </h3>
                <p className="text-[10px] text-fg-subtle">Real-time Project & Developer Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-2 text-fg-subtle hover:text-fg-default hover:bg-white/5 rounded-xl transition-colors"
                title="Clear conversation"
              >
                <FaTrashAlt size={12} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-fg-subtle hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                title="Close Copilot"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-thin bg-canvas-default/30">
            {messages.map((m, index) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={index}
                  className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-0.5">
                      <FaRobot size={12} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 md:p-4 text-xs md:text-sm ${
                      isAssistant
                        ? "bg-white/[0.03] border border-white/5 text-fg-default shadow-md"
                        : "bg-accent text-white font-medium shadow-lg shadow-accent/20 ml-auto"
                    }`}
                  >
                    {isAssistant ? (
                      <FormattedMessage text={m.text} />
                    ) : (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                  <FaRobot size={12} />
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-fg-subtle ml-2 font-medium">Scanning DevCollab...</span>
                </div>
              </div>
            )}

            {/* Quick Starters (Only when conversation is fresh) */}
            {messages.length <= 1 && (
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-fg-subtle uppercase tracking-wider mb-2.5">
                  <FaLightbulb className="text-accent" />
                  Quick Questions
                </div>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs text-fg-muted hover:text-accent bg-white/[0.02] hover:bg-accent/10 border border-white/5 hover:border-accent/30 rounded-xl px-3 py-2 transition-all duration-200 cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 md:p-4 border-t border-white/5 bg-canvas-default/80 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about projects, tech, developers..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white/[0.03] border border-white/5 focus:border-accent/50 focus:ring-2 focus:ring-accent/10 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-fg-default outline-none transition-all placeholder:text-fg-muted/40 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale cursor-pointer flex items-center justify-center shrink-0"
              title="Send question"
            >
              <FaPaperPlane size={13} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AICopilot;
