"use client";
import { useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { Send, MessageSquare } from "lucide-react";

export default function Chat({ roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          text: data.message,
          sender: data.username,
          type: data.type,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    };

    socket.on("new-user-message", handleMessage);
    return () => socket.off("new-user-message", handleMessage);
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && roomId) {
      socket.emit("send-message", {
        roomId: roomId.toString(),
        message: inputMessage,
        username: username,
      });
      setInputMessage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/40 backdrop-blur-md overflow-hidden h-full border-l border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/20 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Chat</h3>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => {
          // 'isMe' check karta hai ki sender aap hain ya koi aur
          const isMe = msg.sender === username;
          const isSystem = msg.type === "JOIN" || msg.type === "LEAVE" || msg.sender === "System";

          if (isSystem) {
            return (
              <div key={index} className="flex justify-center my-2">
                <span className="bg-slate-800/50 text-slate-500 text-[9px] px-3 py-1 rounded-full italic border border-slate-700/50">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {/* Username Label: Only shows for receivers (not for 'me') */}
              {!isMe && (
                <span className="text-[9px] font-black uppercase tracking-tighter mb-1 px-1 text-slate-500">
                  {msg.sender}
                </span>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-xs shadow-lg transition-all ${
                isMe 
                ? 'bg-blue-600 text-white rounded-tr-none border border-blue-500' // Your bubble
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' // Others bubble
              }`}>
                <p className="leading-relaxed break-words">{msg.text}</p>
                <div className={`text-[8px] mt-1 font-medium opacity-60 ${isMe ? "text-right" : "text-left"}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-slate-950/50 border-t border-slate-800 flex gap-2">
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder:text-slate-600"
        />
        <button 
          type="submit" 
          disabled={!inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-3 rounded-xl transition-all text-white active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
