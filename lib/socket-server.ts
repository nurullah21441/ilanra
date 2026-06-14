import type { Server } from "socket.io";

declare global {
  var __ilanra_io: Server | undefined;
}

export function getSocketIO(): Server | null {
  return globalThis.__ilanra_io ?? null;
}

export function emitNewMessage(
  receiverId: string,
  senderId: string,
  payload: { message: unknown },
) {
  const io = getSocketIO();
  if (!io) return;
  io.to(`user:${receiverId}`).emit("new_message", payload);
  io.to(`user:${senderId}`).emit("new_message", payload);
}
