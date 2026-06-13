"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Message { id: string; content: string; senderId: string; createdAt: string; sender: { name: string; avatar: string | null }; }
interface Conversation { id: string; content: string; senderId: string; receiverId: string; sender: { id: string; name: string; avatar: string | null }; receiver: { id: string; name: string; avatar: string | null }; listing: { id: string; title: string } | null; }

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

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (!d.user) router.push("/giris"); else setMe(d.user); });
    fetch("/api/messages").then((r) => r.json()).then((d) => setConversations(d.conversations || []));
  }, [router]);

  async function sendMessage() {
    if (!newMsg.trim() || !receiverId) return;
    setSending(true);
    const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiverId, content: newMsg, listingId }) });
    const data = await res.json();
    if (data.message) { setMessages((prev) => [...prev, data.message]); setNewMsg(""); }
    setSending(false);
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1.5rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, marginBottom: "1.5rem" }}>Mesajlar</h1>
        <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e5e5e5", overflow: "hidden", display: "grid", gridTemplateColumns: "280px 1fr", minHeight: 500 }}>
          <div style={{ borderRight: "0.5px solid #e5e5e5", overflowY: "auto" }}>
            {conversations.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#999", fontSize: 13 }}>Henüz mesajınız yok</div>
            ) : conversations.map((c) => {
              const other = c.senderId === me?.id ? c.receiver : c.sender;
              return (
                <div key={c.id} style={{ padding: "12px 14px", borderBottom: "0.5px solid #f5f5f5", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e63946", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                      {other.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{other.name}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>{c.content.slice(0, 30)}...</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
              {messages.map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: m.senderId === me?.id ? "flex-end" : "flex-start", marginBottom: 10 }}>
                  <div style={{ background: m.senderId === me?.id ? "#e63946" : "#f5f5f5", color: m.senderId === me?.id ? "#fff" : "#1a1a1a", padding: "10px 14px", borderRadius: 12, fontSize: 14, maxWidth: "70%" }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {receiverId && messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#999", padding: "2rem", fontSize: 13 }}>Mesaj göndererek sohbet başlatın</div>
              )}
            </div>
            {receiverId && (
              <div style={{ padding: "1rem", borderTop: "0.5px solid #e5e5e5", display: "flex", gap: 10 }}>
                <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Mesajınızı yazın..."
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  style={{ flex: 1, padding: "10px 14px", border: "0.5px solid #e5e5e5", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                <button onClick={sendMessage} disabled={sending}
                  style={{ padding: "10px 20px", background: "#e63946", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  Gönder
                </button>
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
