"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import { loginPath } from "@/lib/auth-url";

export default function IlanDetailFavorite({ listingId }: { listingId: string }) {
  const [favorited, setFavorited] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/favorites?listingId=${listingId}`)
      .then((r) => r.json())
      .then((d) => {
        setFavorited(!!d.favorited);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [listingId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      router.push(loginPath(`/ilan/${listingId}`));
      return;
    }

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setFavorited(data.favorited);
  }

  if (!ready) return null;

  return (
    <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
      <FavoriteButton active={favorited} onClick={toggle} size="md" />
    </div>
  );
}
