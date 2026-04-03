"use client";
import YouTube from "react-youtube";
import { socket } from "../lib/socket";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, RotateCw, Play, Pause, Lock, PlayCircle } from "lucide-react";

export default function YoutubePlayer({ videoId, roomId, isHost, canControl }) {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false); 
  // Naya state: Participant ne join button dabaya ya nahi
  const [hasJoined, setHasJoined] = useState(false);

  const hasControl = isHost || canControl;

  useEffect(() => {
    if (!socket) return;

    const handleVideoSync = ({ state, time }) => {
      // Host ko sync karne ki zaroorat nahi, aur Participant tabhi sync hoga jab Join dabayega
      if (hasControl || (!hasJoined && !isHost)) return; 
      
      if (playerRef.current) {
        const player = playerRef.current;
        const currentTime = player.getCurrentTime();

        if (Math.abs(currentTime - time) > 2) {
          player.seekTo(time, true);
        }

        if (state === "play") {
          player.playVideo();
          setIsPlaying(true);
        } else {
          player.pauseVideo();
          setIsPlaying(false);
        }
      }
    };

    socket.on("video-sync", handleVideoSync);
    return () => socket.off("video-sync", handleVideoSync);
  }, [hasControl, hasJoined, isHost]);

  // --- JOIN BUTTON CLICK LOGIC ---
  const handleJoinParty = () => {
    setHasJoined(true);
    if (playerRef.current) {
      playerRef.current.unMute(); // Sound enable karo
      // Server se request karo ki "bhai abhi kahan par hai video?"
      socket.emit("video-update-request", { roomId }); 
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current || !hasControl) return;
    const player = playerRef.current;
    const currentTime = player.getCurrentTime();
    
    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
      socket.emit("video-update", { roomId, state: "pause", time: currentTime });
    } else {
      player.playVideo();
      setIsPlaying(true);
      socket.emit("video-update", { roomId, state: "play", time: currentTime });
    }
  };

  const handleSkip = (seconds) => {
    if (!playerRef.current || !hasControl) return;
    const player = playerRef.current;
    const newTime = player.getCurrentTime() + seconds;
    player.seekTo(newTime, true);
    socket.emit("video-update", { 
      roomId, 
      state: isPlaying ? "play" : "pause", 
      time: newTime 
    });
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    if (!hasControl) {
      event.target.mute(); // Shuruat mein mute (Autoplay policy)
      event.target.pauseVideo();
    }
  };

  const onStateChange = (event) => {
    if (hasControl) {
      const state = event.data === 1 ? "play" : "pause";
      const time = event.target.getCurrentTime();
      if ((state === "play" && !isPlaying) || (state === "pause" && isPlaying)) {
        setIsPlaying(event.data === 1);
        socket.emit("video-update", { roomId, state, time });
      }
    }
  };

  const opts = {
    width: "100%",
    height: "100%",
    playerVars: { 
      autoplay: 0, 
      controls: hasControl ? 1 : 0, 
      disablekb: hasControl ? 0 : 1, 
      rel: 0, 
      modestbranding: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : ''
    },
  };

  return (
    <div className="w-full h-full aspect-video bg-black relative group flex items-center justify-center overflow-hidden rounded-[1.5rem]">
      
      {/* PARTICIPANT JOIN OVERLAY */}
      {!isHost && !hasJoined && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-blue-600/20 p-4 rounded-full mb-4 animate-pulse">
                <PlayCircle size={40} className="text-blue-500" />
            </div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-2">Watch Party Ready</h3>
            <p className="text-slate-400 text-[10px] mb-6 max-w-[200px]">Host is watching. Click below to sync and join the stream!</p>
            <button 
                onClick={handleJoinParty}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-tighter transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
                Join Live Party
            </button>
        </div>
      )}

      {/* SYNC STATUS BADGE */}
      {!hasControl && hasJoined && (
        <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-md p-2 rounded-lg flex items-center gap-2 border border-white/10 pointer-events-none">
          <Lock size={12} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Synced Live</span>
        </div>
      )}

      {/* HOST CONTROLS */}
      {hasControl && (
        <div className="absolute z-40 flex items-center gap-8 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 p-6 rounded-3xl backdrop-blur-sm border border-white/5 scale-95 group-hover:scale-100">
          <button onClick={() => handleSkip(-10)} className="p-3 hover:bg-blue-600 rounded-full transition-colors text-white">
            <RotateCcw size={28} />
          </button>
          <button onClick={togglePlayPause} className="p-5 bg-blue-600 hover:bg-blue-500 rounded-full transition-all transform hover:scale-110 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          <button onClick={() => handleSkip(10)} className="p-3 hover:bg-blue-600 rounded-full transition-colors text-white">
            <RotateCw size={28} />
          </button>
        </div>
      )}

      <div className={`w-full h-full ${!hasControl ? "pointer-events-none select-none" : ""}`}>
        <YouTube
          videoId={videoId}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
          opts={opts}
          className="w-full h-full shadow-2xl"
        />
      </div>
    </div>
  );
}
