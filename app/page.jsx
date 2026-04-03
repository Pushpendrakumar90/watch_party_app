"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tv, Users, Lock, ShieldCheck, PlusCircle, LogIn } from "lucide-react"; 

export default function Home() {
  const [createRoomId, setCreateRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const router = useRouter();

  const generatePassword = () => {
    return Math.random().toString(36).slice(-6).toUpperCase();
  };

  
  const handleCreate = (e) => {
    e.preventDefault();
    if (createRoomId.trim()) {
      const autoPassword = generatePassword();
      router.push(`/room/${createRoomId.trim()}?pwd=${autoPassword}`);
    }
  };

 
  const handleJoin = (e) => {
    e.preventDefault();
    if (joinRoomId.trim() && joinPassword.trim()) {
      router.push(`/room/${joinRoomId.trim()}?pwd=${joinPassword.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent italic">
          WATCH PARTY
        </h1>
        <p className="text-slate-400 text-lg">Sync. Stream. Socialize.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 text-orange-400">
            <PlusCircle size={28} />
            <h2 className="text-2xl font-bold">Create Room</h2>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">New Room Name</label>
              <input
                type="text"
                placeholder="e.g. MyParty123"
                value={createRoomId}
                onChange={(e) => setCreateRoomId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                required
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">
              Generate Secure Room
            </button>
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-tighter">Auto-password will be generated</p>
          </form>
        </div>

        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 text-red-500">
            <LogIn size={28} />
            <h2 className="text-2xl font-bold">Join Party</h2>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Room ID</label>
              <input
                type="text"
                placeholder="Enter ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                required
              />
            </div>
            <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">
              Join Now
            </button>
          </form>
        </div>

      </div>

      <div className="mt-12 text-slate-600 text-sm">
       All rooms are secured with end-to-end sync.
      </div>
    </div>
  );
}