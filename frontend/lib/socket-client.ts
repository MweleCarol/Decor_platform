import { io, type Socket } from "socket.io-client";
import { getMockSocket } from "@/mock/chat/mock-socket";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (USE_MOCK) {
    return getMockSocket() as unknown as Socket;
  }
  if (!socket) {
    const token = localStorage.getItem("access_token");
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (USE_MOCK) {
    getMockSocket().disconnect();
    return;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}