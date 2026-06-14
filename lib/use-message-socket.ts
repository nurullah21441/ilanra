"use client";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

export function useMessageSocket(
  userId: string | null | undefined,
  onNewMessage: () => void,
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!userId) return;

    const socket: Socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      socket.emit("join", userId);
    });

    socket.on("new_message", () => {
      callbackRef.current();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
}
