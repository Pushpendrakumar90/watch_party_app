import { io } from "socket.io-client";


const URL =  "https://live-chat-server-1.onrender.com"

export const socket = io(URL, {
  transports: ["websocket"], 
  autoConnect: true
});
