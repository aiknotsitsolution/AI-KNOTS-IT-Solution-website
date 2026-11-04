

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Chatbot = () => {
  const { isDark } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      type: "bot",
      text: "Hi! I'm AI Knots, your AI assistant at AI Knots IT Solution. How can I help you today?",
    },
    {
      //type hello
      id: "hello",
      type: "bot",
      text: "Hello! How can I assist you today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const chatRef = useRef(null);
  const quickReplies = [
    "Tell me about your services",
    "How can you help my business?",
    "Contact information",
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const extractBotReply = useCallback((data) => {
    console.log("🔍 Langflow Response:", data);

    if (!data) return "Sorry, I couldn't process your request.";

    try {
      // Primary paths
      return (
        data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
        data.outputs?.[0]?.outputs?.[0]?.outputs?.message?.text ||
        data.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
        data.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
        data.text ||
        data.message?.message ||
        data.message ||
        // Deep search fallback
        Object.values(data).find(
          (val) => typeof val === "string" && val.length > 10
        ) ||
        "I received your message. How can I assist you further?"
      );
    } catch (err) {
      console.error("Response parsing failed:", err);
      return "I'm having trouble understanding the response right now.";
    }
  }, []);

  const sendMessage = useCallback(async (text = input) => {
    const userText = text?.trim();
    if (!userText || isLoading) return;

    setInput("");
    setIsLoading(true);

    const tempId = Date.now();

    // Add user message + loading bot message
    setMessages((prev) => [
      ...prev,
      { id: `user-${tempId}`, type: "user", text: userText },
      { id: tempId, type: "bot", isLoading: true },
    ]);

    try {
      const sessionId = crypto.randomUUID?.() || `session-${Date.now()}`;

      const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const response = await fetch(
        `${apiBaseUrl}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            output_type: "chat",
            input_type: "chat",
            input_value: userText,
            session_id: sessionId,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const botReply = extractBotReply(data);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { id: `bot-${tempId}`, type: "bot", text: botReply } : msg
        )
      );
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = "Sorry, I'm having trouble connecting. Please try again.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { id: `bot-${tempId}`, type: "bot", text: errorMsg } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, extractBotReply]);

  // Loading Animation
  const LoadingDots = () => (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-current rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-[90] p-4 rounded-full bg-[#8B6B4A] text-white shadow-lg shadow-[#3D220E]/40 transition-all duration-300 ${
          showScrollTop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-24 z-[100] p-4 rounded-full bg-[#8B6B4A] hover:bg-[#6B4B3A] text-white shadow-xl shadow-[#3D220E]/50 transition-all"
        aria-label="Open Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-24 right-8 z-[110] w-full max-w-[380px] border rounded-3xl shadow-2xl overflow-hidden ${
              isDark ? "bg-gray-950 border-[#8B6B4A]/50" : "bg-white border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="bg-[#8B6B4A] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AIKS Assistant</h3>
                  <p className="text-xs text-[#D9C5B5]">Online • AI Knots IT</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-[#F5EDE4] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className={`h-80 overflow-y-auto p-4 space-y-4 ${isDark ? "bg-black/60" : "bg-gray-50"}`}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.type === "user"
                        ? "bg-[#8B6B4A] text-white"
                        : isDark
                        ? "bg-gray-900 text-gray-200 border border-gray-800"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.isLoading ? <LoadingDots /> : msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            <div className={`p-3 border-t flex flex-wrap gap-2 ${isDark ? "border-gray-800 bg-gray-950" : "border-gray-200 bg-white"}`}>
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(reply)}
                  disabled={isLoading}
                  className={`text-xs px-4 py-2 rounded-full transition-all ${
                    isDark
                      ? "bg-gray-900 hover:bg-[#3D220E] border border-gray-700"
                      : "bg-gray-100 hover:bg-[#F5EDE4] border border-gray-300"
                  }`}
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t flex gap-2 ${isDark ? "border-gray-800 bg-gray-950" : "border-gray-200 bg-white"}`}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                disabled={isLoading}
                className={`flex-1 rounded-full px-5 py-3 text-sm focus:outline-none ${
                  isDark
                    ? "bg-gray-900 border border-gray-700 focus:border-[#8B6B4A]"
                    : "bg-gray-100 border border-gray-300 focus:border-[#8B6B4A]"
                }`}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="hover:opacity-90 disabled:opacity-40 disabled:bg-gray-700 p-3 rounded-full transition-all flex-shrink-0 text-white"
                style={{ backgroundColor: "#8B6B4A" }}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;