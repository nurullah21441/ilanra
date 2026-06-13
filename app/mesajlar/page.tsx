"use client";
import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { notifyMessagesUpdated } from "@/lib/messages-ui";
import { loginPath } from "@/lib/auth-url";
import { useMessageSocket } from "@/lib/use-message-socket";

interface Message { id: string; content: string; senderId: string; createdAt: string; sender: { name: string; avatar: string | null }; }
interface Conversation {
  otherUser: { id: string; name: string; avatar: string | null };
  listing: { id: string; title: string } | null;
  lastMessage: { id: string; content: string; senderId: string; createdAt: string };
  unreadCount: number;
}

const POLL_MS = 30000;

function formatMsgTime(date: string) {
  return new Date(date).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function MesajlarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const receiverId = searchParams.get("receiverId");
  const listingId = searchParams.get("listingId");
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesBoxRef = useRef<HTMLDivElement>(null);

  const isSelfChat = !!(me && receiverId && receiverId === me.id);

  const loadConversations = useCallback(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {});
  }, []);

  const loadThread = useCallback(() => {
    if (!receiverId || isSelfChat) {
      setMessages([]);
      return;
    }
    const qs = new URLSearchParams({ with: receiverId });
    if (listingId) qs.set("listingId", listingId);

    fetch(`/api/messages?${qs}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, [receiverId, listingId, isSelfChat]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) {
        const qs = typeof window !== "undefined" ? window.location.search : "";
        router.replace(loginPath(`/mesajlar${qs}`));
        return;
      }
      setMe(d.user);
    });
    loadConversations();
  }, [router, loadConversations]);

  useEffect(() => {
    if (!me || !receiverId) return;
    if (receiverId === me.id) router.replace("/mesajlar");
  }, [me, receiverId, router]);

  useEffect(() => {
    if (!receiverId || isSelfChat) {
      setMessages([]);
      return;
    }

    loadThread();

    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: receiverId, listingId: listingId || null }),
    }).then(() => {
      loadConversations();
      notifyMessagesUpdated();
    });
  }, [receiverId, listingId, isSelfChat, loadThread, loadConversations]);

  const refreshMessages = useCallback(() => {
    loadConversations();
    if (receiverId && !isSelfChat) loadThread();
    notifyMessagesUpdated();
  }, [loadConversations, loadThread, receiverId, isSelfChat]);

  useMessageSocket(me?.id, refreshMessages);

  useEffect(() => {
    if (!me) return;
    const tick = () => {
      loadConversations();
      if (receiverId && !isSelfChat) loadThread();
    };
    const interval = setInterval(tick, POLL_MS);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [me, receiverId, isSelfChat, loadConversations, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function openConversation(otherId: string, convListingId: string | null) {
    if (me && otherId === me.id) return;
    const qs = new URLSearchParams({ receiverId: otherId });
    if (convListingId) qs.set("listingId", convListingId);
    router.push(`/mesajlar?${qs}`);
  }

  async function sendMessage() {
    if (!newMsg.trim() || !receiverId || isSelfChat) return;
    setSending(true);
    setSendError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId, content: newMsg, listingId: listingId || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSendError(data.error || "Mesaj gönderilemedi");
      setSending(false);
      return;
    }
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
      setNewMsg("");
      loadConversations();
      notifyMessagesUpdated();
    }
    setSending(false);
  }

  const activeOther = receiverId && !isSelfChat
    ? conversations.find((c) => c.otherUser.id === receiverId && (c.listing?.id || null) === (listingId || null))?.otherUser
    : null;

  const visibleConversations = conversations.filter((c) => c.otherUser.id !== me?.id);

  function closeThread() {
    router.push("/mesajlar");
  }

  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(20px, 4vw, 22px)", fontWeight: 700, marginBottom: "1.5rem" }}>Mesajlar</h1>
        <div className={`messages-layout${receiverId && !isSelfChat ? " messages-layout--thread" : ""}`} style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", overflow: "hidden" }}>
          <div className="messages-list">
            {visibleConversations.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#999", fontSize: 13, lineHeight: 1.6 }}>
                Henüz mesajın yok.<br />
                Bir ilandan &quot;Mesaj gönder&quot; ile sohbet başlatabilirsin.
              </div>
            ) : visibleConversations.map((c) => {
              const active = receiverId === c.otherUser.id && (listingId || null) === (c.listing?.id || null);
              return (
                <button
                  key={`${c.otherUser.id}-${c.listing?.id || "direct"}`}
                  type="button"
                  onClick={() => openConversation(c.otherUser.id, c.listing?.id || null)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    cursor: "pointer",
                    border: "none",
                    borderBottom: "0.5px solid #f5f5f5",
                    background: active ? "var(--brand-soft)" : c.unreadCount > 0 ? "#fffafa" : "#fff",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600 }}>
                        {c.otherUser.name[0]}
                      </div>
                      {c.unreadCount > 0 && (
                        <span style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "var(--brand)", border: "2px solid #fff" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <div style={{ fontWeight: c.unreadCount > 0 ? 700 : 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.otherUser.name}
                        </div>
                        {c.unreadCount > 0 && (
                          <span style={{ flexShrink: 0, minWidth: 18, height: 18, borderRadius: 100, background: "var(--brand)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                            {c.unreadCount > 9 ? "9+" : c.unreadCount}
                          </span>
                        )}
                      </div>
                      {c.listing && (
                        <div style={{ fontSize: 11, color: "var(--brand)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.listing.title}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: c.unreadCount > 0 ? "#444" : "#999", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: c.unreadCount > 0 ? 500 : 400 }}>
                        {c.lastMessage.content}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="messages-thread">
            {receiverId ? (
              <>
                <div className="messages-thread-header">
                  <button type="button" className="messages-back-btn tap-btn" onClick={closeThread} aria-label="Sohbet listesine dön">
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <span className="overflow-safe" style={{ flex: 1, minWidth: 0 }}>{activeOther?.name || "Sohbet"}</span>
                </div>
                <div ref={messagesBoxRef} style={{ flex: 1, padding: "1.5rem", overflowY: "auto", minWidth: 0 }}>
                  {messages.map((m) => (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.senderId === me?.id ? "flex-end" : "flex-start", marginBottom: 12 }}>
                      <div className="msg-bubble" style={{ background: m.senderId === me?.id ? "var(--brand)" : "#f5f5f5", color: m.senderId === me?.id ? "#fff" : "#1a1a1a", padding: "10px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.45 }}>
                        {m.content}
                      </div>
                      <span style={{ fontSize: 10.5, color: "#bbb", marginTop: 4, padding: "0 4px" }}>
                        {formatMsgTime(m.createdAt)}
                      </span>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#999", padding: "2rem", fontSize: 13 }}>Mesaj göndererek sohbet başlatın</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {sendError && (
                  <div style={{ padding: "8px 16px", fontSize: 13, color: "#dc2626", background: "var(--brand-soft)", borderTop: "0.5px solid var(--brand-border)" }}>
                    {sendError}
                  </div>
                )}
                <div className="messages-compose">
                  <input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  />
                  <button type="button" onClick={sendMessage} disabled={sending || !newMsg.trim()}
                    style={{ opacity: sending || !newMsg.trim() ? 0.7 : 1, cursor: sending ? "wait" : "pointer" }}>
                    {sending ? "..." : "Gönder"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14, padding: "2rem", textAlign: "center", lineHeight: 1.6 }}>
                Soldan bir sohbet seçin<br />veya bir ilandan mesaj gönderin
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function MesajlarPage() {
  return <Suspense><MesajlarContent /></Suspense>;
}
