import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { join } from "node:path";
import next from "next";
import { Server } from "socket.io";

const hasProdBuild = existsSync(join(process.cwd(), ".next", "BUILD_ID"));
const dev = process.env.NODE_ENV !== "production" || !hasProdBuild;
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port, webpack: dev });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((req, res) => {
  handle(req, res);
});

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || `http://${hostname}:${port}`,
    methods: ["GET", "POST"],
  },
});

globalThis.__ilanra_io = io;

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (typeof userId === "string" && userId.length > 0) {
      socket.join(`user:${userId}`);
    }
  });
});

server.listen(port, () => {
  console.log(`> ilanra http://${hostname}:${port} (Socket.IO aktif)`);
});
