"use client";
import YouTube from "react-youtube";
import { socket } from "../../lib/socket";
import { useEffect, useRef } from "react";

export default function YoutubePlayer({ videoId, roomId }) {
  const playerRef = useRef(null);

  useEffect(() => {
    // Dusre users se sync command lena
    socket.on("video-sync", ({ state, time }) => {
      if (state === "play") {
        playerRef.current?.seekTo(time);
        playerRef.current?.playVideo();
      } else if (state === "pause") {
        playerRef.current?.pauseVideo();
      }
    });

    return () => socket.off("video-sync");
  }, []);

  const onStateChange = (event) => {
    const state = event.data;
    const time = event.target.getCurrentTime();

    // 1 = Playing, 2 = Paused
    if (state === 1) {
      socket.emit("video-update", { roomId, state: "play", time });
    } else if (state === 2) {
      socket.emit("video-update", { roomId, state: "pause", time });
    }
  };

  return (
    <YouTube
      videoId={videoId}
      onReady={(e) => (playerRef.current = e.target)}
      onStateChange={onStateChange}
      opts={{ width: "100%", height: "500px" }}
    />
  );
}