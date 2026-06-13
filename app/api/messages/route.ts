import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function conversationKey(otherUserId: string, listingId: string | null) {
  return `${otherUserId}:${listingId || ""}`;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const withUserId = req.nextUrl.searchParams.get("with");
  const listingId = req.nextUrl.searchParams.get("listingId");

  if (withUserId) {
    if (withUserId === user.id) {
      return NextResponse.json({ error: "Kendinize mesaj gönderemezsiniz" }, { status: 400 });
    }
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: withUserId },
          { senderId: withUserId, receiverId: user.id },
        ],
        ...(listingId ? { listingId } : {}),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ messages });
  }

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      listing: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversations = new Map<string, {
    otherUser: { id: string; name: string; avatar: string | null };
    listing: { id: string; title: string } | null;
    lastMessage: { id: string; content: string; senderId: string; createdAt: string };
    unreadCount: number;
  }>();

  for (const msg of messages) {
    const other = msg.senderId === user.id ? msg.receiver : msg.sender;
    if (other.id === user.id) continue;
    const key = conversationKey(other.id, msg.listingId);
    if (!conversations.has(key)) {
      conversations.set(key, {
        otherUser: other,
        listing: msg.listing,
        lastMessage: {
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          createdAt: msg.createdAt.toISOString(),
        },
        unreadCount: 0,
      });
    }
  }

  for (const msg of messages) {
    if (msg.receiverId !== user.id || msg.isRead) continue;
    const otherId = msg.senderId;
    const key = conversationKey(otherId, msg.listingId);
    const conv = conversations.get(key);
    if (conv) conv.unreadCount += 1;
  }

  return NextResponse.json({
    conversations: Array.from(conversations.values()),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });

  const { receiverId, content, listingId } = await req.json();
  if (!receiverId || !content) return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  if (receiverId === user.id) {
    return NextResponse.json({ error: "Kendinize mesaj gönderemezsiniz" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { senderId: user.id, receiverId, content, listingId: listingId || null },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
