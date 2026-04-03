"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { socket } from "../../../lib/socket";
import YoutubePlayer from "../../../components/YoutubePlayer";
import Chat from "../../../components/Chat";
import { Users, PlayCircle, LogOut, Loader2, Link as LinkIcon, ShieldCheck, ShieldAlert } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Room() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params?.id?.toString();
  const isHostQuery = searchParams.get('isHost') === 'true';

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(1);
  const [videoUrl, setVideoUrl] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState("dQw4w9WgXcQ");
  
  const [isAsliHost, setIsAsliHost] = useState(false);
  const [canControl, setCanControl] = useState(false);

  const getUsernameFromCookie = () => {
    if (typeof document === "undefined") return "Guest";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; username=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  };

  const cookieUsername = useMemo(() => getUsernameFromCookie(), []);

  useEffect(() => {
    const checkAuthAndJoin = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (!res.ok || !data.user) {
          toast.error("pleas login!");
          window.location.href = "/login";
          return;
        }

        const finalUsername = cookieUsername || data.user.username;
        setUser({ ...data.user, username: finalUsername });

        if (roomId && socket) {
          socket.emit("join-room", {
            roomId,
            username: finalUsername,
            userId: data.user.id,
            isHost: isHostQuery 
          });

          socket.on("host-status", (status) => {
            setIsAsliHost(status);
            if (status) setCanControl(true);
          });

          socket.on("room-users", (count) => setTotalUsers(count));
          
          // Video ID update listener
          socket.on("video-changed", (id) => {
            setCurrentVideoId(id);
            toast.success("Video changed! ");
          });

          socket.on("permission-updated", (allowed) => {
            setCanControl(allowed);
            const msg = allowed ? "acees all user" : "only admin!";
            toast(msg, { icon: '' });
          });

          socket.on("kicked-from-room", () => {
            toast.error("Host;s you kicked ");
            router.push("/");
          });
        }
      } catch (err) {
        console.error("Auth Error:", err);
        window.location.href = "/login";
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthAndJoin();

    return () => {
      if (socket) {
        socket.off("host-status");
        socket.off("room-users");
        socket.off("video-changed");
        socket.off("permission-updated");
        socket.off("kicked-from-room");
      }
    };
  }, [roomId, router, cookieUsername, isHostQuery]);

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleVideoChange = (e) => {
    e.preventDefault();
    // YouTube ID extraction logic
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;

    if (id && (isAsliHost || canControl)) {
      setCurrentVideoId(id);
      socket.emit("change-video", { roomId, videoId: id });
      setVideoUrl("");
    } else {
      toast.error("pls ckeck link!");
    }
  };

  if (authLoading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Verifying Identity...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-3 bg-slate-900/80 border-b border-slate-800 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-4">
          <PlayCircle className="text-blue-400" size={24} />
          <h1 className="font-black text-xs uppercase tracking-widest text-slate-400">
            Room ID: <span className="text-white">{roomId}</span>
            {isAsliHost && <span className="ml-2 text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-full">HOST</span>}
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/40 p-1 pr-3 rounded-xl border border-slate-700/50">
          <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase">
            {user.username[0]}
          </div>
          <span className="text-[10px] font-black text-slate-200 uppercase">{user.username}</span>
          <button onClick={handleLogout} className="ml-2 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-4 gap-4">
        <div className="flex-[3] flex flex-col gap-4">
          
          {(isAsliHost || canControl) ? (
            <form onSubmit={handleVideoChange} className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
              <div className="flex-1 flex items-center px-4 gap-2 bg-slate-950 rounded-xl border border-slate-800 focus-within:border-blue-500 transition-all">
                <LinkIcon size={14} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Paste YouTube Link..."
                  className="w-full bg-transparent py-2.5 text-xs focus:outline-none text-white"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-blue-600 px-6 rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 transition-colors">Update Video</button>
            </form>
          ) : (
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Watching Party Live 🎥</p>
            </div>
          )}

          <div className="flex-1 bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative">
            {/* Key prop add ki hai taaki video change hote hi component refresh ho jaye */}
            <YoutubePlayer 
              key={currentVideoId}
              videoId={currentVideoId} 
              roomId={roomId} 
              isHost={isAsliHost} 
              canControl={canControl} 
            />
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="flex-1 flex flex-col gap-4 min-w-[320px]">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
                <Users size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Live</p>
                <p className="text-xl font-black leading-none">{totalUsers} ONLINE</p>
              </div>
            </div>
            
            {isAsliHost && (
              <button 
                onClick={() => socket.emit("toggle-permissions", { roomId, allowed: !canControl })} 
                className={`p-2 rounded-lg border transition-all ${canControl ? 'bg-green-500/20 border-green-500/30 text-green-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                title={canControl ? "Lock Controls" : "Unlock Controls for All"}
              >
                {canControl ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl">
            <Chat roomId={roomId} isHost={isAsliHost} />
          </div>
        </div>
      </div>
    </div>
  );
}
