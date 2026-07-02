import type { Server as HttpServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import { verifyAccessToken } from "../auth/auth.service.js";
import * as chatService from "./chat.service.js";

interface AuthenticatedSocket {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
}

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map<string, Set<string>>();

function addOnline(userId: string, socketId: string) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId)!.add(socketId);
}

function removeOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) onlineUsers.delete(userId);
  }
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function initSocketServer(httpServer: HttpServer, corsOrigin: string) {
  const io = new SocketServer(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
  });

  // Auth middleware — every socket connection must provide a valid JWT
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) return next(new Error("Missing token"));

      const payload = verifyAccessToken(token);
      (socket as typeof socket & { auth: AuthenticatedSocket }).auth = {
        userId: payload.sub,
        role: payload.role,
      };
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const auth = (socket as typeof socket & { auth: AuthenticatedSocket }).auth;
    const { userId, role } = auth;

    addOnline(userId, socket.id);
    io.emit("presence:online", { userId });

    // Join a conversation room
    socket.on("join:conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send a message
    socket.on(
      "message:send",
      async (data: { conversationId: string; content?: string; attachmentUrl?: string; attachmentType?: string }) => {
        try {
          const isAdmin = role === "ADMIN";
          const message = await chatService.sendMessage(
            data.conversationId,
            userId,
            isAdmin,
            {
              content: data.content,
              attachmentUrl: data.attachmentUrl,
              attachmentType: data.attachmentType as "image" | "file" | undefined,
            }
          );

          // Broadcast to everyone in the conversation room
          io.to(`conversation:${data.conversationId}`).emit("message:new", message);
        } catch (err) {
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Typing indicators
    socket.on("typing:start", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", { userId });
    });

    socket.on("typing:stop", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", { userId });
    });

    // Mark messages as read
    socket.on("messages:read", async (conversationId: string) => {
      try {
        await chatService.markMessagesRead(conversationId, userId);
        socket
          .to(`conversation:${conversationId}`)
          .emit("messages:read", { conversationId, readBy: userId });
      } catch {
        // Silently ignore read-receipt failures
      }
    });

    socket.on("disconnect", () => {
      removeOnline(userId, socket.id);
      if (!isUserOnline(userId)) {
        io.emit("presence:offline", { userId });
      }
    });
  });

  return io;
}