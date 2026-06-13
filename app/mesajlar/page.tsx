"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { notifyMessagesUpdated } from "@/lib/messages-ui";

interface Message { id: string; content: string; senderId: string; createdAt: string; sender: { name: string; avatar: string | null }; }
interface Conversation {
  otherUser: { id: string; name: string; avatar: string | null };
  listing: { id: string; title: string } | null;
  lastMessage: { id: string; content: string; senderId: string; createdAt: string };
  unreadCount: number;
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

  const isSelfChat = !!(me && receiverId && receiverId === me.id);

  function loadConversations() {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []));
  }

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (!d.user) router.push("/giris"); else setMe(d.user); });
    loadConversations();
  }, [router]);

  useEffect(() => {
    if (!me || !receiverId) return;
    if (receiverId === me.id) {
      router.replace("/mesajlar");
    }
  }, [me, receiverId, router]);

  useEffect(() => {
    if (!receiverId || isSelfChat) {
      setMessages([]);
      return;
    }

    const qs = new URLSearchParams({ with: receiverId });
    if (listingId) qs.set("listingId", listingId);

    fetch(`/api/messages?${qs}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []));

    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: receiverId, listingId: listingId || null }),
    }).then(() => {
      loadConversations();
      notifyMessagesUpdated();
    });
  }, [receiverId, listingId, isSelfChat]);

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
    }
    setSending(false);
  }

  const activeOther = receiverId && !isSelfChat
    ? conversations.find((c) => c.otherUser.id === receiverId && (c.listing?.id || null) === (listingId || null))?.otherUser
    : null;

  const visibleConversations = conversations.filter((c) => c.otherUser.id !== me?.id);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1.5rem" }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: "1.5rem" }}>Mesajlar</h1>
        <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", overflow: "hidden", display: "grid", gridTemplateColumns: "minmax(240px, 280px) 1fr", minHeight: 500 }}>
          <div style={{ borderRight: "0.5px solid #e5e5e5", overflowY: "auto" }}>
            {visibleConversations.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#999", fontSize: 13 }}>Henüz mesajınız yok</div>
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
                    borderBottom: "0.5px solid #f5f5f5",
                    cursor: "pointer",
                    border: "none",
                    borderBottomWidth: "0.5px",
                    borderBottomStyle: "solid",
                    borderBottomColor: "#f5f5f5",
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
          <div style={{ display: "flex", flexDirection: "column", minHeight: 500 }}>
            {receiverId ? (
              <>
                {activeOther && (
                  <div style={{ padding: "12px 16px", borderBottom: "0.5px solid #e5e5e5", fontWeight: 600, fontSize: 14 }}>
                    {activeOther.name}
                  </div>
                )}
                <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
                  {messages.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: m.senderId === me?.id ? "flex-end" : "flex-start", marginBottom: 10 }}>
                      <div style={{ background: m.senderId === me?.id ? "var(--brand)" : "#f5f5f5", color: m.senderId === me?.id ? "#fff" : "#1a1a1a", padding: "10px 14px", borderRadius: 12, fontSize: 14, maxWidth: "70%" }}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#999", padding: "2rem", fontSize: 13 }}>Mesaj göndererek sohbet başlatın</div>
                  )}
                </div>
                <div style={{ padding: "1rem", borderTop: "0.5px solid #e5e5e5", display: "flex", gap: 10 }}>
                  <input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                    style={{ flex: 1, padding: "10px 14px", border: "0.5px solid #e5e5e5", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                  />
                  <button type="button" onClick={sendMessage} disabled={sending}
                    style={{ padding: "10px 20px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                    Gönder
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14, padding: "2rem" }}>
                Soldan bir sohbet seçin
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
