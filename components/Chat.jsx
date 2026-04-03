"use client";
import { useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { Send, MessageSquare, UserX } from "lucide-react";
import toast from "react-hot-toast";

export default function Chat({ roomId, isHost ,username}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);

  

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.off("receive-message");

    const handleReceiveMessage = (data) => {
      if (data.roomId === roomId.toString()) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    socket.on("new-user-message", (data) => {
      setMessages((prev) => [...prev, { 
        text: data.message, 
        sender: "System", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    });

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("new-user-message");
    };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && roomId) {
      const msgData = {
        roomId: roomId.toString(),
        text: inputMessage,
        sender: username, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        socketId: socket.id 
      };

      socket.emit("send-message", msgData);
      setMessages((prev) => [...prev, msgData]);
      setInputMessage("");
    }
  };

  const handleKick = (targetId, targetName) => {
    if (isHost && targetId !== socket.id) {
      if (window.confirm(`${targetName} ko nikalna hai?`)) {
        socket.emit("kick-user", { roomId, targetId });
        toast.success(`${targetName} kicked out!`);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/40 backdrop-blur-md overflow-hidden h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/20 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Room Chat</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => {
          const isMe = msg.socketId === socket.id || msg.sender === username;
          const isSystem = msg.sender === "System";

          return (
            <div key={index} className={`flex flex-col ${isSystem ? "items-center" : isMe ? "items-end" : "items-start"}`}>
              
              <div className="flex items-center gap-2 group">
                {isHost && !isMe && !isSystem && (
                  <button 
                    onClick={() => handleKick(msg.socketId, msg.sender)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all mr-1"
                    title="Kick User"
                  >
                    <UserX size={12} />
                  </button>
                )}

                <div className={`max-w-[200px] px-3 py-2 rounded-2xl text-xs shadow-sm border ${
                  isSystem ? "bg-slate-800/30 text-slate-500 border-none italic" :
                  isMe ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' : 
                  'bg-slate-800 border-slate-700 text-slate-200 rounded-tl-none'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>

              {!isSystem && (
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className={`text-[9px] font-bold uppercase ${isMe ? "text-blue-400" : "text-slate-500"}`}>
                    {msg.sender}
                  </span>
                  <span className="text-[8px] text-slate-600 font-bold">{msg.time}</span>
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

     
      <form onSubmit={sendMessage} className="p-3 bg-slate-900/80 border-t border-slate-800 flex gap-2">
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-white"
        />
        <button 
          type="submit" 
          disabled={!inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-2.5 rounded-xl transition-all text-white"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}